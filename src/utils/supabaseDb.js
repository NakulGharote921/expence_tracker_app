/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { supabase } from './supabase';

const mapRow = (u) => ({ ...u, user_id: undefined });

// ---- field mapping: app camelCase <-> DB snake_case -----------------------
const toSnake = (obj, pairs) => {
  if (!obj) return obj;
  const out = {};
  for (const [from, to] of pairs) {
    if (from in obj) out[to] = obj[from];
  }
  return out;
};
const fromSnake = (row, pairs) => {
  if (!row) return row;
  const out = {};
  for (const [dbCol, appKey] of pairs) {
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

  // ---- Transactions ----
  async hydrateTransactions(userId) {
    const res = await hydrateRows('transactions', userId);
    if (res.error || !res.data) return res;
    return { data: res.data.map((r) => fromSnake(r, TX_FIELD_PAIRS)), error: null };
  },
  async reconcileTransactions(userId, rows) {
    const mapped = (rows || []).map((t) => ({
      user_id: userId,
      ...toSnake(t, TX_FIELD_PAIRS),
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
};