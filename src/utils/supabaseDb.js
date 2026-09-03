/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { supabase } from './supabase';

const mapRow = (u) => ({ ...u, user_id: undefined });

// Humanize a notification timestamp for display (e.g. "Just now", "2h ago").
function formatNotifTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (diff < 60_000) return 'Just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ---- field mapping: app camelCase <-> DB snake_case -----------------------
const toSnake = (obj, pairs) => {
  if (!obj) return obj;
  const out = {};
  for (const [from, to] of pairs) {
    if (from in obj) out[to] = obj[from];
  }
  return out;
};
// Convert a DB row into an app object.
// Pairs are [appKey, dbCol] (same convention as toSnake / the *_FIELD_PAIRS lists).
// Here we read from the DB column (row[dbCol]) and write to the app key (out[appKey]).
const fromSnake = (row, pairs) => {
  if (!row) return row;
  const out = {};
  for (const [appKey, dbCol] of pairs) {
    if (dbCol in row) out[appKey] = row[dbCol];
  }
  return out;
};

const TX_FIELD_PAIRS = [
  ['id', 'id'],
  ['name', 'name'],
  ['amount', 'amount'],
  ['category', 'category'],
  ['type', 'type'],
  ['description', 'description'],
  ['paymentMethod', 'payment_method'],
  ['date', 'date'],
  ['source', 'source'],
  ['aiConfidence', 'ai_confidence'],
];

const SUB_FIELD_PAIRS = [
  ['id', 'id'],
  ['name', 'name'],
  ['description', 'description'],
  ['category', 'category'],
  ['amount', 'amount'],
  ['currency', 'currency'],
  ['billingCycle', 'billing_cycle'],
  ['startDate', 'start_date'],
  ['nextBillingDate', 'next_billing_date'],
  ['paymentMethod', 'payment_method'],
  ['status', 'status'],
  ['reminderDays', 'reminder_days'],
  ['createdAt', 'created_at'],
  ['updatedAt', 'updated_at'],
];

// ---------------------------------------------------------------------------
// Categories (object of { color, icon } keyed by name <-> table rows)
// ---------------------------------------------------------------------------
export function categoriesToRows(userId, categoriesObj) {
  return Object.entries(categoriesObj || {}).map(([name, def]) => ({
    user_id: userId,
    name,
    color: def?.color || null,
    bg_light: def?.bgLight || null,
    icon_name: def?.iconName || null,
  }));
}

export function rowsToCategories(rows) {
  const out = {};
  (rows || []).forEach((r) => {
    out[r.name] = {
      name: r.name,
      color: r.color,
      bgLight: r.bg_light,
      iconName: r.icon_name,
    };
  });
  return out;
}

// ---------------------------------------------------------------------------
// Generic reconciliation: upsert the local rows (keyed by `idField`) then
// delete any server rows for this user that are no longer present locally.
// ---------------------------------------------------------------------------
async function reconcileRows(table, userId, rows, { idField = 'id', keyField = idField, withUserId = true } = {}) {
  if (!rows) return { data: rows, error: null };

  const upsertRows = rows.map((r) => {
    if (!withUserId) return { ...r };
    const out = { ...r };
    delete out.user_id;
    out.user_id = userId;
    return out;
  });

  if (upsertRows.length) {
    const { error: upsertErr } = await supabase.from(table).upsert(upsertRows, { onConflict: keyField });
    if (upsertErr) return { data: rows, error: upsertErr };
  }

  const localKeys = rows.map((r) => r[keyField]).filter((k) => k != null);
  const { data: serverRows, error: selErr } = await supabase
    .from(table)
    .select(idField)
    .eq('user_id', userId);
  if (selErr) return { data: rows, error: selErr };

  const toDelete = (serverRows || [])
    .map((r) => r[idField])
    .filter((k) => !localKeys.includes(k));
  if (toDelete.length) {
    const { error: delErr } = await supabase.from(table).delete().in(idField, toDelete);
    if (delErr) return { data: rows, error: delErr };
  }

  return { data: rows, error: null };
}

async function hydrateRows(table, userId, keyField /* kept for clarity */) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId);
  if (error) return { data: null, error };
  return { data: (data || []).map(mapRow), error: null };
}

// Cache for AI column detection (true/false/null=not yet checked)
let _aiColumnsCache = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const supabaseDb = {
  // ---- Auth ----
  getSession: () => supabase.auth.getSession(),
  getCurrentUser: () => supabase.auth.getUser(),
  signInEmail: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signUpEmail: (email, password) => supabase.auth.signUp({ email, password }),
  signInGoogle: () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: import.meta.env.VITE_APP_URL || window.location.origin,
    },
  }),
  signOut: () => supabase.auth.signOut(),
  onAuthStateChange: (cb) => supabase.auth.onAuthStateChange(cb),
  // Persist display/edit data to Supabase auth user metadata.
  updateUserMeta: (meta) => supabase.auth.updateUser({ data: meta }),

  // ---- Transactions ----
  async hydrateTransactions(userId) {
    const res = await hydrateRows('transactions', userId);
    if (res.error || !res.data) return res;
    return { data: res.data.map((r) => fromSnake(r, TX_FIELD_PAIRS)), error: null };
  },
  // Detect whether the AI metadata columns exist in the DB already.
  // Uses select('*') so PostgREST never 400s on a missing column.
  async aiColumnsExist() {
    if (_aiColumnsCache !== null) return _aiColumnsCache;
    const { data } = await supabase.from('transactions').select('*').limit(1);
    _aiColumnsCache = !!(data && data.length > 0 && 'source' in data[0]);
    return _aiColumnsCache;
  },
  async reconcileTransactions(userId, rows) {
    // Only include source/ai_confidence if the columns exist in the database.
    const aiOk = await this.aiColumnsExist();
    const pairs = aiOk ? TX_FIELD_PAIRS : TX_FIELD_PAIRS.filter(([from]) => from !== 'source' && from !== 'aiConfidence');
    const mapped = (rows || []).map((t) => ({
      user_id: userId,
      ...toSnake(t, pairs),
    }));
    return reconcileRows('transactions', userId, mapped, { idField: 'id', keyField: 'id', withUserId: false });
  },

  // ---- Budgets (keyed by user_id+category) ----
  async hydrateBudgets(userId) {
    const res = await hydrateRows('budgets', userId);
    if (res.error || !res.data) return res;
    return {
      data: res.data.map((r) => ({
        category: r.category,
        limit: r.limit_amount,
        spent: r.spent,
      })),
      error: null,
    };
  },
  async reconcileBudgets(userId, rows) {
    const data = (rows || []).map((r) => ({
      user_id: userId,
      category: r.category,
      limit_amount: r.limit,
      spent: r.spent,
    }));
    let error = null;

    if (data.length) {
      const { error: upsertErr } = await supabase
        .from('budgets')
        .upsert(data, { onConflict: 'user_id,category' });
      if (upsertErr) return { data: rows, error: upsertErr };
    }

    const localKeys = data.map((r) => r.category).filter((k) => k != null);
    const { data: serverRows, error: selErr } = await supabase
      .from('budgets')
      .select('category')
      .eq('user_id', userId);
    if (selErr) return { data: rows, error: selErr };

    const toDelete = (serverRows || [])
      .map((r) => r.category)
      .filter((k) => !localKeys.includes(k));
    if (toDelete.length) {
      const { error: delErr } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', userId)
        .in('category', toDelete);
      if (delErr) return { data: rows, error: delErr };
    }

    return { data: rows, error };
  },

  // ---- Categories (keyed by user_id+name) ----
  async hydrateCategories(userId) {
    const res = await hydrateRows('categories', userId);
    if (res.error || !res.data) return res;
    return { data: rowsToCategories(res.data), error: null };
  },
  async reconcileCategories(userId, categoriesObj) {
    const rows = categoriesToRows(userId, categoriesObj);
    let error = null;

    if (rows.length) {
      const { error: upsertErr } = await supabase
        .from('categories')
        .upsert(rows, { onConflict: 'user_id,name' });
      if (upsertErr) return { data: categoriesObj, error: upsertErr };
    }

    const localNames = rows.map((r) => r.name);
    const { data: serverRows, error: selErr } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', userId);
    if (selErr) return { data: categoriesObj, error: selErr };

    const toDelete = (serverRows || [])
      .map((r) => r.name)
      .filter((k) => !localNames.includes(k));
    if (toDelete.length) {
      const { error: delErr } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', userId)
        .in('name', toDelete);
      if (delErr) return { data: categoriesObj, error: delErr };
    }

    return { data: categoriesObj, error };
  },

  // ---- Subscriptions ----
  async hydrateSubscriptions(userId) {
    const res = await hydrateRows('subscriptions', userId);
    if (res.error || !res.data) return res;
    return { data: res.data.map((r) => fromSnake(r, SUB_FIELD_PAIRS)), error: null };
  },
  async reconcileSubscriptions(userId, rows) {
    const mapped = (rows || []).map((r) => ({
      user_id: userId,
      ...toSnake(r, SUB_FIELD_PAIRS),
    }));
    return reconcileRows('subscriptions', userId, mapped, { idField: 'id', keyField: 'id', withUserId: false });
  },

  // ---- Profile ----
  async hydrateProfile(userId, fallback) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) return { data: fallback, error };
    if (!data) {
      const { data: seed, error: insErr } = await supabase
        .from('profiles')
        .insert({ id: userId })
        .select()
        .maybeSingle();
      if (insErr) return { data: fallback, error: insErr };
      return { data: seed, error: null };
    }
    return { data, error: null };
  },
  async updateProfile(userId, patch) {
    return supabase.from('profiles').update(patch).eq('id', userId).select().maybeSingle();
  },

  // ---- Notifications ----
  // Map a server notification row into the shape the UI components expect.
  mapNotificationRow(row) {
    return {
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type,
      read: row.is_read,
      time: formatNotifTime(row.created_at),
      createdAt: row.created_at,
      relatedId: row.related_id,
      relatedType: row.related_type,
    };
  },
  async hydrateNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error('Failed to load notifications:', error);
      return { data: null, error };
    }
    return { data: (data || []).map((r) => this.mapNotificationRow(r)), error: null };
  },
  // Insert a notification after de-duplicating against an existing unread one
  // with the same (related_type, related_id). Returns { inserted, notification, error }.
  async createNotification(userId, { title, message, type = 'info', relatedId = null, relatedType = null }) {
    if (!relatedId) {
      const { data, error } = await supabase
        .from('notifications')
        .insert({ user_id: userId, title, message, type, related_id: relatedId, related_type: relatedType })
        .select()
        .single();
      return {
        inserted: !error && !!data,
        notification: data ? this.mapNotificationRow(data) : null,
        error,
      };
    }
    // Deduplicate: skip if there is already an unread notification for this event.
    const { data: existing, error: checkErr } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('related_type', relatedType)
      .eq('related_id', relatedId)
      .eq('is_read', false)
      .limit(1);
    if (checkErr) return { inserted: false, notification: null, error: checkErr };
    if (existing && existing.length > 0) return { inserted: false, notification: null, error: null };

    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, title, message, type, related_id: relatedId, related_type: relatedType })
      .select()
      .single();
    return {
      inserted: !error && !!data,
      notification: data ? this.mapNotificationRow(data) : null,
      error,
    };
  },
  async markNotificationRead(userId, id) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('id', id);
    if (error) console.error('Failed to mark notification read:', error);
    return { error };
  },
  async markAllNotificationsRead(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select('id');
    if (error) console.error('Failed to mark all notifications read:', error);
    return { data, error };
  },
  // Subscribe to live INSERT/UPDATE changes for this user's notifications.
  subscribeNotifications(userId, onChange) {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          if (payload.eventType === 'INSERT') {
            onChange('insert', this.mapNotificationRow(row));
          } else if (payload.eventType === 'UPDATE') {
            onChange('update', this.mapNotificationRow(row));
          }
        }
      )
      .subscribe();
    return channel;
  },
  unsubscribeNotifications(channel) {
    if (channel) supabase.removeChannel(channel);
  },
};