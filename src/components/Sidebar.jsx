/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { LayoutDashboard, Receipt, Wallet, Tags, BarChart3, Plus, HelpCircle, LogOut, UserPlus, ChevronRight } from 'lucide-react';
export default function Sidebar({ activeTab, setActiveTab, onQuickAdd, onOpenSupport, onOpenProfile, premiumStatus, onUpgradePlan, onLogout }) {
    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'transactions', name: 'Transactions', icon: Receipt },
        { id: 'budgets', name: 'Budgets', icon: Wallet },
        { id: 'categories', name: 'Categories', icon: Tags },
        { id: 'reports', name: 'Reports', icon: BarChart3 },
    ];
    return (<aside id="sidebar-nav" className="hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col bg-[#F5F5F0] border-r border-[#141414] select-none transition-all lg:w-[260px] lg:px-6 lg:py-8">
      {/* Brand logo */}
      <div className="mb-8 flex flex-col gap-1">
        <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#141414]/40">CURATED LEDGER</span>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#141414] flex items-center justify-center text-white font-serif italic text-sm">
            W
          </div>
          <span className="font-serif text-xl italic text-[#141414] tracking-tight">Wealth_Flow</span>
        </div>
      </div>

      {/* User Profile Card */}
      <div id="profile-card" onClick={onOpenProfile} className="flex items-center gap-3 mb-8 p-3 rounded-none bg-transparent border border-[#141414] hover:bg-[#141414] hover:text-white cursor-pointer transition-all duration-200 group">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#141414] group-hover:border-white transition-colors bg-[#E2E2D9]">
          <img alt="Alex Morgan" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBULAx8DIXqalKeGttF9Tr8qB6KfKOyNnYY6czPiNjuztmJmCAp_6L7kszqOLr_bXi6wHnUUrc293St_WMDqwvMjgiP9SiKNQ7bbFflUxqBQ6G1XqElOL1jiHOZHjCjXcrVf8vi_ga8DGPbIoyxzyZl--dbwD6FSUJljH_RcPYO9hvwDPCUKcYIw2mz4BymItd5isOlCRy5c1IQYswgR38DO9nFW-rbevufI-DSq0wKHbKcbKzIik6Nv6QDDgl1TquwAZfXpYa6ufbs"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-xs italic text-[#141414] group-hover:text-white truncate">Alex Morgan</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[8px] font-mono tracking-[0.1em] uppercase text-[#F27D26] font-bold">
              {premiumStatus ? 'PRIME_EXHIBIT' : 'DEMO_STUDIO'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5" id="nav-container">
        {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (<button key={item.id} id={`nav-item-${item.id}`} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between rounded-none px-4 py-3 text-[11px] uppercase tracking-widest font-bold transition-all duration-150 ${isActive
                    ? 'bg-[#141414] text-white border-l-4 border-[#F27D26]'
                    : 'text-[#141414]/70 hover:bg-[#141414]/10 hover:text-[#141414]'}`}>
              <div className="flex items-center gap-3">
                <IconComponent className="w-4 h-4 shrink-0"/>
                <span>{item.name}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0.5 opacity-100 text-[#F27D26]' : 'opacity-0'}`}/>
            </button>);
        })}
      </nav>

      {/* Primary Actions & Footer */}
      <div className="mt-auto space-y-2 pt-6 border-t border-[#141414]/10" id="sidebar-footer">
        <button id="btn-sidebar-quick-add" onClick={onQuickAdd} className="w-full flex items-center justify-center gap-2 bg-[#F27D26] hover:bg-[#141414] text-white py-3 rounded-none font-bold text-xs uppercase tracking-widest active:scale-98 transition-all border border-[#141414]/20">
          <Plus className="w-4 h-4"/>
          EXHIBIT +
        </button>

        {!premiumStatus && (<button id="btn-sidebar-upgrade" onClick={onUpgradePlan} className="w-full flex items-center justify-center gap-2 border border-dashed border-[#F27D26] text-[#F27D26] py-2.5 rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-[#F27D26]/5 active:scale-98 transition-all mt-2">
            <UserPlus className="w-3.5 h-3.5"/>
            GO SUPREME
          </button>)}

        <button id="btn-sidebar-support" onClick={onOpenSupport} className="w-full flex items-center gap-3 text-[#141414]/65 hover:text-[#141414] px-4 py-2 hover:bg-[#E2E2D9]/40 rounded-none transition-all text-[11px] font-bold uppercase tracking-widest">
          <HelpCircle className="w-4 h-4 shrink-0"/>
          <span>Support</span>
        </button>

        <button id="btn-sidebar-signout" onClick={onLogout} className="w-full flex items-center gap-3 text-[#141414]/65 hover:text-[#F27D26] px-4 py-2 hover:bg-[#F27D26]/10 rounded-none transition-all text-[11px] font-bold uppercase tracking-widest">
          <LogOut className="w-4 h-4 shrink-0"/>
          <span>Log Out</span>
        </button>
      </div>
    </aside>);
}
