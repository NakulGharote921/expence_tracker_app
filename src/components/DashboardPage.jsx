/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Sparkles, TrendingUp, TrendingDown, History, CheckCircle, User, Save, LogOut, Edit2 } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import CurrencyConverter from './CurrencyConverter';
import ExpenseForm from './ExpenseForm';
import ExpenseHistory from './ExpenseHistory';
import Breakdown from './Breakdown';
import WeeklyTips from './WeeklyTips';
// Tab views
import TransactionsTab from './TransactionsTab';
import BudgetsTab from './BudgetsTab';
import CategoriesTab from './CategoriesTab';
import ReportsTab from './ReportsTab';
import SubscriptionsTab from './SubscriptionsTab';
import ProfileModal from './ProfileModal';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS, INITIAL_BUDGETS, MOCK_NOTIFICATIONS } from '../mockData';
import { supabaseDb } from '../utils/supabaseDb';

export default function DashboardPage({ userId }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [hydrated, setHydrated] = useState(false);

    // --- Data layer: Supabase persistence (per authenticated user) ---
    const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
    const [subscriptions, setSubscriptions] = useState([]);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    // Profile preferences (hydrated from Supabase on mount)
    const [profileName, setProfileName] = useState('Alex Morgan');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isPremium, setIsPremium] = useState(true);
    // Dynamic aggregate budget target limit
    const [totalBudgetLimit, setTotalBudgetLimit] = useState(() =>
        INITIAL_BUDGETS.reduce((acc, b) => acc + b.limit, 0)
    );
    const [newTotalBudgetVal, setNewTotalBudgetVal] = useState(() =>
        INITIAL_BUDGETS.reduce((acc, b) => acc + b.limit, 0).toString()
    );
    const [isEditingTotalBudget, setIsEditingTotalBudget] = useState(false);
    const [profileCurrency, setProfileCurrency] = useState('INR');

    // Modal open controllers
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    // Form templates inside modes
    const [supportText, setSupportText] = useState('');
    const [supportEmail, setSupportEmail] = useState('nakulgharote@gmail.com');
    const [profileEditedName, setProfileEditedName] = useState('Alex Morgan');
    const [profilePhone, setProfilePhone] = useState('');

    // Hydrate all user data from Supabase once on mount.
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        (async () => {
            const [t, c, b, s, p] = await Promise.all([
                supabaseDb.hydrateTransactions(userId),
                supabaseDb.hydrateCategories(userId),
                supabaseDb.hydrateBudgets(userId),
                supabaseDb.hydrateSubscriptions(userId),
                supabaseDb.hydrateProfile(userId, null),
            ]);

            if (t.data?.length) setTransactions(t.data);
            if (c.data && Object.keys(c.data).length) setCategories(c.data);
            if (b.data?.length) setBudgets(b.data);
            if (s.data?.length) setSubscriptions(s.data);

            if (p.data) {
                if (p.data.name != null) setProfileName(p.data.name);
                if (p.data.email != null) setSupportEmail(p.data.email);
                if (p.data.phone != null) setProfilePhone(p.data.phone);
                if (p.data.currency != null) setProfileCurrency(p.data.currency);
                if (p.data.photo_url != null) setProfilePhoto(p.data.photo_url);
                if (p.data.total_budget_limit != null) {
                    setTotalBudgetLimit(Number(p.data.total_budget_limit));
                    setNewTotalBudgetVal(String(p.data.total_budget_limit));
                }
            }
            setHydrated(true);
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Persist mutations to Supabase (debounced) after hydration.
    useEffect(() => {
        if (!hydrated || !userId) return;
        const t = setTimeout(() => {
            supabaseDb.reconcileTransactions(userId, transactions);
        }, 300);
        return () => clearTimeout(t);
    }, [transactions, hydrated, userId]);

    useEffect(() => {
        if (!hydrated || !userId) return;
        const t = setTimeout(() => {
            supabaseDb.reconcileBudgets(userId, budgets);
        }, 300);
        return () => clearTimeout(t);
    }, [budgets, hydrated, userId]);

    useEffect(() => {
        if (!hydrated || !userId) return;
        const t = setTimeout(() => {
            supabaseDb.reconcileCategories(userId, categories);
        }, 300);
        return () => clearTimeout(t);
    }, [categories, hydrated, userId]);

    useEffect(() => {
        if (!hydrated || !userId) return;
        const t = setTimeout(() => {
            supabaseDb.reconcileSubscriptions(userId, subscriptions);
        }, 300);
        return () => clearTimeout(t);
    }, [subscriptions, hydrated, userId]);

    // Persist the user profile + aggregate budget target to Supabase (debounced).
    useEffect(() => {
        if (!hydrated || !userId) return;
        const t = setTimeout(() => {
            supabaseDb.updateProfile(userId, {
                name: profileName,
                email: supportEmail,
                phone: profilePhone,
                currency: profileCurrency,
                photo_url: profilePhoto,
                total_budget_limit: totalBudgetLimit,
            });
        }, 300);
        return () => clearTimeout(t);
    }, [hydrated, userId, profileName, supportEmail, profilePhone, profileCurrency, profilePhoto, totalBudgetLimit]);

    const writeTransactions = () => {};
    const writeBudgets = () => {};
    const writeCategories = () => {};
    const writeTargetBudget = () => {};
    const writeProfile = () => {};

    // Success message feedback
    const [successToast, setSuccessToast] = useState('');
    // Confirmation Modal state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });
    const requestConfirmation = (title, message, onConfirm) => {
        setConfirmDialog({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            }
        });
    };
    // Auto trigger warnings if budgets surpass limits
    useEffect(() => {
        // Recalculate spent amounts for all active budgets dynamically based on present transactions list
        const updatedBudgets = budgets.map(b => {
            const expensesInCat = transactions
                .filter(t => t.category === b.category && t.type === 'expense')
                .reduce((sum, item) => sum + item.amount, 0);
            return {
                ...b,
                spent: expensesInCat
            };
        });
        // Check if any budget spent exceeded or got extremely close (> 90%) to the limit, causing automatic notification trigger
        updatedBudgets.forEach(b => {
            const existingNotif = notifications.find(n => n.title === `${b.category} Cap Warning`);
            if (b.spent >= b.limit * 0.9 && !existingNotif) {
                setNotifications(prev => [
                    {
                        id: `notif-${Date.now()}-${b.category}`,
                        title: `${b.category} Cap Warning`,
                        message: `Spending inside ${b.category} has reached ₹${b.spent.toFixed(2)} of your ₹${b.limit} limit.`,
                        time: 'Just now',
                        read: false,
                        type: 'alert'
                    },
                    ...prev
                ]);
            }
        });
        // Only set if different to prevent looping
        const spendChanged = JSON.stringify(updatedBudgets.map(u => u.spent)) !== JSON.stringify(budgets.map(bu => bu.spent));
        if (spendChanged) {
            setBudgets(updatedBudgets);
        }
    }, [transactions, budgets, notifications]);
    // Actions handlers
    const handleAddExpense = (name, amount, category, description, paymentMethod) => {
        const newTx = {
            id: `tx-${Date.now()}`,
            name,
            amount,
            category,
            description: (description || '').trim() || undefined,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            paymentMethod: paymentMethod || '',
        };
        const next = [newTx, ...transactions];
        setTransactions(next);
        writeTransactions(next)?.catch(() => { });
        triggerToast(`Added expense for ₹${amount.toFixed(2)}!`);
    };

    const handleDeleteTransaction = (id) => {
        const target = transactions.find(t => t.id === id);
        if (!target)
            return;

        requestConfirmation('Delete Transaction Record', `Are you absolutely sure you want to delete the transaction "${target.name}" for ₹${target.amount.toFixed(2)}? This action cannot be undone.`, async () => {
            const next = transactions.filter(t => t.id !== id);
            setTransactions(next);
            writeTransactions(next)?.catch(() => { });
            triggerToast(`Deleted transaction: ${target.name}`);
        });
    };

    const handleBulkDeleteTransactions = (ids) => {
        requestConfirmation('Purge Multiple Ledger Entries', `Are you absolutely sure you want to delete ${ids.length} selected transaction records? This action is permanent and cannot be undone.`, async () => {
            const next = transactions.filter(t => !ids.includes(t.id));
            setTransactions(next);
            writeTransactions(next)?.catch(() => { });
            triggerToast(`Successfully purged ${ids.length} transactions.`);
        });
    };

    const handleDeleteBudget = (category) => {
        requestConfirmation('Delete Budget Cap', `Are you absolutely sure you want to remove the budget limit for the category "${category}"? You will lose tracking of spent limits for this classification.`, async () => {
            const next = budgets.filter(b => b.category !== category);
            setBudgets(next);
            writeBudgets(next)?.catch(() => { });
            triggerToast(`Deleted budget limit for ${category}.`);
        });
    };

    const handleAddTransactionFull = (txData) => {
        const newTx = {
            id: `tx-${Date.now()}`,
            ...txData
        };
        const next = [newTx, ...transactions];
        setTransactions(next);
        writeTransactions(next)?.catch(() => { });
        triggerToast(`Successfully recorded transaction: "${txData.name}"`);
    };

    const handleUpdateTransaction = (id, updated) => {
        const next = transactions.map(t => {
            if (t.id === id) {
                return { ...t, ...updated };
            }
            return t;
        });
        setTransactions(next);
        writeTransactions(next)?.catch(() => { });
        triggerToast('Updated transaction successfully.');
    };

    const handleUpdateBudget = (category, newLimit) => {
        const next = budgets.map(b => {
            if (b.category === category) {
                return { ...b, limit: newLimit };
            }
            return b;
        });
        setBudgets(next);
        writeBudgets(next)?.catch(() => { });
        triggerToast(`Re-configured budget cap for ${category} to ₹${newLimit}.`);
    };

    const handleAddBudget = (category, limit) => {
        const newBudget = {
            category,
            limit,
            spent: transactions
                .filter(t => t.category === category && t.type === 'expense')
                .reduce((sum, item) => sum + item.amount, 0)
        };
        const next = [...budgets, newBudget];
        setBudgets(next);
        writeBudgets(next)?.catch(() => { });
        triggerToast(`Initialized active budget boundaries for ${category}.`);
    };

    const handleAddCategory = (name, color, iconName) => {
        const newCatDef = {
            name,
            color,
            bgLight: `bg-[${color}]/10 text-[${color}]`,
            iconName
        };
        const next = {
            ...categories,
            [name]: newCatDef
        };
        setCategories(next);
        writeCategories(next)?.catch(() => { });
        triggerToast(`Registered new category classification: ${name}.`);
    };

    // Subscription handlers (localStorage persistence)
    const handleAddSubscription = (sub) => {
        const newSub = {
            id: `sub-${Date.now()}`,
            ...sub,
            createdAt: sub.createdAt || new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        };
        // Check for duplicate active subscription with same name.
        const dup = subscriptions.find(s =>
            s.name.toLowerCase() === String(newSub.name).toLowerCase() && s.status === 'Active'
        );
        if (dup) {
            triggerToast('An active subscription with this name already exists.');
            return;
        }
        setSubscriptions(prev => [newSub, ...prev]);
        triggerToast('Subscription added successfully.');
    };

    const handleUpdateSubscription = (id, updated) => {
        setSubscriptions(prev => prev.map(s => s.id === id
            ? { ...s, ...updated, id, updatedAt: new Date().toISOString().split('T')[0] }
            : s));
        triggerToast('Subscription updated successfully.');
    };

    const handleDeleteSubscription = (id) => {
        setSubscriptions(prev => prev.filter(s => s.id !== id));
        triggerToast('Subscription deleted permanently.');
    };

    // Notification handles
    const handleMarkAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };
    const handleClearNotifications = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        triggerToast('All notifications read.');
    };
    const triggerToast = (msg) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(''), 3000);
    };
    // Submit support ticket simulated
    const handleSupportSubmit = (e) => {
        e.preventDefault();
        if (!supportText.trim())
            return;
        triggerToast('Submitted support ticket! A teammate will reach out shortly.');
        setSupportText('');
        setShowSupportModal(false);
    };
    const handleLogout = () => {
        // Sign out of Supabase; App.jsx flips to the auth page on state change.
        supabaseDb.signOut().catch(() => {});
        setHydrated(false);
    };
    const handleUpdateTotalBudgetSubmit = (e) => {
        e.preventDefault();
        const limitNum = parseFloat(newTotalBudgetVal);
        if (isNaN(limitNum) || limitNum <= 0) {
            triggerToast('Target budget must be a positive number.');
            return;
        }
        setTotalBudgetLimit(limitNum);
        writeTargetBudget(limitNum)?.catch(() => {});
        // Divide target amount across existing budget categories equally
        const count = budgets.length || 1;
        const splitLimit = Math.round(limitNum / count);
        setBudgets(budgets.map(b => ({
            ...b,
            limit: splitLimit
        })));
        setIsEditingTotalBudget(false);
        triggerToast(`Target budget updated to ₹${limitNum.toLocaleString('en-IN')}`);
    };
    // Active numerical calculators
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpensesAmount = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);
    const aggregateCost = totalExpensesAmount;
    const budgetSpentPct = totalBudgetLimit > 0 ? (aggregateCost / totalBudgetLimit) * 100 : 0;
    // Search filter across the dashboard list
    return (<div className="bg-[#F5F5F0] text-[#141414] min-h-screen relative flex w-full max-w-full font-sans select-none overflow-x-clip">
      
      {/* Toast Alert Banner */}
      {successToast && (<div className="fixed top-5 right-5 z-50 bg-[#141414] text-white px-5 py-3 rounded-none shadow-[4px_4px_0px_0px_#F27D26] border border-[#141414] flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest animate-fade-in-up">
          <CheckCircle className="w-5 h-5 text-[#F27D26] shrink-0"/>
          <span>{successToast}</span>
        </div>)}

      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
        }}
        onQuickAdd={() => {
            setActiveTab('dashboard');
            setTimeout(() => {
                const formElement = document.getElementById('form-add-expense');
                if (formElement)
                    formElement.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        }}
        onOpenSupport={() => setShowSupportModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        premiumStatus={isPremium}
        onUpgradePlan={() => setShowUpgradeModal(true)}
        onLogout={handleLogout}
        profileName={profileName}
        profilePhoto={profilePhoto}
      />

      {/* Mobile Drawer Sidebar Navigation */}
      {isMobileSidebarOpen && (<div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-[#141414]/70 backdrop-blur-xs" onClick={() => setIsMobileSidebarOpen(false)}/>
          
          <div className="relative z-10 h-full w-full overflow-y-auto bg-[#F5F5F0] flex flex-col p-5 animate-slide-right animate-[slide-in_0.2s_ease-out]">
            <button onClick={() => setIsMobileSidebarOpen(false)} className="absolute top-4 right-4 text-[#141414] hover:bg-[#141414]/10 p-1.5 border border-[#141414]">
              <X className="w-4 h-4"/>
            </button>

            {/* Brand logo */}
            <div className="mb-6 mt-4 flex flex-col gap-1 pr-8">
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#141414]/40">CURATED LEDGER</span>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#141414] flex items-center justify-center text-white font-serif italic text-sm">
                  W
                </div>
                <span className="font-serif text-xl italic text-[#141414] tracking-tight">Wealth_Flow</span>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5">
              {[
                { id: 'dashboard', name: 'Dashboard' },
                { id: 'transactions', name: 'Transactions' },
                { id: 'budgets', name: 'Budgets' },
                { id: 'categories', name: 'Categories' },
                { id: 'reports', name: 'Reports' }
            ].map(item => (<button key={item.id} onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                }} className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-widest font-bold transition-all ${activeTab === item.id
                    ? 'bg-[#141414] text-white border-l-4 border-[#F27D26]'
                    : 'text-[#141414]/70 hover:bg-[#141414]/10 hover:text-[#141414]'}`}>
                  {item.name}
                </button>))}
            </nav>

            <div className="mt-auto space-y-3.5 pt-6 border-t border-[#141414]/10">
              <button onClick={() => {
                setShowProfileModal(true);
                setIsMobileSidebarOpen(false);
            }} className="w-full text-left text-[11px] uppercase tracking-widest font-bold text-[#141414]/70 hover:text-[#141414] flex items-center gap-2.5 cursor-pointer">
                <User className="w-4 h-4 text-[#F27D26]"/> Profile
              </button>
              
              <button onClick={() => {
                setShowSupportModal(true);
                setIsMobileSidebarOpen(false);
            }} className="w-full text-left text-[11px] uppercase tracking-widest font-bold text-[#141414]/70 hover:text-[#141414] flex items-center gap-2.5 cursor-pointer">
                <HelpCircle className="w-4 h-4 text-[#F27D26]"/> Support
              </button>

              <button onClick={() => {
                handleLogout();
                setIsMobileSidebarOpen(false);
            }} className="w-full text-left text-[11px] uppercase tracking-widest font-bold text-red-650 hover:text-red-700 flex items-center gap-2.5 cursor-pointer">
                <LogOut className="w-4 h-4 text-red-650"/> Log Out
              </button>
            </div>
          </div>
        </div>)}

      {/* Main Panel Content Area */}
      <main className="flex-1 min-w-0 w-full lg:ml-[260px] min-h-screen flex flex-col overflow-x-hidden">
        
        {/* Sticky Header */}
        <Header notifications={notifications} markAsRead={handleMarkAsRead} clearNotifications={handleClearNotifications} onOpenProfile={() => setShowProfileModal(true)} onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} profileName={profileName} profilePhoto={profilePhoto}/>

        {/* Dynamic Inner Panel based on active tab state */}
        <div className="p-3 sm:p-4 md:p-6 xl:p-8 flex-1 max-w-7xl w-full mx-auto overflow-x-hidden" id="main-scrollable-panel">
          
          {activeTab === 'dashboard' && (<div className="space-y-5 sm:space-y-6 md:space-y-8 animate-fade-in">
              
              {/* Introduction bar */}
              <div className="border-b border-[#141414]/15 pb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-serif italic font-semibold text-[#141414] tracking-tight leading-tight">Financial Exposition</h1>
                <p className="mt-2 break-words text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#141414]/60">ACCOUNT OWNER: {profileName} // JULY REPORT ENGINE</p>
              </div>

              {/* Three card grid metric columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                
                {/* Total Expense Card */}
                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-none border border-[#141414] transition-all flex flex-col justify-between h-full overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#141414]/60 flex items-center gap-1.5 select-none">
                        AGGREGATE COST
                      </span>
                      <TrendingDown className="w-4 h-4 text-[#F27D26]"/>
                    </div>
                    
                    <span className="font-serif text-2xl min-[380px]:text-3xl sm:text-4xl italic font-bold text-[#141414] leading-tight break-all flex items-center gap-1 w-fit select-none">
                        ₹{totalExpensesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[#141414]/45 mt-1">
                      Net expense cost
                    </p>
                    {/* Overall Target Budget Limit & Live Update Display */}
                    <div className="mt-4 pt-3.5 border-t border-[#141414]/15">
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#141414]/60 uppercase tracking-[0.1em]">
                          <span>TARGET LIMIT</span>
                          {isEditingTotalBudget ? (<span className="text-[#F27D26] font-bold uppercase text-[9px]">EDITING</span>) : (<button onClick={() => {
                    setNewTotalBudgetVal(totalBudgetLimit.toString());
                    setIsEditingTotalBudget(true);
                }} className="text-[#F27D26] hover:underline cursor-pointer font-bold uppercase py-0.5 px-1 bg-[#F27D26]/10 border border-[#F27D26]/20 text-[9px]">
                            [Edit Target]
                          </button>)}
                        </div>

                        {isEditingTotalBudget ? (<form onSubmit={handleUpdateTotalBudgetSubmit} className="mt-2 space-y-2">
                            <div className="flex flex-col gap-1.5 sm:flex-row">
                              <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#141414]/50 font-mono text-[11px] font-bold">
                                  ₹
                                </span>
                                <input type="number" min="1" value={newTotalBudgetVal} onChange={(e) => setNewTotalBudgetVal(e.target.value)} className="w-full bg-[#EBEBE4] focus:bg-white border border-[#141414] text-xs font-semibold rounded-none pl-6 pr-1.5 py-1 outline-none font-mono text-[#141414]" required/>
                              </div>
                              <button type="submit" className="bg-[#141414] text-white hover:bg-[#F27D26] border border-[#141414] px-3 font-mono text-[10px] uppercase font-bold tracking-wider rounded-none shrink-0 cursor-pointer">
                                Save
                              </button>
                              <button type="button" onClick={() => {
                    setIsEditingTotalBudget(false);
                    setNewTotalBudgetVal(totalBudgetLimit.toString());
                }} className="bg-[#EBEBE4] hover:bg-[#D1C6B4] border border-[#141414] px-2.5 font-mono text-[10px] uppercase font-bold tracking-wider rounded-none shrink-0 cursor-pointer">
                                Cancel
                              </button>
                            </div>
                          </form>) : (<>
                          <div className="font-serif text-lg italic font-bold text-[#141414] mt-1 flex items-baseline justify-between gap-2 flex-wrap">
                            <span>₹{totalBudgetLimit.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] font-mono not-italic uppercase tracking-wider text-[#141414]/50">
                              {budgetSpentPct.toFixed(1)}% Spent
                            </span>
                          </div>
                          <div className="w-full bg-[#EBEBE4] border border-[#141414] p-0.5 h-3 mt-1.5 rounded-none overflow-hidden flex items-center">
                            <div className={`h-1.5 rounded-none transition-all duration-500 ease-out ${budgetSpentPct >= 95
                    ? 'bg-red-650 animate-pulse'
                    : budgetSpentPct >= 80
                        ? 'bg-[#F27D26]'
                        : 'bg-[#16a34a]'}`} style={{ width: `${Math.min(100, Math.round(budgetSpentPct))}%` }}/>
                          </div>
                        </>)}
                    </div>
                  </div>
                  <p className="text-[10px] font-mono uppercase tracking-wider font-bold text-red-605 flex items-center mt-6">
                    <TrendingUp className="w-3.5 h-3.5 mr-1 shrink-0 text-red-650"/>
                    +12% EXPENSE SLIPPAGE
                  </p>
                </div>

                {/* Currency Converter */}
                <CurrencyConverter totalINRAmount={totalExpensesAmount}/>

                {/* Recent Activity Card */}
                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] transition-all flex flex-col justify-between h-full md:col-span-2 xl:col-span-1 overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#141414]/60">RECORD COUNT</span>
                      <History className="w-4 h-4 text-[#F27D26]"/>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-serif text-3xl sm:text-4xl italic font-bold text-[#141414]">
                        {transactions.length}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-[#141414]/50">ROWS FILED</span>
                    </div>
                  </div>

                  {/* Avatars series matching user screenshot */}
                  <div className="mt-6 flex -space-x-1.5 items-center">
                    <div className="w-7 h-7 rounded-none border border-[#141414] bg-[#EBEBE4] text-[9px] text-[#141414] flex items-center justify-center font-bold font-mono">AM</div>
                    <div className="w-7 h-7 rounded-none border border-[#141414] bg-[#F27D26] text-[9px] text-white flex items-center justify-center font-bold font-mono">WF</div>
                    <div className="w-7 h-7 rounded-none border border-[#141414] bg-[#D1C6B4] text-[9px] text-[#141414] flex items-center justify-center font-bold font-mono">SM</div>
                    <div className="w-7 h-7 rounded-none border border-[#141414] bg-[#141414] text-[9px] text-white flex items-center justify-center font-bold font-mono">+39</div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#141414]/60 font-bold ml-2.5">CO-LEDGERS</span>
                  </div>
                </div>

              </div>

              {/* Sub grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 items-start">
                
                {/* Left side actions & log */}
                <div className="md:col-span-2 xl:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
                  <ExpenseForm categories={Object.keys(categories)} onAddExpense={handleAddExpense}/>
                  
                  <ExpenseHistory transactions={transactions} categories={categories} onDeleteTransaction={handleDeleteTransaction} onViewAll={() => setActiveTab('transactions')}/>
                </div>

                {/* Right side analytics column */}
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <Breakdown transactions={transactions} categories={categories}/>
                  
                  <WeeklyTips />
                </div>

              </div>

            </div>)}

          {activeTab === 'transactions' && (<div className="animate-fade-in bg-background p-1.2 rounded-xl">
              <TransactionsTab transactions={transactions} categories={categories} onDeleteTransaction={handleDeleteTransaction} onBulkDeleteTransactions={handleBulkDeleteTransactions} onAddTransaction={handleAddTransactionFull} onUpdateTransaction={handleUpdateTransaction}/>
            </div>)}

          {activeTab === 'budgets' && (<div className="animate-fade-in">
              <BudgetsTab budgets={budgets} categories={categories} onUpdateBudget={handleUpdateBudget} onAddBudget={handleAddBudget} onDeleteBudget={handleDeleteBudget}/>
            </div>)}

          {activeTab === 'categories' && (<div className="animate-fade-in">
              <CategoriesTab categories={categories} transactions={transactions} onAddCategory={handleAddCategory}/>
            </div>)}

          {activeTab === 'subscriptions' && (<div className="animate-fade-in">
              <SubscriptionsTab subscriptions={subscriptions} onAdd={handleAddSubscription} onUpdate={handleUpdateSubscription} onDelete={handleDeleteSubscription}/>
            </div>)}

          {activeTab === 'reports' && (<div className="animate-fade-in">
              <ReportsTab transactions={transactions} categories={categories}/>
            </div>)}

        </div>
      </main>

      {/* Support Submission Overlay Dialog */}
      {showSupportModal && (<div className="fixed inset-0 bg-on-background/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <form onSubmit={handleSupportSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-scale-up">
            <button type="button" onClick={() => setShowSupportModal(false)} className="absolute top-4 right-4 text-outline hover:text-on-surface hover:bg-surface-container p-1 rounded-full transition-all">
              <X className="w-5 h-5"/>
            </button>

            <div className="flex items-center gap-2 text-primary font-bold">
              <HelpCircle className="w-5 h-5"/>
              <span className="text-sm font-sans tracking-tight">WealthFlow Support Portal</span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Have questions regarding offline persistence, budget warnings, or conversions? Send your inquiry to our financial dispatchers below.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-outline mb-1 uppercase">Email Address</label>
              <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full bg-surface-container-low border border-outline focus:border-primary text-xs rounded-xl py-2 px-3 outline-none" required/>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline mb-1 uppercase">How can we assist you today?</label>
              <textarea rows={4} value={supportText} onChange={e => setSupportText(e.target.value)} placeholder="Type your question or report feedback..." className="w-full bg-surface-container-low border border-outline focus:border-primary text-xs rounded-xl py-2 px-3 outline-none resize-none font-medium text-on-surface" required/>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button type="button" onClick={() => setShowSupportModal(false)} className="py-2 px-4 rounded-xl hover:bg-surface-container font-semibold transition-all">
                Cancel
              </button>
              <button type="submit" className="bg-primary text-on-primary font-bold py-2 px-5 rounded-xl hover:bg-primary-container shadow transition-all">
                Submit Ticket
              </button>
            </div>
          </form>
        </div>)}

      {/* Profile & Account Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileName={profileName}
        profilePhoto={profilePhoto}
        profilePhone={profilePhone}
        profileCurrency={profileCurrency}
        isPremium={isPremium}
        email={supportEmail}
        userKey=""
        targetBudget={totalBudgetLimit}
        onTargetBudgetChange={(val) => {
          setTotalBudgetLimit(val);
          setNewTotalBudgetVal(val.toString());
        }}
        onSave={async (name, phone, currency) => {
          setProfileName(name);
          setProfileEditedName(name);
          setProfilePhone(phone);
          setProfileCurrency(currency);
          try {
            await writeProfile({ name, phone, currency });
          } catch (_) {}
        }}
        onLogout={handleLogout}
        triggerToast={triggerToast}
        writeTargetBudget={writeTargetBudget}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
      />

      {/* Upgrade Plan Overlay Dialog */}
      {showUpgradeModal && (<div className="fixed inset-0 bg-on-background/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-scale-up">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-outline hover:text-on-surface hover:bg-surface-container p-1 rounded-full transition-all">
              <X className="w-5 h-5"/>
            </button>

            <div className="flex flex-col items-center text-center pb-2 border-b border-outline-variant/30">
              <Sparkles className="w-10 h-10 text-primary-container animate-spin mb-2"/>
              <h4 className="font-sans text-base font-black text-on-surface tracking-tight">Maximize WealthFlow Standard</h4>
              <p className="text-[10px] text-primary/80 font-bold uppercase tracking-wider mt-0.5">Corporate Fin-tech Package</p>
            </div>

            <ul className="space-y-3 text-xs text-on-surface-variant font-semibold">
              <li className="flex items-start gap-2.5">
                <span className="text-primary font-bold">✓</span>
                <span>Unlimited category creation definitions & parameters</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary font-bold">✓</span>
                <span>Active responsive SVG analytics graphs (Daily Cost Streams)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary font-bold">✓</span>
                <span>Dynamic budget warnings triggered at &gt;90% boundaries</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-primary font-bold">✓</span>
                <span>Unlimited multi-selectable CSV ledger spreadsheets downloads</span>
              </li>
            </ul>

            <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant text-[11px] font-bold text-center">
              {isPremium ? (<div>
                  <p className="text-secondary">✓ Premium Active on this Demo Applet</p>
                  <button onClick={() => { setIsPremium(false); setShowUpgradeModal(false); triggerToast('Switched back to Demo plan.'); }} className="mt-2 text-outline hover:text-on-surface hover:underline text-[10px] block mx-auto font-medium">
                    Downgrade back to Free Trial
                  </button>
                </div>) : (<div>
                  <p className="text-on-surface">Upgrade Alex's account instantly</p>
                  <button onClick={() => { setIsPremium(true); setShowUpgradeModal(false); triggerToast('Unlocked Premium plan features successfully!'); }} className="mt-2 w-full bg-primary hover:bg-primary-container text-on-primary py-2 rounded-xl text-xs font-black transition-all shadow-md">
                    Upgrade Account Display
                  </button>
                </div>)}
            </div>
          </div>
        </div>)}

      {/* Dynamic Confirmation Dialog Overlay */}
      {confirmDialog.isOpen && (<div className="fixed inset-0 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in" id="confirmation-dialog-overlay">
          <div id="confirmation-dialog-box" className="bg-white border-2 border-[#141414] rounded-none max-w-sm w-full p-6 space-y-5 shadow-[6px_6px_0px_0px_#141414] relative animate-scale-up">
            <div className="flex items-center gap-3 text-red-600 font-bold border-b border-[#141414]/10 pb-3">
              <span className="w-3 h-3 bg-red-600 rounded-none shrink-0"/>
              <span className="text-xs font-mono uppercase tracking-[0.2em] font-bold" id="dialog-title">
                {confirmDialog.title || 'SYSTEM WARNING'}
              </span>
            </div>

            <p className="text-xs text-[#141414] font-medium leading-relaxed" id="dialog-message">
              {confirmDialog.message}
            </p>

            <div className="flex gap-3 pt-2 text-xs">
              <button id="btn-dialog-cancel" type="button" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} className="flex-1 bg-[#EBEBE4] hover:bg-neutral-300 text-[#141414] border border-[#141414] py-2 px-4 transition-all text-[10px] font-mono tracking-widest font-bold uppercase cursor-pointer text-center font-bold">
                [CANCEL]
              </button>
              <button id="btn-dialog-confirm" type="button" onClick={confirmDialog.onConfirm} className="flex-1 bg-red-600 hover:bg-[#141414] text-white border border-[#141414] py-2 px-4 transition-all text-[10px] font-mono tracking-widest font-bold uppercase cursor-pointer text-center font-bold">
                PROCEED_PURGE ✓
              </button>
            </div>
          </div>
        </div>)}

    </div>);
}
