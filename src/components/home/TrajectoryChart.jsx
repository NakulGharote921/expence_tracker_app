/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* ── Trajectory chart (responsive SVG) ────────────────── */
export default function TrajectoryChart() {
    /* Realistic 30-day expense data (₹) – starts low, trends up, natural fluctuations */
    const values = [
        620, 680, 740, 710, 840, 790, 860, 920, 880, 1050,
        980, 1020, 1100, 960, 920, 1080, 1140, 1200, 1120, 1280,
        1190, 1240, 1310, 1180, 1110, 1260, 1340, 1400, 1470, 1540,
    ];
    const w = 680;
    const h = 200;
    const padX = 12;
    const padT = 16;
    const padB = 28;
    const max = 1600;
    const n = values.length;

    const pts = values.map((v, i) => ({
        x: padX + (i * (w - padX * 2)) / (n - 1),
        y: padT + (1 - v / max) * (h - padT - padB),
    }));

    /* Smooth cubic bezier through all points (Catmull-Rom → cubic Bezier).
       Passes exactly through each data point without overshooting. */
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(n - 1, i + 2)];
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x} ${p2.y}`;
    }
    const area = `${d} L ${pts[n - 1].x} ${h} L ${pts[0].x} ${h} Z`;

    /* Dots at meaningful intervals (days ~1, 5, 10, 15, 20, 25, 30) */
    const dotIdx = [0, 4, 9, 14, 19, 24, 29];

    /* Grid lines */
    const gridYs = [40, 80, 120, 160];

    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="30-day expense trajectory showing average daily spending of ₹1,191"
        >
            <title>30-day expense trajectory showing average daily spending of ₹1,191</title>
            <defs>
                <linearGradient id="areaFade" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#141414" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#141414" stopOpacity="0.01" />
                </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {gridYs.map((y) => (
                <line key={y} x1={padX} x2={w - padX} y1={y} y2={y} stroke="#141414" strokeOpacity="0.07" strokeWidth="1" />
            ))}

            {/* Area fill */}
            <path d={area} fill="url(#areaFade)" />

            {/* Line */}
            <path d={d} fill="none" stroke="#141414" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

            {/* Data points at key intervals */}
            {dotIdx.map((i) => (
                <circle key={i} cx={pts[i].x} cy={pts[i].y} r="2.8" fill="#F5F5F0" stroke="#141414" strokeWidth="1.5" />
            ))}

            {/* End-point dot (slightly larger) */}
            <circle cx={pts[n - 1].x} cy={pts[n - 1].y} r="3.5" fill="#141414" />

            {/* X-axis labels */}
            {[0, 9, 19, 29].map((i) => (
                <text key={i} x={pts[i].x} y={h - 4} textAnchor="middle" fill="#141414" fillOpacity="0.3" fontSize="10" fontFamily="Manrope, sans-serif">
                    {i + 1}
                </text>
            ))}
        </svg>
    );
}
