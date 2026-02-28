## Satellite App: Nonprofit Grant Burn & Risk Monitor

### Why I chose this problem

- **Restricted grants are high-stakes and time-consuming**: Nonprofit Controllers and CFOs must keep restricted grants within tight landing bands while satisfying board, donor, and audit scrutiny. Most of this work still lives in brittle spreadsheets.
- **They need a fast, trustworthy “sanity check,” not another system**: Before investing time to rebuild a workbook or ask staff for more analysis, they want a quick, directional read on “Are we on track or drifting into risk?”.
- **This aligns tightly with Truewind’s value prop**: Truewind sits on top of the ERP and already reasons over GL data and allocations. A grant burn/risk satellite app is a natural “preview” of what automated controls and monitoring could feel like inside their real data.

### Why this is the right solution

- **Single-page, no-login, no data upload** lowers friction for skeptical, compliance-driven buyers. They can try it in seconds with a single grant they know well, without trusting an integration or sharing data.
- **Inputs mirror the world they live in**: Grant amount, dates, cumulative spend, last three months of spend, and simple operational attributes (tracking method, program count, overhead band, reclass cadence). These are the same fields they already track in spreadsheets and board decks.
- **Scoring is fully rule-based and transparent**: Every band (burn, volatility, delta, freshness, complexity) is deterministic and visible in the UI. This directly addresses “AI trust” concerns by showing that the risk score is explainable, not a black box model.
- **It answers three core questions cleanly**:
  - “Where are we likely to land on this grant (%, $ buffer)?”
  - “How noisy / risky is our recent spending pattern?”
  - “Is our structure and process simple enough for manual oversight, or should we consider automation?”

### How this drives growth for Truewind

- **Creates a valuable first touchpoint**: Finance leaders can use the tool standalone to frame internal conversations about a single grant. If the app highlights “High Risk” or “Automation recommended,” it naturally sets up curiosity about deeper, automated monitoring.
- **Qualifies and educates leads**: The composite risk score, volatility, and automation readiness flags help Controllers recognize patterns (e.g., high complexity, stale data, manual tracking) where Truewind’s core product is strongest. By the time they talk to Truewind, they are problem-aware and more ready to engage.
- **Provides a clear product bridge**:
  - The app demonstrates what a Truewind “alert surface” could look like, but with manually entered data.
  - The next step is obvious: “Imagine this wired directly into your ERP with real grants, real allocations, and automated reconciliations instead of manual inputs.”
- **Supports content and outbound**: This tool can be embedded in blogs, newsletters, or outreach (“Quick grant risk check”) and then used in follow-up sales conversations (“Let’s run this on one of your real grants inside Truewind.”).

### AI tools used and how

- **Cursor AI assistant (this environment)**:
  - Generated the initial Next.js + TypeScript + Tailwind single-page layout, then iterated to a minimal two-column design tuned for nonprofit finance users.
  - Helped codify the scoring rules (burn bands, volatility, delta, freshness, complexity, composite) into a clean calculation module with clear edge-case handling.
  - Assisted in wiring up responsive behavior and live-updating calculations without any backend, keeping the app shippable and simple.
- **(If applicable) Other AI tools**:
  - If other models or tools were used, they were leveraged to draft copy and refine the UX language (risk band labels, helper text) so that the app feels credible and accessible to Controllers and CFOs.

