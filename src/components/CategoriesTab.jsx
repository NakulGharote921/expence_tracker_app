/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Tags, ShieldAlert, Plus } from 'lucide-react';
import { getCategoryIcon } from './ExpenseHistory';
export default function CategoriesTab({ categories, transactions, onAddCategory }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newColor, setNewColor] = useState('#3b82f6');
    const [newIcon, setNewIcon] = useState('LayoutGrid');
    const [error, setError] = useState('');
    // Sample static list of colors for picker convenience
    const paletteColors = [
        '#3b82f6', // Blue
        '#10b981', // Emerald
        '#f97316', // Orange
        '#a855f7', // Purple
        '#f43f5e', // Rose
        '#06b6d4', // Cyan
        '#eab308', // Yellow
        '#64748b' // Slate
    ];
    // List of Lucide icon keys available for selection
    const iconOptions = [
        { label: 'Chef Hat (Food)', value: 'ChefHat' },
        { label: 'Airplane (Travel)', value: 'Plane' },
        { label: 'Megaphone (Marketing)', value: 'Megaphone' },
        { label: 'Lightning Bolt (Utilities)', value: 'Zap' },
        { label: 'Grid Accent (Other)', value: 'LayoutGrid' },
        { label: 'Shield Money', value: 'ShieldCheck' },
        { label: 'Shopping cart', value: 'ShoppingCart' },
        { label: 'Car Transportation', value: 'Car' },
        { label: 'Heart Wellness', value: 'Heart' },
        { label: 'Trophy Gamings', value: 'Trophy' }
    ];
    // Dynamically count transaction entries & total dollar spent per category
    const getCategoryStats = (catName) => {
        const list = transactions.filter(t => t.category === catName);
        const count = list.length;
        const spentObj = list.filter(t => t.type === 'expense').reduce((sum, curr) => sum + curr.amount, 0);
        return { count, spentObj };
    };
    const handleCreate = (e) => {
        e.preventDefault();
        setError('');
        if (!newCatName.trim()) {
            setError('Please provide a category name.');
            return;
        }
        if (categories[newCatName.trim()]) {
            setError('This category name already exists.');
            return;
        }
        onAddCategory(newCatName.trim(), newColor, newIcon);
        // Reset
        setNewCatName('');
        setShowAddForm(false);
    };
    return (<div id="categories-tab-view" className="space-y-6">
      
      {/* Title header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#141414]/15 pb-4">
        <div>
          <h2 className="text-4xl font-serif italic font-semibold text-[#141414] tracking-tight">System Ledger Classifications</h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#141414]/60 mt-2">CONFIGURE NAME HEADERS, REPRESENTATIONAL ICONS, AND COLOR BADGES DYNAMICALLY</p>
        </div>

        <button id="btn-add-category-trigger" onClick={() => setShowAddForm(!showAddForm)} className="bg-[#141414] text-white hover:bg-[#F27D26] rounded-none text-[10px] font-mono tracking-widest font-bold uppercase py-2 px-4 flex items-center gap-2 border border-[#141414] transition-all outline-none cursor-pointer">
          <Plus className="w-3.5 h-3.5"/>
          Add Category Head
        </button>
      </div>

      {showAddForm && (<form onSubmit={handleCreate} className="bg-white p-5 rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-[#141414]/15">
            <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-[#141414] flex items-center gap-2">
              <Tags className="w-4 h-4 text-[#F27D26]"/>
              CONFIGURE CUSTOM CATEGORY PARAMETERS
            </span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-[#141414]/60 hover:text-[#141414] text-xs font-mono font-bold tracking-wider cursor-pointer">
              [✕ CLOSE]
            </button>
          </div>

          {error && (<div className="p-3 bg-red-100 text-red-800 text-xs rounded-none border border-red-250 flex items-center gap-1.5 flex-row">
              <ShieldAlert className="w-4 h-4 shrink-0"/>
              <span>{error}</span>
            </div>)}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 mb-1.5 px-0.5 uppercase tracking-wider">Category Header Name</label>
              <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Healthcare" className="w-full bg-[#EBEBE4] border border-[#141414] focus:bg-white text-xs rounded-none py-2 px-3 outline-none font-semibold text-[#141414]" required/>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 mb-1.5 px-0.5 uppercase tracking-wider">Associated Representation Icon</label>
              <select value={newIcon} onChange={e => setNewIcon(e.target.value)} className="w-full bg-[#EBEBE4] border border-[#141414] focus:bg-white text-xs rounded-none py-2.5 px-3 outline-none text-[#141414] font-bold uppercase tracking-wider">
                {iconOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>

            {/* Custom Color Bullet Picker */}
            <div>
              <label className="block text-[9px] font-mono font-bold text-[#141414]/60 mb-1.5 px-0.5 uppercase tracking-wider">Assign Theme Color</label>
              <div className="flex items-center gap-1.5 flex-wrap bg-[#EBEBE4] p-1.5 rounded-none border border-[#141414]">
                {paletteColors.map(colorCode => (<button key={colorCode} type="button" onClick={() => setNewColor(colorCode)} className="w-5.5 h-5.5 rounded-full border border-black/15 transition-transform relative cursor-pointer" style={{ backgroundColor: colorCode }}>
                    {newColor === colorCode && (<span className="absolute inset-0 bg-white/30 rounded-full flex items-center justify-center text-[8px] font-black">
                        ✓
                      </span>)}
                  </button>))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-mono font-bold text-[#141414]/60 hover:text-[#141414] py-1.5 px-4 rounded-none transition-all cursor-pointer border border-transparent hover:border-[#141414]/10 bg-transparent">
              [CANCEL]
            </button>
            <button type="submit" className="bg-[#141414] hover:bg-[#F27D26] text-white text-[10px] font-mono font-bold uppercase tracking-widest py-2 px-5 rounded-none border border-[#141414] transition-all cursor-pointer">
              Register Category
            </button>
          </div>
        </form>)}

      {/* Grid of existing items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="categories-info-grid">
        {Object.keys(categories).map(catKey => {
            const cat = categories[catKey];
            const { count, spentObj } = getCategoryStats(catKey);
            return (<div key={catKey} id={`cat-card-${catKey}`} className="bg-white p-6 rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] transition-all relative flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 rounded-none border border-[#141414] flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                  {getCategoryIcon(cat.iconName)}
                </div>

                <span className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-widest bg-[#EBEBE4] px-2.5 py-1 border border-[#141414]/15">
                  {count} entry{count !== 1 ? 'ies' : ''}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-[#141414] font-mono uppercase tracking-wider mb-1">
                  {catKey}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#141414]/60 font-mono uppercase tracking-wider font-semibold">Spent Total:</span>
                  <span className="font-mono text-sm font-bold text-[#141414]">
                    ₹{spentObj.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#141414]/15 flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#141414]/50 uppercase">HEX REF: {cat.color}</span>
                <span className="w-3.5 h-3.5 rounded-full inline-block shrink-0 border border-[#141414]" style={{ backgroundColor: cat.color }}/>
              </div>
            </div>);
        })}
      </div>

    </div>);
}
