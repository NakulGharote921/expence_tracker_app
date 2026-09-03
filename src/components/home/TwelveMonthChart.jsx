/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* ── 12-month chart (responsive SVG) ──────────────────── */
export default function TwelveMonthChart() {
    return (
        <svg className="w-full h-full" preserveAspectRatio="xMidYMid meet" viewBox="0 0 500 180">
            <line stroke="#141414" strokeDasharray="3 3" strokeOpacity="0.06" x1={0} x2={500} y1={40} y2={40} />
            <line stroke="#141414" strokeDasharray="3 3" strokeOpacity="0.06" x1={0} x2={500} y1={90} y2={90} />
            <line stroke="#141414" strokeDasharray="3 3" strokeOpacity="0.06" x1={0} x2={500} y1={140} y2={140} />
            <path d="M0,130 Q50,110 100,100 T200,80 T300,60 T400,45 T500,30 L500,180 L0,180 Z" fill="#141414" fillOpacity="0.05" />
            <path d="M0,130 Q50,110 100,100 T200,80 T300,60 T400,45 T500,30" fill="none" stroke="#141414" strokeWidth="2.5" />
            <path d="M0,150 Q50,140 100,130 T200,135 T300,120 T400,115 T500,105" fill="none" stroke="#141414" strokeDasharray="4 2" strokeOpacity="0.4" strokeWidth={2} />
        </svg>
    );
}
