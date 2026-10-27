# Realtor Agent Studio

The Realtor edition of the Studio line. Realtor Agent Studio helps a residential real estate agent design a Muse agent that works as their right hand, running the stack modules the agent chooses, inside approval rules the agent sets, with a soul the agent writes.

Sibling studios: Owner Agent Studio (a governed personal agent for owners), CourseAgent Studio (the same pattern for faculty), Manager Agent Studio (a chief of staff for people managers, built on the Manager Impact Stack), and Muse Switch Kit (bring an existing AI setup over to Muse).

## Who it is for

Residential real estate agents (Realtors) who carry their own leads, listings, transactions, and sphere. No prompt engineering assumed. The studio takes about five minutes. The agent's market area and brokerage are inputs from the first step and land in the agent's identity statement.

## The stack mapping

The audit in Step 1 rates fifteen concrete Realtor routines in four groups (Leads, Listings, Transactions, Past clients and content). Each routine is scored by time (hours per week) times how draining it feels times how much of it an agent can genuinely carry. Every routine feeds one stack module:

| Module | What the agent does | Fed by audit routines |
| --- | --- | --- |
| Lead Responder | Speed-to-lead draft replies in the agent's voice, follow-up sequences for stale leads, consultation booking prep, a daily lead digest | New lead response, old lead follow-up, qualifying inquiries, booking consultations |
| Listing Launch | Listing copy drafts from facts the agent provides, photo order, the launch checklist, open house plan and promotion drafts | Listing copy and photo order, launch checklist, open house prep and promotion, price-change and status updates |
| Transaction Coordinator | Deadline tracking, document chase lists, client update drafts at each milestone | Coordinating inspections, appraisals, and deadlines, chasing paperwork and signatures, keeping clients updated |
| Sphere and Content | Past-client touch plan, market update drafts from numbers the agent supplies, review and referral ask drafts, anniversary and holiday touches | Sphere check-ins and referral asks, market update posts and emails, review requests, anniversary and holiday touches |

The reclaim estimate uses a conservative 60 percent planning rate, labeled as an estimate everywhere it appears.

## The flow

1. **Find.** Rate your real estate week: time chips and energy chips per routine, plus your name, brokerage, and market area. The studio scores where an agent helps most.
2. **The Stack.** Your top opportunities, mapped to the four modules. Toggle which modules your agent runs (at least one; the default covers your top two scored areas).
3. **Soul.** Name the agent, write its identity ("You are NAME, right hand to a Realtor serving MARKET: ..."), pick its bearings and values, set never-do rules in preset form and in your own words (your words land in the package verbatim), and approve the voice sample line it will speak in.
4. **Approvals and your brief.** Set the approval matrix (sending a message, posting publicly, scheduling, sending documents for signature, and contacting the other side all default to Always ask first; drafting defaults to Runs freely), name yourself as the accountable owner, and copy the final package.

The package has three sections, in order: **Section 1: Who your agent is** (the soul), **Section 2: What your agent does** (system prompt, the stack with the audit behind it, and a sample first task output generated from your choices: a same-day lead follow-up plan, a listing launch checklist, a transaction watch, and the week's sphere touches, for whichever modules are on), **Section 3: Where you stay in charge** (the approval matrix as standing orders, the standing guardrails, and the owner line).

## Compliance guardrails built in

- **Fair housing binds the whole brief.** Section 3 carries a standing guardrail: never write anything that steers buyers toward or away from a neighborhood, or describes a neighborhood by the people who live in it. Describe the home, the street, and the facts. It appears in every package, whether or not the user selects the matching never-do chip, and no approval level unlocks steering language.
- **No invented numbers, ever.** A second standing guardrail: every price, comparable sale, and market statistic in a draft comes from the Realtor or a source the Realtor provided. If a number is not on file, the agent says so and asks.
- **The never-do presets carry the same spine in the soul step:** never invent a price, comp, or market statistic; never write steering or neighborhood-by-people language; never send anything to a lead, client, or other agent without approval; never promise timelines, offers, or outcomes; never share one client's information with another.
- **No owner, no agent.** The package will not generate until a named accountable Realtor exists, and the owner names themselves.
- **Your words are verbatim.** Free-text never-do rules and the voice sample line you approve ship exactly as written.

## Honesty notes

- Copy and paste is the bridge today. There is no Muse login or provisioning API yet, so the studio does not transfer anything automatically: you copy the package and paste it into Muse yourself.
- The conversion from audit to stack is rule-based and visible. Scores, the reclaim rate, and module jobs are all printed in the package, not hidden.
- The studio runs entirely in your browser. Nothing you type is sent anywhere; your work autosaves to localStorage on your device only.

## Run it locally

Open `index.html` in any browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Tests

```sh
node tests/harness.js
```

The harness extracts the pure `agent-core` script block from `index.html` and asserts the catalogs, the scoring math (including the 60 percent reclaim), the heavy-lead profile ranking Lead Responder first, module toggling effects on the package and the first task output, the three-section output, the agent name and market in the identity, the verbatim soul fields, the conservative approval defaults, the fair housing and no-invented-numbers guardrails binding even with no never-do chips selected, the owner gate, and zero em dashes in generated output and in the file itself.
