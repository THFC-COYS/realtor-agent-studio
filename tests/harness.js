/* Node harness for Realtor Agent Studio.
   Extracts the pure <script id="agent-core"> block from index.html and
   asserts its behavior. Run: node tests/harness.js
   The fixture is a scripted Realtor profile with a heavy lead load,
   mirroring the sample profile in the studio. */
"use strict";
var fs = require("fs"), os = require("os"), path = require("path");

var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var m = html.match(/<script id="agent-core">([\s\S]*?)<\/script>/);
if (!m) { console.error("agent-core block not found"); process.exit(1); }
var tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ras-")), "core.js");
fs.writeFileSync(tmp, m[1]);
var C = require(tmp);

var passed = 0, failed = 0, failures = [];
function check(name, cond) {
  if (cond) { passed++; }
  else { failed++; failures.push(name); console.log("FAIL: " + name); }
}
function includes(name, hay, needle) { check(name, typeof hay === "string" && hay.indexOf(needle) >= 0); }
function excludes(name, hay, needle) { check(name, typeof hay === "string" && hay.indexOf(needle) < 0); }
function near(name, a, b) { check(name, Math.abs(a - b) < 0.001); }

/* ---------- shared fixture: heavy lead load ---------- */
var CFG = {
  yourName: "Alex Rivera", brokerage: "Desert Sun Realty",
  market: "Scottsdale and Paradise Valley", ownerName: "Alex Rivera",
  audit: {
    leadrespond:    { hours: "h5p", drain: "dread" },
    leadfollowup:   { hours: "h34", drain: "tedious" },
    leadqualify:    { hours: "h12", drain: "fine" },
    leadconsult:    { hours: "lt1", drain: "fine" },
    listingcopy:    { hours: "h12", drain: "tedious" },
    launchchecklist: { hours: "h12", drain: "fine" },
    openhouse:      { hours: "h12", drain: "fine" },
    listingupdates: { hours: "lt1", drain: "fine" },
    txncoord:       { hours: "h34", drain: "tedious" },
    txnpaper:       { hours: "h34", drain: "dread" },
    txnupdates:     { hours: "h12", drain: "fine" },
    spherecheck:    { hours: "h12", drain: "tedious" },
    marketposts:    { hours: "h12", drain: "fine" },
    reviewasks:     { hours: "lt1", drain: "fine" },
    touches:        { hours: "lt1", drain: "fine" }
  },
  modules: null,
  agentName: "June", identity: "",
  bearings: ["responsive", "warm"], values: ["speed", "relationships"], valuesText: "",
  neverDo: ["noinvent", "nofairhousing", "nosend"],
  neverDoText: "Never text a client after 9 pm unless they wrote first",
  voiceSample: "",
  matrix: {},
  escalation: "Message me directly with what is needed and who is waiting."
};
var PKG = C.buildRealtorPackage(CFG);

/* ================= Catalogs ================= */
check("C01 four audit groups", C.AUDIT_GROUPS.length === 4);
check("C02 fifteen audit items", C.AUDIT_ITEMS.length === 15);
check("C03 every item maps to a real module", C.AUDIT_ITEMS.every(function(i){ return !!C.moduleById(i.module); }));
check("C04 every item maps to a real group", C.AUDIT_ITEMS.every(function(i){ return !!C.groupById(i.group); }));
check("C05 four stack modules", C.MODULES.length === 4);
check("C06 module ids in stack order", C.MODULES.map(function(x){ return x.id; }).join(",") === "lead,listing,transaction,sphere");
check("C07 Lead Responder jobs carry speed to lead", C.moduleById("lead").jobs.join(" ").indexOf("within minutes of the inquiry") >= 0);
check("C08 five hour chips", C.HOUR_CHIPS.length === 5);
check("C09 reclaim rate is 0.6", C.RECLAIM_RATE === 0.6);
check("C10 six matrix actions", C.MATRIX_ACTIONS.length === 6);
check("C11 four matrix levels", Object.keys(C.MATRIX_LEVELS).length === 4);

/* ================= Scoring ================= */
check("S01 hoursValue reads a chip", C.hoursValue("h34") === 3.5);
check("S02 hoursValue reads a number", C.hoursValue(2) === 2);
check("S03 hoursValue none chip is zero", C.hoursValue("none") === 0);
var SA = C.scoreAudit(CFG);
near("S04 fixture total hours", SA.totalHours, 29);
near("S05 fixture reclaim is 60 percent", SA.reclaimed, 17.4);
var lead = SA.items.filter(function(i){ return i.id === "leadrespond"; })[0];
near("S06 score is hours x drain x fit", lead.score, 6 * 1.8 * 0.95);
var ONLY = { audit: {} };
C.AUDIT_ITEMS.forEach(function(i){ ONLY.audit[i.id] = { hours: "none", drain: "fine" }; });
ONLY.audit.leadrespond = { hours: 10, drain: "fine" };
var SA2 = C.scoreAudit(ONLY);
check("S07 single routine total", SA2.totalHours === 10);
check("S08 single routine reclaim is 6", SA2.reclaimed === 6);
check("S09 single routine ranked alone", SA2.ranked.length === 1);

/* ================= Opportunities and defaults ================= */
var OPPS = C.rankOpportunities(CFG);
check("O01 heavy lead load ranks lead response first", OPPS[0].itemId === "leadrespond");
check("O02 top opportunity maps to Lead Responder", OPPS[0].module === "lead" && OPPS[0].moduleName === "Lead Responder");
check("O03 default modules cover top two scored areas", JSON.stringify(C.defaultModules(CFG)) === JSON.stringify(["lead", "transaction"]));
check("O04 resolveModules honors explicit toggles", JSON.stringify(C.resolveModules({ modules: ["sphere"], audit: CFG.audit })) === JSON.stringify(["sphere"]));
check("O05 resolveModules never returns empty", C.resolveModules({ modules: [], audit: {} }).length >= 1);
check("O06 module scores rank lead highest", (function(){ var ms = C.moduleScores(CFG); return ms.lead > ms.listing && ms.lead > ms.sphere; })());

/* ================= The package: structure ================= */
check("P01 package generates with an owner", PKG.length > 0);
var i1 = PKG.indexOf("=== SECTION 1: WHO YOUR AGENT IS ===");
var i2 = PKG.indexOf("=== SECTION 2: WHAT YOUR AGENT DOES ===");
var i3 = PKG.indexOf("=== SECTION 3: WHERE YOU STAY IN CHARGE ===");
check("P02 three section headers present", i1 >= 0 && i2 >= 0 && i3 >= 0);
check("P03 section headers in order", i1 < i2 && i2 < i3);
includes("P04 agent name in package", PKG, "Name: June");
includes("P05 market in identity", PKG, "a Realtor serving Scottsdale and Paradise Valley");
includes("P06 reclaim estimate in section 2", PKG, "60 percent reclaim rate");
includes("P07 sample first task output in package", PKG, "FIRST TASK OUTPUT (sample");
includes("P08 lead follow-up plan present when Lead Responder on", PKG, "SAME-DAY LEAD FOLLOW-UP PLAN");
includes("P09 owner line in section 3", PKG, "Accountable owner: Alex Rivera");
check("P10 zero em dashes in package", PKG.indexOf("\u2014") < 0); // needle is the em dash character itself

/* ================= Module toggling ================= */
var LISTING_ONLY = Object.assign({}, CFG, { modules: ["listing"] });
var PKG_L = C.buildRealtorPackage(LISTING_ONLY);
includes("T01 listing module line present when on", PKG_L, "Every listing launched complete, on schedule, and compliant.");
excludes("T02 lead module line absent when off", PKG_L, "Speed to lead, in your voice, every time.");
excludes("T03 transaction module line absent when off", PKG_L, "Deadlines held, paperwork chased, clients calm.");
includes("T04 launch checklist in first task when Listing on", PKG_L, "LISTING LAUNCH CHECKLIST");
excludes("T05 lead plan absent from first task when Lead off", PKG_L, "SAME-DAY LEAD FOLLOW-UP PLAN");
var TASK_SPH = C.buildFirstTask(Object.assign({}, CFG, { modules: ["sphere"] }));
includes("T06 first task shows sphere block when on", TASK_SPH, "SPHERE AND CONTENT THIS WEEK");
excludes("T07 first task hides transaction block when off", TASK_SPH, "TRANSACTION WATCH");

/* ================= The soul ================= */
includes("L01 preset never-do lands in package", PKG, "Never invent a price, a comparable sale, or a market statistic");
includes("L02 fair housing preset lands in package", PKG, "Never write anything that steers buyers or describes a neighborhood by the people who live there");
includes("L03 free-text never-do lands verbatim", PKG, "Never text a client after 9 pm unless they wrote first");
includes("L04 bearing prompt lands in package", PKG, "Minutes matter in real estate");
includes("L05 value prompt lands in package", PKG, "Relationships over transactions");
var EDITED = Object.assign({}, CFG, { voiceSample: "Custom voice line, written by the Realtor, warm and quick." });
check("L06 edited voice sample resolves exactly", C.resolveVoiceSample(EDITED) === "Custom voice line, written by the Realtor, warm and quick.");
includes("L07 edited voice sample ships in package", C.buildRealtorPackage(EDITED), "Custom voice line, written by the Realtor, warm and quick.");
check("L08 generated voice sample is non-empty", C.buildVoiceSample(CFG).length > 20);
check("L09 blank name falls back to a default", C.resolveAgentName({ agentName: "  " }) === C.DEFAULT_AGENT_NAME && C.DEFAULT_AGENT_NAME.length > 0);
includes("L10 blank name still ships named in package", C.buildRealtorPackage(Object.assign({}, CFG, { agentName: "" })), "Name: " + C.DEFAULT_AGENT_NAME);
check("L11 marketPhrase without a market stays generic", C.marketPhrase({}) === "their market area");
check("L12 generated identity carries name and market", C.defaultIdentity(CFG).indexOf("You are June, right hand to Alex Rivera, a Realtor serving Scottsdale and Paradise Valley") === 0);
check("L13 zero em dashes in first task output", C.buildFirstTask(CFG).indexOf("\u2014") < 0);

/* ================= Approvals, guardrails, and the owner gate ================= */
function defOf(id){ return C.MATRIX_ACTIONS.filter(function(a){ return a.id === id; })[0].def; }
check("A01 send a message defaults to ask", defOf("sendMessage") === "ask");
check("A02 post publicly defaults to ask", defOf("postPublic") === "ask");
check("A03 schedule defaults to ask", defOf("schedule") === "ask");
check("A04 send for signature defaults to ask", defOf("sendSignature") === "ask");
check("A05 contact other agent defaults to ask", defOf("contactOther") === "ask");
check("A06 drafting a lead reply defaults to free", defOf("draftLeadReply") === "free");
includes("A07 default send rule renders as ask first", PKG, "- Send a message to a lead or client: Always ask first");
includes("A08 default draft rule renders as runs freely", PKG, "- Draft a reply to a lead: Runs freely");
includes("A09 fair housing guardrail in section 3", PKG, "FAIR HOUSING");
includes("A10 no-invented-numbers guardrail in section 3", PKG, "NO INVENTED NUMBERS");
var NOCHIPS = Object.assign({}, CFG, { neverDo: [], neverDoText: "" });
var PKG_NC = C.buildRealtorPackage(NOCHIPS);
includes("A11 fair housing guardrail binds with no never-do chips picked", PKG_NC, "FAIR HOUSING");
includes("A12 no-invented-numbers guardrail binds with no never-do chips picked", PKG_NC, "NO INVENTED NUMBERS");
includes("A13 steering language called out in the guardrail", PKG_NC, "steers buyers toward or away from a neighborhood");
check("A14 no owner, no package", C.buildRealtorPackage(Object.assign({}, CFG, { ownerName: "" })) === "");
check("A15 owner gate explains itself", C.ownerGate({ ownerName: " " }).ok === false && C.ownerGate({ ownerName: " " }).message.indexOf("No owner, no agent") === 0);
check("A16 owner gate passes with a name", C.ownerGate(CFG).ok === true);

/* ================= Whole-file hygiene ================= */
check("F01 zero em dashes anywhere in index.html", html.indexOf("\u2014") < 0);

console.log("Realtor Agent Studio harness: " + passed + " passed, " + failed + " failed, " + (passed + failed) + " total");
if (failed) { console.log("Failures: " + failures.join(" | ")); process.exit(1); }
