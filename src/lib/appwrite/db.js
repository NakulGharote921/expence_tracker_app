import { TablesDB, Query, ID, Permission, Role } from 'appwrite';
import { client } from './client';

// Database and table IDs — must match the Appwrite Console setup.
// Each table needs a `user_id` key index for Query.equal() to work.
export const APPWRITE_DB_ID = 'wealth_flow';
export const TABLE_TRANSACTIONS = 'transactions';
export const TABLE_BUDGETS = 'budgets';
export const TABLE_CATEGORIES = 'categories';
export const TABLE_USER_PROFILES = 'user_profiles';

const td = new TablesDB(client);

const parseNum = (v, fallback) => {
    const n = parseFloat(v);
    return isNaN(n) ? fallback : n;
};

// ---- Error helpers ----

const errOf = (err) => ({
    status: err?.response?.status || err?.code,
    type: err?.type,
    message: err?.response?.message || err?.message || String(err),
    databaseId: APPWRITE_DB_ID,
});

export function logAppwriteError(op, tableId, err) {
    console.error(`[appwrite:${op}]`, { tableId, ...errOf(err) });
}

export function appwriteErrorMessage(err, fallback = 'Something went wrong while talking to Appwrite.') {
    const { status, message } = errOf(err);
    if (status === 404 || /not_found|database_not_found|table_not_found/i.test(message)) {
        return 'Appwrite table not found. Check your Database ID and Table IDs, then reload.';
    }
    if (status === 401) return 'Session expired. Please sign in again.';
    if (status === 403) return 'You do not have permission to access this data.';
    if (status === 400) return `Appwrite rejected the request: ${message}`;
    return fallback;
}

// ---- Load ----

export async function loadUserData(userId) {
    try {
        const perms = [Query.equal('user_id', userId)];
        const [txRes, budgetRes, catRes, profRes] = await Promise.all([
            td.listRows({ databaseId: APPWRITE_DB_ID, tableId: TABLE_TRANSACTIONS, queries: perms }),
            td.listRows({ databaseId: APPWRITE_DB_ID, tableId: TABLE_BUDGETS, queries: perms }),
            td.listRows({ databaseId: APPWRITE_DB_ID, tableId: TABLE_CATEGORIES, queries: perms }),
            td.listRows({ databaseId: APPWRITE_DB_ID, tableId: TABLE_USER_PROFILES, queries: perms }),
        ]);

        const transactions = (txRes.rows || []).map((r) => ({
            id: r.id || r.$id,
            name: r.expense_name || '',
            amount: parseNum(r.amount, 0),
            category: r.category || '',
            type: r.type || 'expense',
            description: r.description || undefined,
            date: r.transaction_date || '',
        }));

        const budgets = (budgetRes.rows || []).map((r) => ({
            category: r.category || '',
            limit: parseNum(r.limit, 0),
            spent: parseNum(r.spent, 0),
        }));

        const categories = {};
        (catRes.rows || []).forEach((r) => {
            categories[r.name || r.$id] = {
                name: r.name || '',
                color: r.color || '#666666',
                bgLight: '',
                iconName: r.icon_name || 'LayoutGrid',
            };
        });

        const profile = (profRes.rows || [])[0];

        // Nothing in the cloud yet → treat as first run (null so DashboardPage
        // seeds from localStorage instead of wiping state with empty arrays).
        // Profile existence alone is NOT "has data" — a lone profile row (e.g. from
        // the mount-time ensureProfile) must not cause a wipe of local seed data.
        const empty =
            !(txRes.rows || []).length &&
            !(budgetRes.rows || []).length &&
            !(catRes.rows || []).length;
        if (empty) return null;

        return {
            transactions,
            budgets,
            categories,
            totalBudgetLimit: profile ? parseNum(profile.total_budget_limit, 0) : 0,
            profileName: profile?.name || '',
            profileEmail: profile?.email || '',
            profileCurrency: profile?.currency || '',
        };
    } catch (err) {
        // Tables may not exist yet — fall back to null (DashboardPage uses localStorage).
        if (err?.code === 404 || /not_found|query_requires_index/i.test(err?.message || '')) return null;
        throw err;
    }
}

// ---- Profile (single row per user) ----

// Single source of truth for the row owner: always the user's Appwrite account id.
const userPerms = (userId) => [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
];

const profileData = (userId, values) => ({
    id: ID.unique(),
    user_id: userId,
    name: values.profileName || '',
    email: values.profileEmail || '',
    currency: values.profileCurrency || '',
    total_budget_limit: values.totalBudgetLimit ?? 0,
});

// In-flight guards: while a profile operation for a userId is running, any
// concurrent caller reuses the same promise instead of racing a second row.
// StrictMode double effects / overlapping persist calls can't create duplicates.
const profileOps = new Map();
const getUserProfile = async (userId) => {
    const res = await td.listRows({
        databaseId: APPWRITE_DB_ID,
        tableId: TABLE_USER_PROFILES,
        queries: [Query.equal('user_id', userId)],
    });
    return (res.rows || [])[0];
};

export async function getOrCreateProfile(userId, values = {}) {
    if (profileOps.has(userId)) return profileOps.get(userId);

    const op = (async () => {
        const existing = await getUserProfile(userId);
        if (existing) {
            // Update (never recreate) so the row keeps its id/permissions.
            const data = profileData(userId, values);
            delete data.id;
            return td.updateRow({
                databaseId: APPWRITE_DB_ID,
                tableId: TABLE_USER_PROFILES,
                rowId: existing.$id,
                data,
            });
        }
        return td.createRow({
            databaseId: APPWRITE_DB_ID,
            tableId: TABLE_USER_PROFILES,
            rowId: ID.unique(),
            data: profileData(userId, values),
            permissions: userPerms(userId),
        });
    })();

    profileOps.set(userId, op);
    try {
        return await op;
    } finally {
        profileOps.delete(userId);
    }
}

export async function updateProfile(userId, values = {}) {
    try {
        return await getOrCreateProfile(userId, values);
    } catch (err) {
        logAppwriteError('updateProfile', TABLE_USER_PROFILES, err);
        throw err;
    }
}

// ---- Save (full-sync per user) ----

const saveQueues = new Map();

async function syncTable(userId, tableId, rows) {
    // Upsert strategy: keep rows the user still has locally; delete only those
    // they removed; update rows whose `id` matches; create new ones.
    const localIds = new Set(rows.map(r => r.id).filter(Boolean));
    const existing = await td.listRows({
        databaseId: APPWRITE_DB_ID,
        tableId,
        queries: [Query.equal('user_id', userId)],
    });
    const existingRows = existing.rows || [];
    // Remove cloud rows for this user that are no longer in local state.
    for (const row of existingRows) {
        if (!localIds.has(row.id)) {
            await td.deleteRow({ databaseId: APPWRITE_DB_ID, tableId, rowId: row.$id });
        }
    }
    // Upsert local rows.
    for (const data of rows) {
        const match = existingRows.find(r => r.id === data.id);
        if (match) {
            await td.updateRow(APPWRITE_DB_ID, tableId, match.$id, { ...data, user_id: userId }, userPerms(userId));
        } else {
            await td.createRow({
                databaseId: APPWRITE_DB_ID,
                tableId,
                rowId: ID.unique(),
                data: { ...data, user_id: userId },
                permissions: userPerms(userId),
            });
        }
    }
}

export async function saveUserData(userId, data) {
    // Serialize full-sync writes per user so two overlapping calls (StrictMode
    // double effects, autosave racing a pending seed) can never interleave the
    // delete-then-recreate sync and leave duplicate rows.
    const prev = saveQueues.get(userId) || Promise.resolve();
    const run = prev.then(() => rawSaveUserData(userId, data));
    saveQueues.set(userId, run.catch(() => {}));
    return run;
}

async function rawSaveUserData(userId, data) {
    const transactions = (data.transactions || []).map((tx) => ({
        user_id: userId,
        id: tx.id || '',
        expense_name: tx.name || '',
        amount: tx.amount ?? 0,
        category: tx.category || '',
        type: tx.type || 'expense',
        description: tx.description || '',
        transaction_date: tx.date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
    }));

    const budgets = (data.budgets || []).map((b) => ({
        id: ID.unique(),
        user_id: userId,
        category: b.category || '',
        limit: b.limit ?? 0,
        spent: b.spent ?? 0,
    }));

    const categories = Object.values(data.categories || {}).map((c) => ({
        id: ID.unique(),
        user_id: userId,
        name: c.name || '',
        color: c.color || '',
        icon_name: c.iconName || '',
    }));

    // Upsert the single profile row (creates once, then updates — never a second row).
    await getOrCreateProfile(userId, {
        profileName: data.profileName,
        profileEmail: data.profileEmail,
        profileCurrency: data.profileCurrency,
        totalBudgetLimit: data.totalBudgetLimit ?? 0,
    });

    // Sync the other 3 tables in parallel
    await Promise.all([
        syncTable(userId, TABLE_TRANSACTIONS, transactions),
        syncTable(userId, TABLE_BUDGETS, budgets),
        syncTable(userId, TABLE_CATEGORIES, categories),
    ]);
}