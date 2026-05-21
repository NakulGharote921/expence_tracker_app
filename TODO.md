# TODO - Improve Report tab

- [x] Refactor `src/components/ReportsTab.jsx` to compute daily trend from actual transaction dates (last 15 days) instead of hardcoded July 2024 dates.
- [x] Remove the artificial income fallback (`|| 1200.00`) so savings/net metrics reflect real data.
- [x] Optimize category chart calculations (memoize maxVal and other derived arrays; avoid repeated `Math.max(... )` per bar).
- [ ] Polish UX: tooltip formatting/positioning and legend crowding safeguards (e.g., optional top-N + “More”).

- [ ] Run build/lint/tests and verify charts render with empty/low data gracefully.
