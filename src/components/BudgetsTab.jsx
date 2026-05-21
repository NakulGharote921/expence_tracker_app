/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Wallet, AlertTriangle, PenTool, Plus, CheckCircle2, Trash2 } from 'lucide-react';
export default function BudgetsTab({ budgets, categories, onUpdateBudget, onAddBudget, onDeleteBudget }) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [editLimit, setEditLimit] = useState('');
    const [showAddBudget, setShowAddBudget] = useState(false);
    const [addCat, setAddCat] = useState(Object.keys(categories)[0] || 'Food');
    const [addLimit, setAddLimit] = useState('');
    const activeCategoriesInBudgets = budgets.map(b => b.category);
    const eligibleCategoriesForNewBudget = Object.keys(categories).filter(c => !activeCategoriesInBudgets.includes(c));
    const startEditing = (b) => {
        setEditingCategory(b.category);
        setEditLimit(b.limit.toString());
    };
    const saveEdit = (category) => {
        const limitNum = parseFloat(editLimit);
        if (!isNaN(limitNum) && limitNum > 0) {
            onUpdateBudget(category, limitNum);
            setEditingCategory(null);
        }
    };
    const handleCreate = (e) => {
        e.preventDefault();
        const limitNum = parseFloat(addLimit);
        if (!isNaN(limitNum) && limitNum > 0) {
            onAddBudget(addCat, limitNum);
            setAddLimit('');
            setShowAddBudget(false);
        }
    };
    return (<div id="budgets-tab-view" className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#141414]/15 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-semibold text-[#141414] tracking-tight">Active Monthly Budgets</h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#141414]/60 mt-2">DESIGN LIMITS ON SPECIFIC CLASSIFICATIONS TO SAFE-KEEP DEPOSITS</p>
        </div>

        {eligibleCategoriesForNewBudget.length > 0 && (<button id="btn-add-budget-trigger" onClick={() => setShowAddBudget(!showAddBudget)} className="bg-[#141414] text-white hover:bg-[#F27D26] rounded-none text-[10px] font-mono tracking-widest font-bold uppercase py-2 px-4 flex items-center gap-2 border border-[#141414] transition-all outline-none cursor-pointer">
            <Plus className="w-3.5 h-3.5"/>
            Establish New Limit
          </button>)}
      </div>

      {showAddBudget && (<form onSubmit={handleCreate} className="bg-white p-5 rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-[#141414]/15">
            <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-[#141414] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#F27D26]"/>
              CONFIGURE CUSTOM BUDGET CAPS
            </span>
            <button type="button" onClick={() => setShowAddBudget(false)} className="text-[#141414]/60 hover:text-[#141414] text-xs font-mono font-bold tracking-wider cursor-pointer">
              [✕ CLOSE]
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 mb-1.5 px-0.5 uppercase tracking-wider">Select Category Classification</label>
              <select value={addCat} onChange={e => setAddCat(e.target.value)} className="w-full bg-[#EBEBE4] border border-[#141414] focus:bg-white text-xs rounded-none py-2 px-3 outline-none text-[#141414] font-bold uppercase tracking-wider">
                {eligibleCategoriesForNewBudget.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 mb-1.5 px-0.5 uppercase tracking-wider">Monthly Spending Limit (INR)</label>
              <input type="number" value={addLimit} onChange={e => setAddLimit(e.target.value)} placeholder="e.g. 5000" className="w-full bg-[#EBEBE4] border border-[#141414] focus:bg-white text-xs rounded-none py-2 px-3 outline-none font-mono font-semibold" required/>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddBudget(false)} className="text-xs font-mono font-bold text-[#141414]/60 hover:text-[#141414] py-1.5 px-4 rounded-none transition-all cursor-pointer border border-transparent hover:border-[#141414]/10 bg-transparent">
              [CANCEL]
            </button>
            <button type="submit" className="bg-[#141414] hover:bg-[#F27D26] text-white text-[10px] font-mono font-bold uppercase tracking-widest py-2 px-5 rounded-none border border-[#141414] transition-all cursor-pointer">
              Create Budget Limit
            </button>
          </div>
        </form>)}

      {/* Grid of Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="budgets-card-grid">
        {budgets.map((b) => {
            const categoryMeta = categories[b.category] || { color: '#999', bgLight: 'bg-slate-100', iconName: 'HelpCircle' };
            const percentage = Math.round((b.spent / b.limit) * 100);
            let level = 'safe';
            if (percentage >= 95) {
                level = 'critical';
            }
            else if (percentage >= 80) {
                level = 'warning';
            }
            const isEditing = editingCategory === b.category;
            // Compute custom visual boundaries depending on status level
            let borderShadowClass = 'border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414]';
            let progressColorClass = 'bg-[#16a34a]'; // safe
            let pctTextClass = 'text-[#16a34a]/85';
            if (level === 'critical') {
                borderShadowClass = 'border-red-650 shadow-[4px_4px_0px_0px_#dc2626]';
                progressColorClass = 'bg-red-650 animate-pulse';
                pctTextClass = 'text-red-600 font-extrabold';
            }
            else if (level === 'warning') {
                borderShadowClass = 'border-[#F27D26] shadow-[4px_4px_0px_0px_#F27D26]';
                progressColorClass = 'bg-[#F27D26]';
                pctTextClass = 'text-[#F27D26] font-extrabold';
            }
            return (<div key={b.category} id={`budget-card-${b.category}`} className={`bg-white p-6 rounded-none border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${borderShadowClass}`}>
              <div>
                {/* Header card details */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full inline-block shrink-0 border border-[#141414]" style={{ backgroundColor: categoryMeta.color }}/>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-sm text-[#141414] font-mono uppercase tracking-wider">
                        {b.category}
                      </h3>
                      
                      {/* Visual Status Indicator Badge */}
                      {level === 'critical' ? (<span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 border border-red-600 text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">
                          <AlertTriangle className="w-2.5 h-2.5 text-red-600 animate-bounce"/>
                          CRIT 95%
                        </span>) : level === 'warning' ? (<span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F27D26]/15 border border-[#F27D26] text-[#F27D26] text-[8px] font-mono font-bold tracking-widest uppercase animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5 text-[#F27D26]"/>
                          WARN 80%
                        </span>) : (<span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 border border-[#16a34a] text-[#16a34a] text-[8px] font-mono font-bold tracking-widest uppercase">
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#16a34a]"/>
                          SAFE
                        </span>)}
                    </div>
                  </div>

                  {!isEditing && (<div className="flex items-center gap-1.5">
                      <button onClick={() => startEditing(b)} className="p-1.5 border border-[#141414]/25 text-[#141414] hover:bg-[#F27D26] hover:text-white rounded-none transition-all cursor-pointer" title="Adjust boundary limits">
                        <PenTool className="w-3.5 h-3.5"/>
                      </button>
                      {onDeleteBudget && (<button type="button" onClick={() => onDeleteBudget(b.category)} className="p-1.5 border border-[#141414]/25 text-[#141414] hover:bg-red-650 hover:text-white rounded-none transition-all cursor-pointer" title="Delete budget limit">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>)}
                    </div>)}
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-baseline justify-between text-xs font-mono font-semibold text-[#141414]/70">
                    <span>SPENT TO DATE</span>
                    <span className="font-mono text-xs font-bold text-[#141414]">₹{b.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="w-full bg-[#EBEBE4] border border-[#141414] p-0.5 h-4 rounded-none overflow-hidden flex items-center">
                    <div className={`h-2.5 rounded-none transition-all duration-500 ease-out ${progressColorClass}`} style={{ width: `${Math.min(100, percentage)}%` }}/>
                  </div>

                  <div className="flex items-center justify-between font-bold text-[10px] text-[#141414]/60 font-mono uppercase tracking-wider">
                    <span className={pctTextClass}>{percentage}% USED</span>
                    <span>
                      {isEditing ? (<div className="flex items-center gap-1.5">
                          <span>Limit: ₹</span>
                          <input type="number" step="100" value={editLimit} onChange={e => setEditLimit(e.target.value)} className="bg-[#EBEBE4] border border-[#141414] focus:bg-white text-[11px] rounded-none p-1 outline-none w-20 font-mono font-bold"/>
                        </div>) : (`Max Cap: ₹${b.limit.toLocaleString()}`)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings and alerts */}
              <div className="mt-4 pt-3.5 border-t border-[#141414]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                {level === 'critical' ? (<div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase font-black text-red-600">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0"/>
                    <span>Critical budget exhaustion</span>
                  </div>) : level === 'warning' ? (<div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase font-extrabold text-[#F27D26]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F27D26] shrink-0"/>
                    <span>Approaching monthly boundary</span>
                  </div>) : (<div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase font-extrabold text-[#16a34a]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0"/>
                    <span>Safe budget margins</span>
                  </div>)}

                {isEditing ? (<div className="flex gap-1.5 self-end">
                    <button onClick={() => saveEdit(b.category)} className="bg-[#141414] hover:bg-[#16a34a] text-white font-mono font-bold text-[9px] tracking-wider uppercase py-1 px-3 border border-[#141414] transition-all cursor-pointer">
                      Save
                    </button>
                    <button onClick={() => setEditingCategory(null)} className="bg-[#EBEBE4] text-[#141414] hover:bg-neutral-300 font-mono font-bold text-[9px] tracking-wider uppercase py-1 px-3 border border-[#141414] transition-all cursor-pointer">
                      Cancel
                    </button>
                  </div>) : (<span className="text-[10px] text-[#141414]/50 font-mono font-bold uppercase tracking-wider self-end sm:self-auto">
                    {(b.limit - b.spent) >= 0 ? `Remaining: ₹${(b.limit - b.spent).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `Overdraft: -₹${Math.abs(b.limit - b.spent).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </span>)}
              </div>
            </div>);
        })}
      </div>

    </div>);
}
