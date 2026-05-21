/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, Menu } from 'lucide-react';
export default function Header({ notifications, markAsRead, clearNotifications, onOpenSettings, onOpenProfile, onToggleMobileSidebar }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const unreadCount = notifications.filter(n => !n.read).length;
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (<header id="top-bar" className="sticky top-0 z-30 flex h-18 w-full items-center justify-between bg-[#F5F5F0] border-b border-[#141414] px-3 sm:px-5 md:px-6 lg:px-8 transition-all select-none">
      
      {/* Mobile view top left: Hamburger & Logo */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button id="btn-mobile-menu" onClick={onToggleMobileSidebar} className="p-1.5 text-[#141414] hover:bg-[#E2E2D9] rounded-none lg:hidden transition-colors border border-[#141414]">
          <Menu className="w-5 h-5"/>
        </button>
        <div className="flex items-center gap-1.5 lg:hidden">
          <div className="w-6 h-6 rounded-full bg-[#141414] flex items-center justify-center text-white font-serif italic text-xs">
            W
          </div>
          <span className="font-serif text-sm sm:text-base italic text-[#141414] tracking-tight hidden min-[380px]:inline-block">Wealth_Flow</span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5" id="header-controls">
        
        {/* Notifications Bell */}
        <div className="relative" ref={notificationRef}>
          <button id="btn-bell" onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-[#141414] hover:bg-[#141414] hover:text-white rounded-none border border-transparent hover:border-[#141414] transition-all relative">
            <Bell className="w-4 h-4"/>
            {unreadCount > 0 && (<span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F27D26]"/>)}
          </button>

          {showNotifications && (<div className="fixed left-2 right-2 top-[4.5rem] bg-[#F5F5F0] border-2 border-[#141414] rounded-none shadow-xl z-50 overflow-hidden text-xs sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2.5 sm:w-80">
              <div className="p-4 border-b border-[#141414] bg-[#E2E2D9] flex justify-between items-center">
                <span className="font-bold text-[10px] uppercase tracking-widest text-[#141414]">NOTIFICATIONS</span>
                {unreadCount > 0 && (<button onClick={clearNotifications} className="text-[10px] text-[#F27D26] hover:underline uppercase font-bold tracking-wider">
                    Clear All
                  </button>)}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#141414]/10">
                {notifications.length === 0 ? (<div className="p-6 text-center text-[#141414]/50 text-xs font-serif italic">
                    No active notifications.
                  </div>) : (notifications.map((notif) => (<div key={notif.id} className={`p-3.5 hover:bg-[#E2E2D9]/30 transition-colors ${!notif.read ? 'bg-[#F27D26]/5 font-medium' : ''}`}>
                      <div className="flex gap-2.5 items-start">
                        {notif.type === 'alert' && (<div className="w-1.5 h-1.5 rounded-full bg-[#F27D26] mt-1.5 shrink-0"/>)}
                        <div className="flex-1 text-[11px]">
                          <p className="font-bold text-[#141414] uppercase tracking-wider">{notif.title}</p>
                          <p className="text-[#141414]/70 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[9px] text-[#141414]/40 font-mono mt-1 uppercase tracking-widest">{notif.time}</p>
                        </div>
                        {!notif.read && (<button onClick={() => markAsRead(notif.id)} className="text-[9px] text-[#F27D26] hover:underline uppercase font-bold font-mono tracking-widest">
                            DISMISS
                          </button>)}
                      </div>
                    </div>)))}
              </div>
            </div>)}
        </div>

        {/* Settings wheel */}
        <button id="btn-settings" onClick={onOpenSettings} className="p-2 text-[#141414] hover:bg-[#141414] hover:text-white rounded-none border border-transparent hover:border-[#141414] transition-colors">
          <Settings className="w-4 h-4"/>
        </button>

        {/* Divider */}
        <div className="h-6 w-[1.5px] bg-[#141414]/20 mx-1"></div>

        {/* Personal initials block */}
        <button id="btn-profile-avatar" onClick={onOpenProfile} className="w-8 h-8 rounded-full bg-[#141414] hover:bg-[#F27D26] text-white font-mono text-[10px] tracking-widest flex items-center justify-center transition-all hover:scale-105 active:scale-95">
          AM
        </button>
      </div>
    </header>);
}
