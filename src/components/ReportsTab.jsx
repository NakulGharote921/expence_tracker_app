/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from 'react';
import { TrendingUp, IndianRupee, CalendarCheck, Layers } from 'lucide-react';
export default function ReportsTab({ transactions, categories }) {
    const [activeChart, setActiveChart] = useState('category');
    // Compute metric calculations
    const expenses = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions]);
    const incomes = useMemo(() => transactions.filter(t => t.type === 'income'), [transactions]);
    const totalExpense = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
    const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
    const netSavings = Math.max(0, totalIncome - totalExpense);
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
    const averageCost = expenses.length > 0 ? totalExpense / expenses.length : 0;
    const singleHighest = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
    // Group spends per category for the Bar chart
    const categoryTotals = useMemo(() => {
        const totals = Object.keys(categories).reduce((acc, catName) => {
            acc[catName] = 0;
            return acc;
        }, {});
        expenses.forEach(e => {
            if (totals[e.category] !== undefined) {
                totals[e.category] += e.amount;
            }
            else {
                totals['Other'] = (totals['Other'] || 0) + e.amount;
            }
        });
        return totals;
    }, [categories, expenses]);
    const categoryBarData = useMemo(() => {
        return Object.keys(categories)
            .map(catName => {
            const amount = categoryTotals[catName] || 0;
            return {
                name: catName,
                amount,
                color: categories[catName]?.color || '#999'
            };
        })
            .sort((a, b) => b.amount - a.amount);
    }, [categories, categoryTotals]);
    const categoryMaxVal = useMemo(() => {
        const maxFromData = categoryBarData.reduce((m, c) => Math.max(m, c.amount), 0);
        return Math.max(maxFromData, 1000);
    }, [categoryBarData]);
    const clampBarHeightPct = (value) => {
        const barHeight = categoryMaxVal > 0 ? (value / categoryMaxVal) * 100 : 0;
        return Math.max(3, barHeight);
    };
    const toISODate = (d) => d.toISOString().slice(0, 10);
    const parseISODateLocal = (iso) => {
        // treat YYYY-MM-DD as local date (avoid UTC shift)
        const [y, m, day] = iso.split('-').map(n => parseInt(n, 10));
        return new Date(y, m - 1, day);
    };
    // Group daily spends for Line Chart Trend (LAST 15 DAYS)
    const dailyTrendData = useMemo(() => {
        const expenseDates = expenses
            .map(e => e.date)
            .filter(Boolean)
            .sort((a, b) => parseISODateLocal(a).getTime() - parseISODateLocal(b).getTime());
        if (expenseDates.length === 0) {
            const today = new Date();
            const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const start = new Date(end);
            start.setDate(start.getDate() - 14);
            return Array.from({ length: 15 }, (_, i) => {
                const cur = new Date(start);
                cur.setDate(start.getDate() + i);
                return {
                    date: cur.getDate().toString(),
                    amount: 0
                };
            });
        }
        const lastDateISO = expenseDates[expenseDates.length - 1];
        const end = parseISODateLocal(lastDateISO);
        const start = new Date(end);
        start.setDate(start.getDate() - 14);
        const seriesDates = Array.from({ length: 15 }, (_, i) => {
            const cur = new Date(start);
            cur.setDate(start.getDate() + i);
            return toISODate(cur);
        });
        return seriesDates.map(dateStr => {
            const total = expenses
                .filter(tx => tx.date === dateStr)
                .reduce((sum, curr) => sum + curr.amount, 0);
            const curDate = parseISODateLocal(dateStr);
            return {
                date: curDate.getDate().toString(),
                amount: total
            };
        });
    }, [expenses]);
    // Calculate coordinates for SVG line drawing
    const maxLineVal = useMemo(() => {
        const maxFromData = dailyTrendData.reduce((m, d) => Math.max(m, d.amount), 0);
        return Math.max(maxFromData, 500);
    }, [dailyTrendData]);
    const heightMultiplier = 160 / maxLineVal; // max height is 160px for the chart
    const points = useMemo(() => {
        return dailyTrendData
            .map((d, index) => {
            const x = (index * (400 / 14)) + 40; // 400px width total, 15 points
            const y = 180 - (d.amount * heightMultiplier);
            return `${x},${y}`;
        })
            .join(' ');
    }, [dailyTrendData, heightMultiplier]);
    return (<div id="reports-tab-view" className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#141414]/15 pb-4">
        <div>
          <h2 className="text-4xl font-serif italic font-semibold text-[#141414] tracking-tight">Fintech Performance Analytics</h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#141414]/60 mt-2">STAGGERING CORPORATE GRAPHICS TRACKING CASH OUTLAYS, TRENDS, AND BUDGET METRICS</p>
        </div>

        {/* Chart View selector */}
        <div className="flex bg-[#EBEBE4] p-1 border border-[#141414] rounded-none w-fit shrink-0 self-start">
          <button id="btn-report-chart-cat" onClick={() => setActiveChart('category')} className={`text-[9px] font-mono tracking-wider uppercase font-bold py-1.5 px-4 rounded-none transition-all cursor-pointer ${activeChart === 'category' ? 'bg-[#141414] text-white' : 'text-[#141414]/70 hover:bg-[#141414]/10'}`}>
            Categories Distribution
          </button>
          <button id="btn-report-chart-trend" onClick={() => setActiveChart('trend')} className={`text-[9px] font-mono tracking-wider uppercase font-bold py-1.5 px-4 rounded-none transition-all cursor-pointer ${activeChart === 'trend' ? 'bg-[#141414] text-white' : 'text-[#141414]/70 hover:bg-[#141414]/10'}`}>
            Daily Expense Stream
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="reports-metrics-banner">
        
        {/* Metric Card */}
        <div className="bg-white p-4 rounded-none border border-[#141414] hover:shadow-[3px_3px_0px_0px_#141414] transition-all">
          <p className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-[#F27D26]"/> Net Monthly Savings
          </p>
          <p className="font-serif italic font-bold text-2xl text-[#141414]">
            ₹{netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[9px] font-mono font-bold text-[#16a34a] mt-1">
            Savings quota: {savingsRate}%
          </p>
        </div>

        {/* Metric Card */}
        <div className="bg-white p-4 rounded-none border border-[#141414] hover:shadow-[3px_3px_0px_0px_#141414] transition-all">
          <p className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#F27D26]"/> Average Spend Size
          </p>
          <p className="font-serif italic font-bold text-2xl text-[#141414]">
            ₹{averageCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[9px] font-mono font-bold text-[#141414]/50 mt-1">
            Computed across {expenses.length} values
          </p>
        </div>

        {/* Metric Card */}
        <div className="bg-white p-4 rounded-none border border-[#141414] hover:shadow-[3px_3px_0px_0px_#141414] transition-all">
          <p className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#F27D26]"/> Highest Single Spent
          </p>
          <p className="font-serif italic font-bold text-2xl text-[#141414]">
            ₹{singleHighest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[9px] font-mono font-bold text-red-650 mt-1">
            Delta booking / campaign
          </p>
        </div>

        {/* Metric Card */}
        <div className="bg-white p-4 rounded-none border border-[#141414] hover:shadow-[3px_3px_0px_0px_#141414] transition-all">
          <p className="text-[9px] font-mono font-bold text-[#141414]/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-[#F27D26]"/> Audit Records Logged
          </p>
          <p className="font-serif italic font-bold text-2xl text-[#141414]">
            {transactions.length} records
          </p>
          <p className="text-[9px] font-mono font-bold text-[#16a34a] mt-1">
            100% cloud secure metrics
          </p>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="bg-white p-6 rounded-none border border-[#141414] hover:shadow-[4px_4px_0px_0px_#141414] transition-all">
        
        {activeChart === 'category' ? (<div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-8 border-b border-[#141414]/10 pb-4">
              <div>
                <h3 className="text-xs font-mono font-bold text-[#141414] uppercase tracking-wider">
                  EXPENSE TOTALS BY CATEGORY CLASSIFICATION
                </h3>
                <p className="text-[8px] font-mono text-[#141414]/40 mt-1">Total Spend: ₹{totalExpense.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </div>
              <span className="text-[9px] font-mono text-[#141414]/55 uppercase">Sorted highest spend to lowest</span>
            </div>

            {/* Custom Responsive Bar Chart - Improved Layout */}
            <div className="w-full">
              {/* Grid Background Reference Lines */}
              <div className="relative mb-2 flex justify-between text-[7px] font-mono text-[#141414]/30 px-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>

              {/* Bar Chart Container */}
              <div className="relative bg-gradient-to-b from-[#EBEBE4]/20 to-transparent p-6 rounded-sm">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-l border-[#141414]/10">
                  <div className="border-t border-[#141414]/10"></div>
                  <div className="border-t border-[#141414]/10"></div>
                  <div className="border-t border-[#141414]/10"></div>
                  <div className="border-t border-[#141414]/10"></div>
                  <div className="border-t border-[#141414]/10"></div>
                </div>

                {/* Bars Grid - Fixed height container */}
                <div className="relative z-10 flex items-end justify-around gap-2 sm:gap-3" style={{ height: '256px' }}>
                  {categoryBarData.map((d) => {
                const heightPercent = categoryMaxVal > 0 ? (d.amount / categoryMaxVal) * 100 : 0;
                const percentage = totalExpense > 0 ? Math.round((d.amount / totalExpense) * 100) : 0;
                const barHeightPx = Math.max((heightPercent / 100) * 220, 8); // 220px max height, 8px min
                return (<div key={d.name} className="flex flex-col items-center flex-1 group cursor-pointer relative">
                        {/* Percentage Label */}
                        <div className="text-[7px] font-mono font-bold text-[#141414]/50 mb-2 h-4 flex items-center">
                          {percentage}%
                        </div>

                        {/* Bar */}
                        <div style={{
                        height: `${barHeightPx}px`,
                        backgroundColor: d.color,
                        transition: 'all 0.3s ease-out'
                    }} className="w-12 sm:w-16 rounded-sm border border-[#141414]/80 shadow-md hover:shadow-lg hover:scale-105 origin-bottom relative group/bar">
                          {/* Hover Gradient Overlay */}
                          <div className="absolute inset-0 opacity-0 group-hover/bar:opacity-20 bg-white transition-opacity"></div>
                        </div>

                        {/* Category Label */}
                        <span className="text-[8px] font-mono font-bold text-[#141414]/70 mt-2 text-center max-w-16 text-ellipsis overflow-hidden line-clamp-1">
                          {d.name}
                        </span>

                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-[#141414] text-white text-[8px] font-mono py-1.5 px-2.5 rounded-sm border border-[#141414] shadow-lg z-50 transition-all whitespace-nowrap pointer-events-none">
                          <div className="font-bold">₹{d.amount.toLocaleString()}</div>
                          <div className="text-[7px] text-[#EBEBE4]">{percentage}% of total</div>
                        </div>
                      </div>);
            })}
                </div>
              </div>
            </div>

            {/* Enhanced Legend Block */}
            <div className="mt-8 pt-6 border-t border-[#141414]/10">
              <p className="text-[8px] font-mono text-[#141414]/50 uppercase tracking-wider mb-3">Category Breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {categoryBarData.map((c) => {
                const percentage = totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0;
                return (<div key={c.name} className="flex items-start gap-2.5 border border-[#141414]/10 bg-[#EBEBE4]/40 p-2.5 rounded-sm hover:bg-[#EBEBE4]/60 transition-colors cursor-pointer">
                      <div className="w-3 h-3 rounded-full border border-[#141414]/40 flex-shrink-0 mt-1" style={{ backgroundColor: c.color }}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-mono font-bold text-[#141414]/70 uppercase tracking-wider truncate">{c.name}</p>
                        <p className="text-[9px] font-mono font-bold text-[#141414] mt-0.5">₹{c.amount.toLocaleString()}</p>
                        <p className="text-[7px] font-mono text-[#141414]/50 mt-0.5">{percentage}% share</p>
                      </div>
                    </div>);
            })}
              </div>
            </div>
          </div>) : (<div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b border-[#141414]/10 pb-4">
              <h3 className="text-xs font-mono font-bold text-[#141414] uppercase tracking-wider">
                DAILY RUNNING COST STREAM (LAST 15 DAYS)
              </h3>
              <span className="text-[9px] font-mono text-[#141414]/55 uppercase">Daily Aggregate (INR)</span>
            </div>

            {/* Custom SVG Line graph */}
            <div className="h-60 w-full overflow-hidden flex items-center justify-center pt-4">
              <svg viewBox="0 0 460 200" className="w-full max-w-2xl h-full font-mono text-[8.5px] text-[#141414]">
                {/* Horizontal mesh grids */}
                <line x1="40" y1="20" x2="440" y2="20" stroke="#141414" strokeWidth="0.5" strokeDasharray="3" opacity="0.15"/>
                <line x1="40" y1="100" x2="440" y2="100" stroke="#141414" strokeWidth="0.5" strokeDasharray="3" opacity="0.15"/>
                <line x1="40" y1="180" x2="440" y2="180" stroke="#141414" strokeWidth="1" opacity="0.4"/>

                {/* Vertical labels */}
                <text x="35" y="183" textAnchor="end" className="font-mono font-bold">0</text>
                <text x="35" y="103" textAnchor="end" className="font-mono font-bold">₹{Math.round(maxLineVal / 2)}</text>
                <text x="35" y="23" textAnchor="end" className="font-mono font-bold">₹{Math.round(maxLineVal)}</text>

                {/* Spline pathway */}
                {points && (<>
                    <polyline fill="none" stroke="#F27D26" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" points={points} className="transition-all duration-700 ease-in-out"/>
                    {/* Shadow underneath area chart */}
                    <polygon points={`40,180 ${points} 440,180`} fill="url(#area-gradient)" opacity="0.12"/>
                  </>)}

                {/* Interactive Dot indicators for points */}
                {dailyTrendData.map((d, index) => {
                const x = (index * (400 / 14)) + 40;
                const y = 180 - (d.amount * heightMultiplier);
                return (<g key={index} className="group cursor-pointer">
                      <circle cx={x} cy={y} r="4" fill="#141414" stroke="#fff" strokeWidth="2" className="transition-all hover:r-5 hover:fill-[#F27D26]"/>
                      {/* Anchor tooltips */}
                      <text x={x} y={y - 12} textAnchor="middle" className="hidden group-hover:block font-mono font-black text-[9px] fill-[#141414]">
                        ₹{Math.round(d.amount)}
                      </text>
                    </g>);
            })}

                {/* Date labels bottom footer */}
                {dailyTrendData.map((d, index) => {
                const x = (index * (400 / 14)) + 40;
                // print only every other label to save spacing on smaller screens
                if (index % 2 !== 0)
                    return null;
                return (<text key={index} x={x} y="195" textAnchor="middle" className="font-mono font-bold text-[8px] fill-[#141414]/60">
                      July {d.date}
                    </text>);
            })}

                {/* Definitions */}
                <defs>
                  <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F27D26"/>
                    <stop offset="100%" stopColor="#F27D26" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>)}
      </div>

    </div>);
}
