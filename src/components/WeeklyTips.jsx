/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Sparkles, Lightbulb, ChevronRight, X, TrendingUp } from 'lucide-react';
import { FINANCIAL_TIPS } from '../mockData';
export default function WeeklyTips() {
    const [activeTipIndex, setActiveTipIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const hasTips = FINANCIAL_TIPS.length > 0;
    const currentTip = FINANCIAL_TIPS[activeTipIndex];
    const handleNextTip = () => {
        if (!hasTips)
            return;
        setActiveTipIndex((prev) => (prev + 1) % FINANCIAL_TIPS.length);
    };
    return (<>
      <section id="weekly-financial-tips" className="bg-[#F27D26] p-6 rounded-none border border-[#141414] text-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] transition-all flex flex-col justify-between h-full relative overflow-hidden group select-none">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-1.5 bg-[#141414] text-white px-3 py-1 rounded-none border border-[#141414]">
              <Lightbulb className="w-3.5 h-3.5 text-[#F27D26]"/>
              <h3 className="text-[9px] font-mono font-bold uppercase tracking-[0.2em]">WEEKLY_ADVICE</h3>
            </div>
            
            <button onClick={handleNextTip} disabled={!hasTips} className="text-[9px] bg-white hover:bg-[#E2E2D9] disabled:bg-[#E2E2D9]/70 disabled:text-[#141414]/40 text-[#141414] font-mono tracking-widest font-bold py-1 px-3 leading-none rounded-none transition-colors flex items-center gap-1 border border-[#141414]" title="Next dynamic recommendation">
              <span>NEXT</span>
              <ChevronRight className="w-3 h-3"/>
            </button>
          </div>

          <p className="font-serif text-base italic text-[#141414] font-semibold mb-6 leading-relaxed">
            {hasTips ? `"${currentTip.summary}"` : '"No weekly financial advice available yet."'}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between mt-auto">
          <button id="btn-tips-learn-more" onClick={() => setShowModal(true)} disabled={!hasTips} className="bg-[#141414] hover:bg-neutral-800 disabled:bg-[#141414]/60 text-white rounded-none py-1.5 px-3.5 text-[10px] font-mono tracking-widest uppercase font-bold flex items-center gap-1 transition-all border border-[#141414]">
            CATALOGUE_MORE 
          </button>
          
          <span className="text-[10px] text-[#141414]/70 font-mono tracking-widest font-bold">
            {hasTips ? `${activeTipIndex + 1} // ${FINANCIAL_TIPS.length}` : '0 // 0'}
          </span>
        </div>
      </section>

      {/* PopUp detailed action guidelines Drawer/Modal */}
      {showModal && hasTips && (<div className="fixed inset-0 bg-[#141414]/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
          <div className="bg-[#F5F5F0] border-2 border-[#141414] rounded-none max-w-md w-full overflow-hidden shadow-2xl relative animate-scale-up">
            
            {/* Header decor */}
            <div className="bg-[#141414] p-6 text-white">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-white hover:bg-white/10 p-1.5 rounded-none transition-all border border-white/20">
                <X className="w-4 h-4"/>
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#F27D26]"/>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#F27D26]">ACCUMULATION_STUDIO</span>
              </div>
              <h4 className="font-serif text-2xl italic font-bold leading-tight">{currentTip.title}</h4>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-5 text-sm text-[#141414]">
              <p className="leading-relaxed bg-[#E2E2D9]/40 p-4 rounded-none border border-[#141414]/15 font-semibold text-xs leading-relaxed text-[#141414]/80">
                {currentTip.detail}
              </p>

              {/* Action plan bulletpoints */}
              <div>
                <h5 className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#141414]/50 mb-3">TACTILE EXECUTION BLUEPRINT</h5>
                <ul className="space-y-3 text-xs font-semibold">
                  <li className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 bg-[#F27D26] shrink-0 mt-1 border border-[#141414]/10"/>
                    <span>Audit current transaction lists regularly under the **Transactions** view module.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 bg-[#F27D26] shrink-0 mt-1 border border-[#141414]/10"/>
                    <span>Establish safe limits on variable spending using the custom **Budgets** modifier.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2.5 h-2.5 bg-[#F27D26] shrink-0 mt-1 border border-[#141414]/10"/>
                    <span>Convert reporting to multi-currencies using the **Currency Converter** widget.</span>
                  </li>
                </ul>
              </div>

              {/* Direct savings metric */}
              <div className="bg-[#EBEBE4] p-4 rounded-none border border-[#141414]/20 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-[#F27D26]"/>
                  Impact Metric:
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F27D26] bg-[#141414] px-2 py-0.5">
                  {currentTip.impactGoal}
                </span>
              </div>
            </div>

            {/* Footer close */}
            <div className="px-6 py-4 bg-[#E2E2D9] border-t border-[#141414]/10 flex justify-end">
              <button onClick={() => setShowModal(false)} className="bg-[#141414] hover:bg-[#F27D26] text-white px-5 py-2 w-full md:w-auto rounded-none text-xs font-bold uppercase tracking-widest transition-all border border-[#141414]">
                DISMISS_ADVICE
              </button>
            </div>

          </div>
        </div>)}
    </>);
}
