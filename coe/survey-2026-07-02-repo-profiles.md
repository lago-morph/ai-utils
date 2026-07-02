# COE survey — per-repo profiles (2026-07-02)

**What this is.** The evidence layer behind
[survey-2026-07-02.md](./survey-2026-07-02.md): one profile per repo —
how an agent orients there, where each document class lives, what's
enforced, how the learning loop is doing, and what the repo contributes to
the standard. Read the synthesis first; come here when you want to check a
claim against a specific repo.

---

## software-factory

**What it is.** The dark-factory research corpus: 38 numbered research
reports, a source catalog with 208 archived sources, and an architecture
synthesis (v3 methodology tournament → v4 component-per-principle specs).
Not shipping code — its real export is the most developed agent operating
discipline in the fleet.

**Entry chain.** CLAUDE.md (5-line loader) → AGENTS.md (206 lines, every
rule carrying a durable ID back to the retrospective that authored it) →
AGENT-ENTRY.md (150 lines). AGENT-ENTRY is the progressive-disclosure
experiment: each line names what a sub-doc contains without restating its
conclusion (staleness heuristic: "would this line need updating if the
sub-doc changed its conclusion?"), plus ~11 task-aware reading lists ("read
exactly these, skip everything else"). Born from a measured problem: eager
startup loading once filled a fresh context to 147K tokens.

**Where things live.** ADRs in `docs/adr/` (74, numbered). Retros in
`retrospective/` (57 reports + sibling dirs; 52 skill specs, 77 ADR drafts,
181 per-rule artifacts). Research in `research/` (numbered reports) with the
catalog in `reference-only/` (`sources.json` canonical → `sources.md`
generated; per-source dirs keyed by URL hash). Frozen history in `archive/`
with a `PR-N-` prefix naming the PR that last touched each file. 16 root
markdown files, including a deliberate plain-language tier for the human
reader and three overlapping forward-looking docs.

**Enforcement.** Two PreToolUse hooks (one hard-blocks GitHub issue tools
until the issue-management skill is loaded). Five workflows: source-catalog
regeneration, research-pipeline tests, blocked-URL fetching via issue
labels, and the failure-modes gate. Two skills self-install their own hooks
and workflows (`install.py --check` on every invocation). The advisory-gate
pattern: CI stays green but posts a REQUEST_CHANGES review, auto-dismissed
when the check re-passes.

**Learning loop.** The full pipeline exists and runs: retro → durable-ID
artifacts → rules adopted verbatim into AGENTS.md with provenance comments →
ADR drafts promoted to numbered ADRs → skill specs become skills. But
adoption is the bottleneck: 181 rule artifacts produced, ~30 adopted,
nothing tracks which are live vs. pending.

**Frictions observed.** The failure-modes CI gate watches filenames
(`architectures/0N-*.md`, `architectures/failure-modes.md`) that no longer
exist — green and dormant since the corpus moved to a different scheme.
`CONTEXT-SLIMMING-PLAN.md` still says "Plan, not implemented" though
AGENT-ENTRY implements it. 13 sequential SESSION-HANDOFF files with the
active one tracked only in prose. 24 installed skills including three
overlapping "actually run it" verification skills, one with an empty
description, and two over 1000 lines.

**Worth keeping.** AGENT-ENTRY progressive disclosure + task-aware reading
lists; the retro pipeline with durable IDs; self-installing skills;
advisory gates; the generated source catalog; the plain-language tier.

---

## k8s-platform

**What it is.** An intentionally ephemeral EKS demonstration platform
(terraform bootstrap → Crossplane/ArgoCD GitOps) where the AWS account
rotates and "rebuild-from-nothing is the product." Also the fleet's
laboratory: it ran the heaviest autonomous sessions, stalled, commissioned a
forensic post-mortem of its own process, and restructured on the evidence.

**Entry chain.** CLAUDE.md (8-line pointer, "content intentionally not
duplicated — single source of truth") → AGENTS.md (142 lines, hard budget
≤150, "judgment rules only — mechanical rules are enforced by CI, hooks, and
lints, not memorized") → `ai/LESSONS.md` (the evidence register and the
protocol for changing the rules).

**Where things live.** The `ai/` directory is the agent's home: `handoff.md`
(session state, facts + next action only), `environment.md` (the single
capability-facts file), `LESSONS.md`, specs, blog drafts. ADRs in
`docs/decisions/` (11, numbered). Retros in `retrospective/` (50 reports —
the fleet's largest corpus). Repo summaries in `summary/`. Forensics in
`forensics/` (append-only evidence tagged FACT/INFERENCE/OPEN). Tool pins in
`versions.env` with a lint holding paired pins equal. The old 748-line
rulebook archived intact under `docs/archive/agents-v1/`.

**Enforcement.** The fleet's reference implementation. ~90 unit lints run on
every push, including the conventions: root-file allowlist, ADR numbering,
no hardcoded account IDs, no committed "next-session prompt" files, version
pin consistency, shell portability. Heavy suites are dispatch-only, each
shadowed by a push-gated "verify-then-PR" mirror that requires a green run
for the exact SHA. Three lifecycle hooks: SessionStart (toolchain install +
warn if the checkout is behind main), PreToolUse (blocks heavy CI dispatches
that fail the static audit), SessionEnd (copies the session transcript into
`logs/` — the ai-utils prompt-logging idea, implemented). Plus a skill
admission rule and budget: ≤12 active skills; 10 archived with a
why-archived README ("restore = one `git mv`").

**Learning loop.** Restructured after forensics: retros now classify every
proposed remedy — mechanical check first, a budgeted AGENTS.md line only for
judgment calls, structural proposals for incentive problems, otherwise just
record. The finding that drove it: 152 rule candidates → 51 adopted → the
top failure modes recurred anyway, while every hook/gate-covered bug class
stopped recurring. The 2026-06-10 amendment encoding this lives only here —
it never propagated to the registry or the sibling repos.

**Frictions observed.** 15 grandfathered session-residue files at root
(linted against growth, relocation still open). Three "decision" homes:
`docs/decisions/` (ADRs), root `decisions/` (autonomous-run scope
envelopes), and skills referencing a `docs/adr/` that doesn't exist here.
`ai/handoff.md` at 91 KB and `docs/open-issues.md` at 90 KB. Deliberate
duplicates held together by lint (two lessons files, a terraform default
mirroring `versions.env`).

**Worth keeping.** Almost everything above; this repo's round-2 shape is the
closest thing to a working COE. The budgets, the remedy protocol, the root
allowlist, verify-then-PR, `ai/environment.md`, `versions.env`,
skills-archive, and the done-contract vocabulary ("pending clean-build
verification").

---

## agent-os

**What it is.** Architecture-of-record for an agent runtime platform —
explicitly not an implementation repo. 52 numbered ADRs, 127 specs + 127
plans generated by parallel fan-out against a frozen Canon, zero code.

**Entry chain.** AGENTS.md only (53 lines, no CLAUDE.md): six rules, all
about parallel authoring — freeze a Canon (glossary/interfaces/piece-index)
before fanning out, mark anything not in source `[PROPOSED — not in
source]`, subagents return receipts not content, adversarial planner in
parallel for high-stakes plans, checkpoint in waves, verify completeness
from disk against a manifest.

**Where things live.** ADRs in `adr/` (the reference implementation of the
fleet's ADR convention: `NNNN-kebab-title.md`, fixed section order, relative
links). Mirrored `specs/` and `plans/` trees keyed to `_meta/piece-index.csv`,
with specs carrying the Canon version they were authored against. Session
state in `_meta/HANDOFF.md`; decisions ledger in `_meta/reviews/`. Retros in
`retrospective/` (4 packages).

**Enforcement.** None. No CI, no hooks, no settings. The corpus is built to
be machine-checkable (fixed templates, a manifest, greppable markers) but
nothing runs the checks — the only script is advisory and never wired up.

**Learning loop.** Working but far behind: ~28 rules proposed across 4
retros, 6 promoted. Its self-retrospective skill was hand-updated from
software-factory to a newer convention that zero on-disk retros follow, and
the migration mode was never run. Three proposed skills were never built and
sit next to the ones that were, indistinguishable.

**Frictions observed.** README's "planned layout" names four directories
that never came to exist. A superseded ADR was supposed to move to
`adr/superseded/` — its spec and plan moved, the ADR itself didn't, and the
directory doesn't exist. Four overlapping decision documents plus two
piece-indexes (canonical and a never-merged "proposed" one). Three stacked
session handoffs in one file. A stock Python .gitignore in a repo with no
code.

**Worth keeping.** The Canon-freeze discipline, the `[PROPOSED]` fabrication
marker, manifest-based completeness checking, the ADR convention itself, and
the skill-file split (lean operational SKILL.md, full rationale in a spec
alongside).

---

## ai-skills

**What it is.** The registry: canonical home for four artifact types
(skills, skill specs, ADRs, per-rule AGENTS.md fragments), with tooling to
sweep them out of consumer repos, human-gate them through semantic diffs,
version them in ledgers, and sync approved copies back.

**Entry chain.** README (10 lines) → AGENTS.md (73 lines) — which is itself
**generated** from the `agents-md/` fragment directory ("DO NOT EDIT…
inline edits will be extracted and overwritten"). The governing spec is
`ai/skill-management-v1.md`.

**Where things live.** One top-level directory per artifact type, each with
a paired ledger: `000-ledger.json` (source of truth) → `000-ledger.md`
(generated human table). `incoming/<org>/<repo>/<type>/` stages swept items
next to a semantic-diff report that doubles as the review surface; an
`incoming/_todo/` parking area holds items awaiting hand-edits, and any
undrained state hard-stops the next sweep. Artifacts born in retrospectives
carry a 10-hex transit UID in the filename, immutable until promotion strips
it.

**Enforcement.** Five workflows: four ledger-render regenerators (the
generated-file pattern done right: path-filtered, byte-idempotent canonical
JSON, `[skip ci]` self-commits) and the skill-registry test suite. The
registry also self-installs its own workflows on every invocation.

**Learning loop / frictions observed.** The registry doesn't enforce its
discipline on itself, and that's the cautionary lesson: its generated
AGENTS.md renders 13 of 51 live rules (sync never re-run after the big
sweep); three of four ledger renders are stale; the folded-in registry copy
of its own tooling has diverged from the live copy (a subscriber would get
the outdated version); three rules were hand-landed around the pipeline and
the ledger never recorded them; three swept items have sat mid-drain with
placeholder analyses — which blocks all future sweeps by design. The sweep
config tracks two repos (itself and software-factory), so the fleet's other
six aren't even visible to it. Its rule-assembly centerpiece is the
mechanism k8s-platform's forensics retired.

**Worth keeping.** The machinery: content-addressed dedup with a state
machine and tombstones, semantic-diff-as-review-surface, hard-stop
invariants, self-attesting first-line metadata (hash computed over the
metadata-stripped body), never-overwritten user config vs. overwritable
shipped templates, and the byte-idempotence rule that makes regeneration
loops safe.

---

## policy-engine

**What it is.** A pure-prose research and design corpus for a unified
policy/governance platform: five source documents decomposed by parallel
fan-out into 31 component specs with adversarial reviews (~270 markdown
files, zero code).

**Entry chain.** None. No README, no AGENTS.md, no CLAUDE.md. Orientation
forks across INDEX.md (a genuinely good per-document guide: purpose, type,
"when to consult," citable line ranges), a master index inside `spec-plan/`,
and a HANDOFF pickup brief. A newcomer has to already know which to open.

**Where things live.** `analysis/` (persona mapping + 100 scenario files),
`spec-plan/` (the component corpus: uniform SPEC + PLAN + ADVERSARIAL-REVIEW
per component), `retrospective/` (2 packages), `spec-plan/DECISIONS.md` (23
unattended decisions logged with reversibility). Five root filenames contain
spaces; one bakes in "v1".

**Enforcement.** None. The skills describe a stop-hook safety net that isn't
wired up here; the .gitignore is a stock Python template in a repo with no
Python.

**Learning loop.** Broken at the first step: both retros addressed their 18
proposed rules to "AGENTS.md at the repo root," which doesn't exist. The
same rules get re-proposed across sessions because there's nothing merged to
dedupe against. Proposed ADRs were listed by title and never authored.

**Frictions observed.** Four documents self-report the corpus size four
different ways. A reconciled schema spec supersedes three others that still
contain the superseded content, with the supersession tracked in prose. The
versioned-filename confusion is self-documented ("is C2 frozen?" — five
documents disagreed).

**Worth keeping.** INDEX.md as a curated orientation index; the DECISIONS.md
append-only log with a reversibility column; the uniform per-component doc
contract; adversarial review as a first-class sibling artifact.

---

## conference-summaries

**What it is.** Conference-data extraction (Sched.com scraping → YAML;
YouTube transcript prototype) in a pre-implementation state: validated
prototypes plus extensive specs, built originally in the Kiro IDE with
Claude Code conventions bolted on later.

**Entry chain.** CLAUDE.md (4-line deprecation tombstone) → AGENTS.md (82
lines) → header-gated `ai-guidance/` docs. AGENTS.md formalizes a three-tier
loading protocol: always read / read when needed (check the doc's
"WHEN TO READ THIS" header first) / reference for specific tasks. Its rules
include the fleet's only explicit web-scraping etiquette (rate limits,
text-only) and a git-pager workaround.

**Where things live.** `specs/` dominates (including a preserved three-model
adversarial review with a 30-decision journal). `temp/` is the declared,
gitignored scratch dir. No retrospective directory — the imported retro
skills have never run here.

**Enforcement.** None (no CI, no hooks, no settings).

**Learning loop.** Not started. Six skills were imported wholesale from
software-factory; they still cite that repo's branches and history and
assume a retrospective convention, CI, and stacked-PR workflow that don't
exist here. Knowledge actually accumulates in hand-written session logs and
the decision journal — which work.

**Frictions observed.** Two competing agent-config trees (`.kiro/` with a
hardcoded Windows path vs. `.claude/`). AGENTS.md's own structure block
omits four real directories. A tracked file sits inside the gitignored
`temp/`. Progress docs point at files that moved or never existed. A forked
vendored dependency lives beside its original with a `-fixed` suffix.

**Worth keeping.** Header-gated lazy loading (the "WHEN TO READ THIS"
block); deprecation-by-pointer for CLAUDE.md; files that declare their own
audience and lifecycle in-band; the preserved multi-model review with its
resolution taxonomy.

---

## software-factory-prototype

**What it is.** The running-code sibling of software-factory: a Dockerized
Gas City deployment standing up a small fleet of cooperating coding agents
with one `docker compose up`. The most "normal software project" surveyed.

**Entry chain.** CLAUDE.md (12 lines — loader plus the single most
load-bearing environment fact inline: the sandbox HAS Docker, start the
daemon) → AGENTS.md (61 lines, five rules, verification-heavy: "always test
fixes — no exceptions", "verify the shipped artifact, not a proxy") →
`docs/HANDOFF.md` §3 for the full sandbox recipe. The Docker fact is
deliberately repeated in three places because it was the top recurring agent
mistake.

**Where things live.** `factory/` components in a uniform offline-testable
shape (README + artifact + stdlib validator + test.sh + `valid-`/`invalid-`
prefixed fixtures); `docs/` holds exactly three single-purpose files
(GETTING-STARTED, PLAN, HANDOFF). Retrospectives intentionally live in the
sibling software-factory repo.

**Enforcement.** No CI. One SessionStart hook — the cleanest environment
bring-up template in the fleet: remote-only guard, idempotent, bounded poll,
never fails the session. Local `make test` loops the component suites.

**Learning loop.** Out-of-repo by design (retros land in software-factory).
The HANDOFF pickup brief is the memory: what's true now / how to build in
the sandbox / process discipline / key files.

**Frictions observed.** Zero skills installed despite obvious candidates in
the ecosystem. The load-bearing sandbox recipe (CA injection, token wiring)
is deliberately uncommitted prose that every session re-creates by hand from
HANDOFF §3. The HANDOFF accretes finished work "kept for the record."

**Worth keeping.** The SessionStart hook template; CLAUDE.md carrying the
one critical environment fact; the fixed-skeleton HANDOFF; myth-busting as a
named rule (recurring false belief → explicit rule + one-line fix); the
uniform component/test convention.

---

## ai-utils

**What it is.** The seed repo: reusable-component ideas awaiting extraction,
plus this COE effort. Its README self-describes: "It will probably not be
structured well."

**Contents.** `coe/` (the proposal and now this survey); one-paragraph seed
ideas in `general-instructions/` (a draft personal operating agreement —
overlaps heavily with what k8s-platform's AGENTS.md "working with the owner"
section already encodes), `process-comments/` (a comment-driven document
editing workflow), `prompt-logging/` (verbosity levels for session logging —
k8s-platform's SessionEnd transcript hook is a working implementation of
level 3), `source-document/` (a private-bibliography dual-repo pattern —
software-factory's `reference-only/` catalog implements much of the
single-repo version), `prompts/` (one review prompt), `tools/`
(markdown-viewer).

**Entry chain / enforcement / learning loop.** Three-line README; none;
none. As the future home of the COE spec and registry-adjacent tooling, it
will need to conform to the standard it ships — right now it wouldn't pass
any of the proposed v0.1 checks.

**Worth noting.** Three of its four seed ideas already have partial
implementations elsewhere in the fleet (noted above). The COE work gives
them a home: environment manifest (sandbox section), transcript capture
(hooks), source cataloging (registry/skills).
