/**
 * Subscription Tracker — main view component.
 *
 * Provides: stats cards, add/edit form modal, subscription list, upcoming
 * payments, filters, analytics, and all CRUD actions (pause/resume/cancel/delete).
 *
 * Expects Appwrite CRUD callbacks from DashboardPage:
 *   onAddSubscription(sub) → creates in Appwrite, returns created sub
 *   onUpdateSubscription(id, sub) → updates in Appwrite
 *   onDeleteSubscription(id) → deletes from Appwrite
 */
import React, { useState, useMemo } from 'react';
import {
  Search, Plus, X, Check, Trash2, Pause, Play, Calendar, DollarSign,
  CreditCard, Clock, Filter, Download, BarChart3, ChevronDown, ChevronUp,
  AlertTriangle, TrendingUp, Star, Edit2, ArrowUpDown, Repeat,
} from 'lucide-react';
import {
  SUBSCRIPTION_CATEGORIES, BILLING_CYCLES, SUBSCRIPTION_STATUSES,
  PAYMENT_METHODS, CURRENCIES, CURRENCY_SYMBOLS,
} from '../mockData';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const todayStr = () => new Date().toISOString().split('T')[0];

const daysBetween = (a, b) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
};

const fmtCurrency = (amt, cur = 'INR') => {
  const sym = CURRENCY_SYMBOLS[cur] || '\u20B9';
  return `${sym}${amt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

/** Normalize any billing cycle to a monthly equivalent cost. */
const monthlyEquivalent = (amount, cycle) => {
  const a = Number(amount) || 0;
  switch (cycle) {
    case 'Weekly':      return a * (52 / 12);
    case 'Monthly':     return a;
    case 'Quarterly':   return a / 3;
    case 'Half-Yearly': return a / 6;
    case 'Yearly':      return a / 12;
    default:            return a;
  }
};

const yearlyEquivalent = (amount, cycle) => monthlyEquivalent(amount, cycle) * 12;

const statusColor = (s) => {
  if (s === 'Active')    return 'text-emerald-700 bg-emerald-50 border-emerald-300';
  if (s === 'Paused')    return 'text-amber-700 bg-amber-50 border-amber-300';
  return 'text-red-700 bg-red-50 border-red-300';
};

const cycleIcon = (c) => {
  if (c === 'Weekly')      return 'W';
  if (c === 'Monthly')     return 'M';
  if (c === 'Quarterly')   return 'Q';
  if (c === 'Half-Yearly') return 'H';
  return 'Y';
};

/** Category → lucide icon name (used for display). */
const CATEGORY_ICONS = {
  Entertainment: 'Tv', Music: 'Music', Streaming: 'Play', Software: 'Code',
  'Cloud Storage': 'Cloud', Education: 'GraduationCap', Fitness: 'Dumbbell',
  Gaming: 'Gamepad2', News: 'Newspaper', Productivity: 'Briefcase',
  Shopping: 'ShoppingBag', Other: 'MoreHorizontal',
};

/** Auto-calculate reminder days from start_date and next_billing_date. */
const autoReminderDays = (startDate, nextBillingDate) => {
  if (!startDate || !nextBillingDate) return 3;
  const diff = daysBetween(startDate, nextBillingDate);
  if (diff <= 0) return 3;
  if (diff <= 7)  return 1;   // weekly → remind 1 day before
  if (diff <= 35) return 3;   // monthly → remind 3 days before
  if (diff <= 100) return 7;  // quarterly → remind 7 days before
  if (diff <= 200) return 14; // half-yearly → remind 14 days before
  return 30;                  // yearly → remind 30 days before
};

// ---------------------------------------------------------------------------
// Empty Form State
// ---------------------------------------------------------------------------

const emptyForm = () => ({
  name: '', description: '', category: 'Entertainment', amount: '',
  currency: 'INR', billingCycle: 'Monthly', startDate: todayStr(),
  nextBillingDate: '', paymentMethod: '', status: 'Active',
  reminderEnabled: false, reminderDays: 3, notes: '',
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SubscriptionsTab({ subscriptions, onAdd, onUpdate, onDelete }) {
  // ── Local state ──
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterCycle, setFilterCycle] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('nextBillingDate');
  const [sortDir, setSortDir] = useState('asc');
  const [confirmAction, setConfirmAction] = useState(null); // { type, id, label }
  const [toast, setToast] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list | calendar

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ── Derived data ──
  const subs = subscriptions || [];

  const activeSubs = useMemo(() => subs.filter(s => s.status === 'Active'), [subs]);
  const pausedSubs = useMemo(() => subs.filter(s => s.status === 'Paused'), [subs]);
  const cancelledSubs = useMemo(() => subs.filter(s => s.status === 'Cancelled'), [subs]);

  const monthlyCost = useMemo(() =>
    activeSubs.reduce((sum, s) => sum + monthlyEquivalent(s.amount, s.billingCycle), 0),
    [activeSubs]);

  const yearlyCost = useMemo(() =>
    activeSubs.reduce((sum, s) => sum + yearlyEquivalent(s.amount, s.billingCycle), 0),
    [activeSubs]);

  const upcoming = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return activeSubs
      .map(s => {
        const d = daysBetween(today.toISOString().split('T')[0], s.nextBillingDate);
        return { ...s, daysUntil: d };
      })
      .filter(s => s.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [activeSubs]);

  const topSubs = useMemo(() =>
    [...activeSubs]
      .sort((a, b) => monthlyEquivalent(b.amount, b.billingCycle) - monthlyEquivalent(a.amount, a.billingCycle))
      .slice(0, 5),
    [activeSubs]);

  const categorySpending = useMemo(() => {
    const map = {};
    activeSubs.forEach(s => {
      const cat = s.category || 'Other';
      map[cat] = (map[cat] || 0) + monthlyEquivalent(s.amount, s.billingCycle);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [activeSubs]);

  const paymentMethodSpending = useMemo(() => {
    const map = {};
    activeSubs.forEach(s => {
      const pm = s.paymentMethod || 'Other';
      map[pm] = (map[pm] || 0) + monthlyEquivalent(s.amount, s.billingCycle);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [activeSubs]);

  // Potential savings: average cost of paused + cancelled subs that were recently active
  const potentialSavings = useMemo(() => {
    const recentlyCancelled = [...pausedSubs, ...cancelledSubs];
    if (recentlyCancelled.length < 2) return 0;
    const avg = recentlyCancelled.reduce((s, sub) => s + monthlyEquivalent(sub.amount, sub.billingCycle), 0) / recentlyCancelled.length;
    return avg * 2;
  }, [pausedSubs, cancelledSubs]);

  // ── Filter + sort pipeline ──
  const filtered = useMemo(() => {
    let list = [...subs];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.notes || '').toLowerCase().includes(q));
    }
    if (filterCat !== 'All')       list = list.filter(s => s.category === filterCat);
    if (filterCycle !== 'All')     list = list.filter(s => s.billingCycle === filterCycle);
    if (filterPayment !== 'All')   list = list.filter(s => s.paymentMethod === filterPayment);
    if (filterStatus !== 'All')    list = list.filter(s => s.status === filterStatus);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name')          cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'amount')   cmp = monthlyEquivalent(a.amount, a.billingCycle) - monthlyEquivalent(b.amount, b.billingCycle);
      else if (sortBy === 'nextBillingDate') cmp = new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
      else if (sortBy === 'added')    cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [subs, search, filterCat, filterCycle, filterPayment, filterStatus, sortBy, sortDir]);

  // ── Form helpers ──
  const set = (key, val) => {
    setForm(f => {
      const next = { ...f, [key]: val };
      // Auto-calculate reminder_days when dates change
      if (key === 'startDate' || key === 'nextBillingDate') {
        next.reminderDays = autoReminderDays(
          key === 'startDate' ? val : f.startDate,
          key === 'nextBillingDate' ? val : f.nextBillingDate
        );
      }
      return next;
    });
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name = 'Required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Must be > 0';
    if (!form.billingCycle)         e.billingCycle = 'Required';
    if (!form.startDate)            e.startDate = 'Required';
    if (!form.nextBillingDate)      e.nextBillingDate = 'Required';
    if (!form.paymentMethod)        e.paymentMethod = 'Required';
    if (!form.currency)             e.currency = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitForm = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      amount: Number(form.amount),
      reminderDays: Number(form.reminderDays) || 3,
      createdAt: editingId ? (subs.find(s => s.id === editingId)?.createdAt || todayStr()) : todayStr(),
    };
    if (editingId) {
      onUpdate(editingId, payload);
      showToast('Subscription updated!');
    } else {
      // Duplicate check
      const dup = subs.find(s => s.name.toLowerCase() === form.name.trim().toLowerCase() && s.status === 'Active');
      if (dup) {
        setErrors({ name: 'You already have an active subscription with this name.' });
        return;
      }
      onAdd(payload);
      showToast('Subscription added!');
    }
    closeForm();
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm()); setErrors({}); };

  const openEdit = (sub) => {
    setEditingId(sub.id);
    setForm({
      name: sub.name, description: sub.description || '', category: sub.category,
      amount: sub.amount, currency: sub.currency || 'INR', billingCycle: sub.billingCycle,
      startDate: sub.startDate, nextBillingDate: sub.nextBillingDate,
      paymentMethod: sub.paymentMethod, status: sub.status,
      reminderEnabled: sub.reminderEnabled, reminderDays: sub.reminderDays || 3,
      notes: sub.notes || '',
    });
    setShowForm(true);
  };

  // ── Actions ──
  const handlePause = (sub) => {
    onUpdate(sub.id, { ...sub, status: 'Paused', updatedAt: todayStr() });
    showToast('Subscription paused.');
    setConfirmAction(null);
  };
  const handleResume = (sub) => {
    onUpdate(sub.id, { ...sub, status: 'Active', updatedAt: todayStr() });
    showToast('Subscription resumed.');
    setConfirmAction(null);
  };
  const handleCancel = (sub) => {
    onUpdate(sub.id, { ...sub, status: 'Cancelled', updatedAt: todayStr() });
    showToast('Subscription cancelled.');
    setConfirmAction(null);
  };
  const handleDelete = (sub) => {
    onDelete(sub.id);
    showToast('Subscription deleted.');
    setConfirmAction(null);
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  // ── Calendar data (simple month grid) ──
  const calendarMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const matching = activeSubs.filter(s => s.nextBillingDate === dateStr);
      cells.push({ day: d, dateStr, subs: matching });
    }
    return cells;
  }, [activeSubs]);

  // ── CSV export ──
  const exportCSV = () => {
    const headers = ['Name','Category','Amount','Currency','Billing Cycle','Start Date','Next Billing Date','Payment Method','Status','Monthly Equivalent','Description','Notes'];
    const rows = filtered.map(s => [
      `"${s.name}"`, s.category, s.amount, s.currency, s.billingCycle,
      s.startDate, s.nextBillingDate, s.paymentMethod, s.status,
      monthlyEquivalent(s.amount, s.billingCycle).toFixed(2),
      `"${s.description || ''}"`, `"${s.notes || ''}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `WealthFlow_Subscriptions.csv`;
    a.click();
  };

  // ── Render ──
  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#141414] text-white text-xs font-mono font-bold px-4 py-3 rounded-none border border-[#F27D26] shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border-2 border-[#141414] rounded-none max-w-sm w-full p-6 space-y-4 shadow-[6px_6px_0px_0px_#141414]">
            <div className="flex items-center gap-2 text-[#141414]">
              <AlertTriangle className="w-5 h-5 text-[#F27D26]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Are you sure?</span>
            </div>
            <p className="text-sm font-bold text-[#141414]">
              {confirmAction.type === 'delete' && 'Delete this subscription permanently? This cannot be undone.'}
              {confirmAction.type === 'cancel' && 'Are you sure you want to cancel this subscription?'}
              {confirmAction.type === 'pause' && 'Pause this subscription?'}
              {confirmAction.type === 'resume' && 'Resume this subscription?'}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 border border-[#141414] text-[#141414] text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#EBEBE4] rounded-none transition-all cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => {
                  const sub = subs.find(s => s.id === confirmAction.id);
                  if (confirmAction.type === 'delete')  handleDelete(sub);
                  if (confirmAction.type === 'cancel')  handleCancel(sub);
                  if (confirmAction.type === 'pause')   handlePause(sub);
                  if (confirmAction.type === 'resume')  handleResume(sub);
                }}
                className={`px-4 py-2 border text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer ${
                  confirmAction.type === 'delete' ? 'bg-red-600 border-red-600 hover:bg-red-700'
                    : 'bg-[#141414] border-[#141414] hover:bg-[#F27D26]'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────── HEADER ──────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#141414]/15 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-semibold text-[#141414] tracking-tight">
            Subscriptions
          </h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#141414]/60 mt-2">
            Track your recurring payments and where your money goes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportCSV} className="bg-[#EBEBE4] hover:bg-white text-[#141414] border border-[#141414] rounded-none py-2 px-4 transition-all text-[10px] font-mono tracking-widest font-bold uppercase cursor-pointer flex items-center gap-2">
            <Download className="w-3.5 h-3.5"/> Export CSV
          </button>
          <button onClick={() => { setViewMode(v => v === 'list' ? 'calendar' : 'list'); }} className="bg-[#EBEBE4] hover:bg-white text-[#141414] border border-[#141414] rounded-none py-2 px-4 transition-all text-[10px] font-mono tracking-widest font-bold uppercase cursor-pointer flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5"/> {viewMode === 'list' ? 'CALENDAR' : 'LIST'}
          </button>
          <button onClick={() => { setForm(emptyForm()); setEditingId(null); setErrors({}); setShowForm(true); }}
            className="bg-[#141414] text-white hover:bg-[#F27D26] border border-[#141414] rounded-none py-2 px-4 transition-all text-[10px] font-mono tracking-widest font-bold uppercase cursor-pointer flex items-center gap-2">
            <Plus className="w-3.5 h-3.5"/> + Add Subscription
          </button>
        </div>
      </div>

      {/* ──────────────────── STATS CARDS ──────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: subs.length, icon: Repeat, accent: false },
          { label: 'Active', value: activeSubs.length, icon: Check, accent: true },
          { label: 'Monthly Cost', value: fmtCurrency(monthlyCost), icon: DollarSign, accent: false },
          { label: 'Yearly Cost', value: fmtCurrency(yearlyCost), icon: TrendingUp, accent: false },
          { label: 'Upcoming (30d)', value: upcoming.filter(s => s.daysUntil <= 30).length + ' soon', icon: Clock, accent: false },
        ].map((card, i) => (
          <div key={i} className={`bg-white border border-[#141414] p-4 rounded-none hover:shadow-[3px_3px_0px_0px_#141414] transition-all ${card.accent ? 'border-l-4 border-l-[#F27D26]' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon className="w-3.5 h-3.5 text-[#F27D26]" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60">{card.label}</span>
            </div>
            <p className="text-lg font-mono font-extrabold text-[#141414]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ──────────────────── UPCOMING PAYMENTS ──────────────────── */}
      {upcoming.length > 0 && (
        <div className="bg-white border border-[#141414] rounded-none overflow-hidden">
          <div className="px-4 py-3 bg-[#EBEBE4] border-b border-[#141414] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F27D26]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#141414]">Upcoming Payments</span>
          </div>
          <div className="p-3 flex gap-3 overflow-x-auto">
            {upcoming.slice(0, 8).map(s => (
              <div key={s.id} className={`shrink-0 w-40 p-3 border border-[#141414]/15 rounded-none ${s.daysUntil === 0 ? 'bg-red-50 border-red-300' : s.daysUntil <= 3 ? 'bg-amber-50 border-amber-300' : 'bg-white'}`}>
                <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#141414]/60 mb-1">
                  {s.daysUntil === 0 ? 'DUE TODAY' : s.daysUntil === 1 ? 'DUE TOMORROW' : `DUE IN ${s.daysUntil} DAYS`}
                </p>
                <p className="text-xs font-bold text-[#141414] truncate">{s.name}</p>
                <p className="text-xs font-mono font-bold text-[#F27D26] mt-0.5">{fmtCurrency(s.amount, s.currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────── FILTERS ──────────────────── */}
      <div className="bg-white p-4 rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] transition-all grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
        <div className="relative md:col-span-2">
          <Search className="w-3.5 h-3.5 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subscriptions..." className="w-full pl-9 pr-4 py-2 bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none outline-none transition-all placeholder:text-[#141414]/40" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="bg-[#EBEBE4] border border-[#141414] rounded-none py-2 px-2 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
          <option value="All">All Categories</option>
          {SUBSCRIPTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterCycle} onChange={e => setFilterCycle(e.target.value)} className="bg-[#EBEBE4] border border-[#141414] rounded-none py-2 px-2 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
          <option value="All">All Cycles</option>
          {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} className="bg-[#EBEBE4] border border-[#141414] rounded-none py-2 px-2 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
          <option value="All">All Payment</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#EBEBE4] border border-[#141414] rounded-none py-2 px-2 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
          <option value="All">All Status</option>
          {SUBSCRIPTION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* ──────────────────── FORM MODAL ──────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border-2 border-[#141414] rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-[6px_6px_0px_0px_#141414]">
            <div className="flex justify-between items-center pb-3 border-b border-[#141414]/15">
              <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-[#141414] flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[#F27D26]" />
                {editingId ? 'Edit Subscription' : 'New Subscription'}
              </span>
              <button onClick={closeForm} className="text-[#141414]/60 hover:text-[#141414] text-xs font-mono font-bold tracking-wider cursor-pointer">[✕ CLOSE]</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Name *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Netflix, Spotify, etc." className={`w-full bg-[#EBEBE4] border ${errors.name ? 'border-red-500' : 'border-[#141414]'} focus:bg-white rounded-none py-2 px-3 text-xs font-semibold outline-none transition-all placeholder:text-[#141414]/30`} />
                {errors.name && <p className="text-[10px] text-red-600 mt-1 font-bold">{errors.name}</p>}
              </div>
              {/* Category */}
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-[#EBEBE4] border border-[#141414] rounded-none py-2.5 px-3 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
                  {SUBSCRIPTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Description */}
              <div className="md:col-span-3">
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Description <span className="normal-case text-[#F27D26]">(optional)</span></label>
                <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What's this subscription for?" className="w-full bg-[#EBEBE4] border border-[#141414] focus:bg-white rounded-none py-2 px-3 text-xs font-semibold outline-none transition-all placeholder:text-[#141414]/30" />
              </div>
              {/* Amount + Currency */}
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Amount *</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="649" className={`w-full bg-[#EBEBE4] border ${errors.amount ? 'border-red-500' : 'border-[#141414]'} focus:bg-white rounded-none py-2 px-3 text-xs font-semibold font-mono outline-none transition-all placeholder:text-[#141414]/30`} />
                {errors.amount && <p className="text-[10px] text-red-600 mt-1 font-bold">{errors.amount}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Currency *</label>
                <select value={form.currency} onChange={e => set('currency', e.target.value)} className="w-full bg-[#EBEBE4] border border-[#141414] rounded-none py-2.5 px-3 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
                  {CURRENCIES.map(c => <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Billing Cycle *</label>
                <select value={form.billingCycle} onChange={e => set('billingCycle', e.target.value)} className={`w-full bg-[#EBEBE4] border ${errors.billingCycle ? 'border-red-500' : 'border-[#141414]'} rounded-none py-2.5 px-3 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]`}>
                  {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.billingCycle && <p className="text-[10px] text-red-600 mt-1 font-bold">{errors.billingCycle}</p>}
              </div>
              {/* Dates */}
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Start Date *</label>
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={`w-full bg-[#EBEBE4] border ${errors.startDate ? 'border-red-500' : 'border-[#141414]'} rounded-none py-2 px-3 text-xs font-semibold font-mono outline-none`} />
                {errors.startDate && <p className="text-[10px] text-red-600 mt-1 font-bold">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Next Billing Date *</label>
                <input type="date" value={form.nextBillingDate} onChange={e => set('nextBillingDate', e.target.value)} className={`w-full bg-[#EBEBE4] border ${errors.nextBillingDate ? 'border-red-500' : 'border-[#141414]'} rounded-none py-2 px-3 text-xs font-semibold font-mono outline-none`} />
                {errors.nextBillingDate && <p className="text-[10px] text-red-600 mt-1 font-bold">{errors.nextBillingDate}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">How do you pay? *</label>
                <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} className={`w-full bg-[#EBEBE4] border ${errors.paymentMethod ? 'border-red-500' : 'border-[#141414]'} rounded-none py-2.5 px-3 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]`}>
                  <option value="">Select payment method</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.paymentMethod && <p className="text-[10px] text-red-600 mt-1 font-bold">{errors.paymentMethod}</p>}
              </div>
              {/* Status */}
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full bg-[#EBEBE4] border border-[#141414] rounded-none py-2.5 px-3 text-xs font-bold uppercase tracking-wider outline-none text-[#141414]">
                  {SUBSCRIPTION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Reminder */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">
                    Remind me before (days)
                  </label>
                  <input type="number" min="0" max="30" value={form.reminderDays} onChange={e => set('reminderDays', e.target.value)} className="w-full bg-[#EBEBE4] border border-[#141414] rounded-none py-2 px-3 text-xs font-semibold font-mono outline-none" />
                </div>
              </div>
              {/* Notes */}
              <div className="md:col-span-3">
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#141414]/60 mb-1.5">Notes <span className="normal-case text-[#F27D26]">(optional)</span></label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any extra details..." className="w-full bg-[#EBEBE4] border border-[#141414] focus:bg-white rounded-none py-2 px-3 text-xs font-semibold outline-none transition-all resize-none placeholder:text-[#141414]/30" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#141414]/10">
              <button onClick={closeForm} className="text-xs font-mono font-bold text-[#141414]/60 hover:text-[#141414] py-2 px-4 rounded-none transition-all cursor-pointer border border-transparent hover:border-[#141414]/10">Cancel</button>
              <button onClick={submitForm} className="bg-[#141414] hover:bg-[#F27D26] text-white border border-[#141414] text-xs font-mono font-bold uppercase tracking-widest py-2 px-6 rounded-none transition-all cursor-pointer">
                {editingId ? 'Save Changes' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────── SUBSCRIPTION LIST ──────────────────── */}
      <div className="bg-white rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] transition-all overflow-hidden">
        {/* Sort bar */}
        <div className="px-4 py-2.5 bg-[#EBEBE4] border-b border-[#141414] flex flex-wrap items-center gap-3">
          <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-[0.15em]">Sort by:</span>
          {[
            { key: 'nextBillingDate', label: 'Next Billing' },
            { key: 'name', label: 'Name' },
            { key: 'amount', label: 'Cost' },
            { key: 'added', label: 'Recently Added' },
          ].map(s => (
            <button key={s.key} onClick={() => toggleSort(s.key)}
              className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-none border transition-all cursor-pointer ${
                sortBy === s.key ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white text-[#141414] border-[#141414]/20 hover:border-[#141414]'}`}>
              {s.label}
              {sortBy === s.key && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />)}
            </button>
          ))}
          <span className="ml-auto text-[10px] font-mono uppercase font-bold tracking-wider text-[#141414]/60">
            <span className="font-extrabold text-[#F27D26]">{filtered.length}</span> of {subs.length}
          </span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-[#141414]/60">
              <Repeat className="w-10 h-10 text-[#141414]/40 mx-auto mb-2" />
              <p className="font-serif text-lg italic font-bold text-[#141414]">No subscriptions yet</p>
              <p className="text-xs mt-1">Add your first subscription to keep track of regular payments.</p>
              <button onClick={() => { setForm(emptyForm()); setEditingId(null); setShowForm(true); }}
                className="mt-4 bg-[#141414] text-white hover:bg-[#F27D26] border border-[#141414] rounded-none py-2 px-6 text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer">
                + Add Subscription
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs text-[#141414]">
              <thead className="bg-[#EBEBE4] text-[#141414] uppercase text-[9px] font-mono font-bold tracking-[0.15em] border-b border-[#141414]">
                <tr>
                  <th className="p-3 border-r border-[#141414]/10">Name</th>
                  <th className="p-3 border-r border-[#141414]/10">Category</th>
                  <th className="p-3 border-r border-[#141414]/10">Cost / Cycle</th>
                  <th className="p-3 border-r border-[#141414]/10">Monthly Eq.</th>
                  <th className="p-3 border-r border-[#141414]/10">Next Billing</th>
                  <th className="p-3 border-r border-[#141414]/10">Payment</th>
                  <th className="p-3 border-r border-[#141414]/10">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/10 font-medium">
                {filtered.map(sub => {
                  const me = monthlyEquivalent(sub.amount, sub.billingCycle);
                  const daysUntil = daysBetween(todayStr(), sub.nextBillingDate);
                  return (
                    <tr key={sub.id} className={`hover:bg-[#EBEBE4]/20 transition-colors border-b border-[#141414]/10 last:border-b-0 ${
                      sub.status === 'Cancelled' ? 'opacity-50' : ''} ${
                      sub.status === 'Paused' ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-transparent'
                    }`}>
                      <td className="p-3 border-r border-[#141414]/10">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-[#141414] text-white text-[9px] font-mono font-bold flex items-center justify-center shrink-0">
                            {cycleIcon(sub.billingCycle)}
                          </span>
                          <div>
                            <p className="font-bold text-[13px] uppercase tracking-wide text-[#141414]">{sub.name}</p>
                            {sub.description && <p className="text-[10px] text-[#141414]/60 truncate max-w-[150px]">{sub.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 border-r border-[#141414]/10">
                        <span className="inline-block px-2 py-0.5 border border-[#141414]/20 rounded-none text-[9px] font-mono font-bold tracking-wider uppercase">
                          {sub.category}
                        </span>
                      </td>
                      <td className="p-3 border-r border-[#141414]/10 font-mono font-bold text-[13px]">
                        {fmtCurrency(sub.amount, sub.currency)} <span className="text-[10px] text-[#141414]/50 font-normal">/ {sub.billingCycle}</span>
                      </td>
                      <td className="p-3 border-r border-[#141414]/10 font-mono font-bold text-[#F27D26]">
                        {fmtCurrency(me)}
                      </td>
                      <td className="p-3 border-r border-[#141414]/10">
                        <span className={`font-mono text-[11px] font-bold ${daysUntil <= 3 ? 'text-red-600' : 'text-[#141414]'}`}>
                          {sub.nextBillingDate}
                        </span>
                        {daysUntil === 0 && <span className="ml-1 text-[8px] font-mono font-black bg-red-100 text-red-700 px-1 py-0.5">TODAY</span>}
                        {daysUntil > 0 && daysUntil <= 3 && <span className="ml-1 text-[8px] font-mono font-black bg-amber-100 text-amber-700 px-1 py-0.5">IN {daysUntil}d</span>}
                      </td>
                      <td className="p-3 border-r border-[#141414]/10 text-[10px] font-mono font-bold uppercase tracking-wider text-[#141414]/70">
                        {sub.paymentMethod || '—'}
                      </td>
                      <td className="p-3 border-r border-[#141414]/10">
                        <span className={`inline-block px-2 py-0.5 border text-[9px] font-mono font-bold tracking-wider uppercase rounded-none ${statusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(sub)} title="Edit" className="p-1.5 text-[#141414] hover:bg-[#F27D26] hover:text-white border border-[#141414]/20 hover:border-transparent rounded-none transition-all cursor-pointer">
                            <Edit2 className="w-3.5 h-3.5"/>
                          </button>
                          {sub.status === 'Active' && (
                            <button onClick={() => setConfirmAction({ type: 'pause', id: sub.id })} title="Pause" className="p-1.5 text-amber-600 hover:bg-amber-50 border border-amber-200 hover:border-amber-400 rounded-none transition-all cursor-pointer">
                              <Pause className="w-3.5 h-3.5"/>
                            </button>
                          )}
                          {sub.status === 'Paused' && (
                            <button onClick={() => handleResume(sub)} title="Resume" className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 rounded-none transition-all cursor-pointer">
                              <Play className="w-3.5 h-3.5"/>
                            </button>
                          )}
                          {sub.status !== 'Cancelled' && (
                            <button onClick={() => setConfirmAction({ type: 'cancel', id: sub.id })} title="Cancel" className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 hover:border-red-400 rounded-none transition-all cursor-pointer">
                              <X className="w-3.5 h-3.5"/>
                            </button>
                          )}
                          <button onClick={() => setConfirmAction({ type: 'delete', id: sub.id })} title="Delete permanently" className="p-1.5 text-white bg-[#141414] hover:bg-red-600 rounded-none border border-[#141414] transition-all cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile cards */}
        <div className="block md:hidden divide-y divide-[#141414]/15">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[#141414]/60">
              <Repeat className="w-10 h-10 text-[#141414]/40 mx-auto mb-2" />
              <p className="font-serif text-base italic font-bold text-[#141414]">No subscriptions yet</p>
              <p className="text-[11px] mt-1">Add your first subscription to keep track of regular payments.</p>
              <button onClick={() => { setForm(emptyForm()); setEditingId(null); setShowForm(true); }}
                className="mt-4 bg-[#141414] text-white hover:bg-[#F27D26] border border-[#141414] rounded-none py-2 px-6 text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer">
                + Add Subscription
              </button>
            </div>
          ) : (
            filtered.map(sub => {
              const me = monthlyEquivalent(sub.amount, sub.billingCycle);
              const daysUntil = daysBetween(todayStr(), sub.nextBillingDate);
              const isExpanded = expandedCard === sub.id;
              return (
                <div key={sub.id} className={`p-4 space-y-3 relative ${
                  sub.status === 'Cancelled' ? 'opacity-50' : ''
                } ${sub.status === 'Paused' ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-transparent'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#141414] text-white text-[9px] font-mono font-bold flex items-center justify-center shrink-0">
                          {cycleIcon(sub.billingCycle)}
                        </span>
                        <p className="font-bold text-[13px] uppercase tracking-wide text-[#141414] truncate">{sub.name}</p>
                        <span className={`inline-block px-2 py-0.5 border text-[8px] font-mono font-bold tracking-wider uppercase rounded-none ${statusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5 ml-8">
                        <span className="inline-block px-2 py-0.5 border border-[#141414]/20 rounded-none text-[8px] font-mono font-bold tracking-wider uppercase">{sub.category}</span>
                        {sub.paymentMethod && <span className="inline-block px-2 py-0.5 border border-[#141414]/30 rounded-none text-[8px] font-mono font-bold tracking-wider uppercase text-[#141414]/70">{sub.paymentMethod}</span>}
                        <span className={`text-[10px] font-mono font-bold ${daysUntil <= 3 ? 'text-red-600' : 'text-[#141414]/50'}`}>
                          {daysUntil === 0 ? 'TODAY' : daysUntil <= 3 ? `IN ${daysUntil}d` : sub.nextBillingDate}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-sm text-[#141414]">{fmtCurrency(sub.amount, sub.currency)}</p>
                      <p className="text-[9px] font-mono text-[#141414]/50">/ {sub.billingCycle}</p>
                      <p className="text-[10px] font-mono font-bold text-[#F27D26] mt-0.5">{fmtCurrency(me)}/mo</p>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button onClick={() => setExpandedCard(isExpanded ? null : sub.id)} className="w-full flex items-center justify-center text-[9px] font-mono font-bold text-[#141414]/50 hover:text-[#141414] gap-1 cursor-pointer">
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'LESS' : 'MORE'}
                  </button>

                  {isExpanded && (
                    <div className="space-y-2 text-[11px] ml-8 animate-fade-in">
                      {sub.description && <p className="text-[#141414]/70">{sub.description}</p>}
                      <p className="font-mono text-[10px]">Start: {sub.startDate}</p>
                      <p className="font-mono text-[10px]">Next: {sub.nextBillingDate}</p>
                      {sub.notes && <p className="text-[#141414]/60 italic">{sub.notes}</p>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-1.5 pt-1 border-t border-[#141414]/5 ml-8">
                    <button onClick={() => openEdit(sub)} className="p-1.5 px-2.5 text-[#141414] hover:bg-[#F27D26] hover:text-white border border-[#141414]/20 hover:border-transparent rounded-none transition-all cursor-pointer text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                      <Edit2 className="w-3 h-3"/> EDIT
                    </button>
                    {sub.status === 'Active' && (
                      <button onClick={() => setConfirmAction({ type: 'pause', id: sub.id })} className="p-1.5 px-2.5 text-amber-600 hover:bg-amber-50 border border-amber-200 rounded-none transition-all cursor-pointer text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <Pause className="w-3 h-3"/> PAUSE
                      </button>
                    )}
                    {sub.status === 'Paused' && (
                      <button onClick={() => handleResume(sub)} className="p-1.5 px-2.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-none transition-all cursor-pointer text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <Play className="w-3 h-3"/> RESUME
                      </button>
                    )}
                    {sub.status !== 'Cancelled' && (
                      <button onClick={() => setConfirmAction({ type: 'cancel', id: sub.id })} className="p-1.5 px-2.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-none transition-all cursor-pointer text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <X className="w-3 h-3"/> STOP
                      </button>
                    )}
                    <button onClick={() => setConfirmAction({ type: 'delete', id: sub.id })} className="p-1.5 px-2.5 text-white bg-[#141414] hover:bg-red-600 rounded-none border border-[#141414] transition-all cursor-pointer text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                      <Trash2 className="w-3 h-3"/>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ──────────────────── CALENDAR VIEW ──────────────────── */}
      {viewMode === 'calendar' && (
        <div className="bg-white border border-[#141414] rounded-none overflow-hidden">
          <div className="px-4 py-3 bg-[#EBEBE4] border-b border-[#141414] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F27D26]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#141414]">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} — Billing Calendar
            </span>
          </div>
          <div className="grid grid-cols-7 gap-px bg-[#141414]/10">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="bg-[#EBEBE4] p-2 text-center text-[9px] font-mono font-bold uppercase tracking-wider text-[#141414]/60">{d}</div>
            ))}
            {calendarMonth.map((cell, i) => (
              <div key={i} className={`bg-white p-2 min-h-[70px] ${cell ? '' : 'bg-[#EBEBE4]/30'}`}>
                {cell && (
                  <>
                    <p className={`text-[10px] font-mono font-bold ${cell.subs.length > 0 ? 'text-[#F27D26]' : 'text-[#141414]/40'}`}>{cell.day}</p>
                    {cell.subs.map(s => (
                      <div key={s.id} className="mt-0.5 bg-[#141414]/5 border-l-2 border-[#F27D26] px-1 py-0.5">
                        <p className="text-[8px] font-mono font-bold text-[#141414] truncate">{s.name}</p>
                        <p className="text-[7px] font-mono text-[#F27D26] font-bold">{fmtCurrency(s.amount, s.currency)}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────── ANALYTICS ──────────────────── */}
      {activeSubs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Category Breakdown */}
          <div className="bg-white border border-[#141414] rounded-none overflow-hidden">
            <div className="px-4 py-3 bg-[#EBEBE4] border-b border-[#141414] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#F27D26]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#141414]">Category Breakdown</span>
            </div>
            <div className="p-4 space-y-3">
              {categorySpending.map(([cat, cost]) => {
                const pct = monthlyCost > 0 ? (cost / monthlyCost * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                      <span className="uppercase tracking-wider text-[#141414]">{cat}</span>
                      <span className="text-[#F27D26]">{fmtCurrency(cost)}/mo</span>
                    </div>
                    <div className="w-full bg-[#EBEBE4] h-2 rounded-none overflow-hidden">
                      <div className="bg-[#141414] h-full rounded-none transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-white border border-[#141414] rounded-none overflow-hidden">
            <div className="px-4 py-3 bg-[#EBEBE4] border-b border-[#141414] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#F27D26]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#141414]">Payment Methods</span>
            </div>
            <div className="p-4 space-y-3">
              {paymentMethodSpending.map(([pm, cost]) => {
                const pct = monthlyCost > 0 ? (cost / monthlyCost * 100) : 0;
                return (
                  <div key={pm}>
                    <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                      <span className="uppercase tracking-wider text-[#141414]">{pm}</span>
                      <span className="text-[#F27D26]">{fmtCurrency(cost)}/mo</span>
                    </div>
                    <div className="w-full bg-[#EBEBE4] h-2 rounded-none overflow-hidden">
                      <div className="bg-[#F27D26] h-full rounded-none transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Subscriptions + Savings Insight */}
          <div className="bg-white border border-[#141414] rounded-none overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-[#EBEBE4] border-b border-[#141414] flex items-center gap-2">
              <Star className="w-4 h-4 text-[#F27D26]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#141414]">Top Subscriptions</span>
            </div>
            <div className="p-4 space-y-2 flex-1">
              {topSubs.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-[#141414]/5 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#141414] text-white text-[8px] font-mono font-bold flex items-center justify-center rounded-none">
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-bold text-[#141414]">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#F27D26]">
                    {fmtCurrency(monthlyEquivalent(s.amount, s.billingCycle))}/mo
                  </span>
                </div>
              ))}
            </div>

            {/* Savings Insight */}
            {potentialSavings > 0 && (
              <div className="mx-4 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-none">
                <p className="text-[10px] font-mono font-bold text-amber-800 leading-relaxed">
                  If you cancel 2 unused subscriptions, you could save approximately <span className="text-amber-900">{fmtCurrency(potentialSavings)}/month</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
