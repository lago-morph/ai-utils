# ADR: COE v0.1 adopts the checks-first remedy doctrine

- **ID**: ADR-2d2dde9b43
- **Status**: Draft (not yet adopted to docs/adr/)
- **Date**: 2026-07-05
- **Source retrospective**: ../2026-07-05-5.md
- **PRs covered**: #5

## Context

The eight-repo COE survey (ai-utils PR #5) found the fleet's two most developed repos embodying contradictory conclusions about the same mechanism. The ai-skills registry is built around assembling each repo's AGENTS.md from swept per-rule fragment files. k8s-platform ran that exact pipeline for six weeks and measured it: 152 rule candidates were proposed, 51 adopted, and the top failure modes recurred to the end of the record — one rule was violated minutes after its author wrote it — while every bug class covered by a blocking hook or fail-closed gate showed zero recurrence after wiring. k8s-platform retired the rule-assembly channel on that evidence. The survey also reproduced the pattern structurally in all eight repos: every convention held only by prose or memory drifted; every convention held by a mechanical check held. A standard cannot ship both models.

## Decision

COE v0.1 adopts the checks-first remedy doctrine — every proposed remedy is classified as mechanical check first, budgeted judgment rule second, structural change third, observation only otherwise — and repoints the ai-skills registry at distributing skills and checks rather than assembling AGENTS.md files from rule fragments.

Concretely: AGENTS.md files are hand-curated operating agreements under a hard line budget (k8s-platform's ≤150 lines is the reference); a rule enters only with a cited incident and, when full, a removed line. Retrospectives still harvest proposals, but each proposal is classified before it becomes an artifact. The registry's ledgers, semantic-diff review, and sync tooling are retained as the distribution channel for skills, lints, hooks, and workflow templates.

## Alternatives considered

- **Rule-assembly as designed (ai-skills v1)** — automates propagation of the one artifact type the fleet's only controlled evidence says does not change behavior; also currently the stalest artifact in the fleet (its own generated AGENTS.md renders 13 of 51 live rules). Rejected as the doctrine; its machinery is kept.
- **Both models, per-repo choice** — preserves local autonomy but makes the COE's central promise (an agent oriented in one conforming repo is oriented in all) false exactly where it matters most, and leaves the contradiction unresolved for every future repo.
- **Checks-only, no prose rules at all** — rejected because genuine judgment calls ("act on the answer to a question you asked") have no mechanical form; the budget, not a ban, is the control.

## Consequences

Easier: behavior change becomes a property of gates and hooks that fail closed; instruction surface stays small and budgeted; the registry's payload becomes things that provably propagate (a lint lands identically in every repo).
Harder: writing a check is more work than writing a sentence, so low-effort remedies get consciously dropped to observation status; repos with no CI at all (five of eight today) must gain a minimal workflow before the doctrine has teeth there.
Accepted trade-off: some real judgment lessons will go un-encoded when the budget is full — the fleet's evidence says they were not binding as prose anyway.
Rewind path: the registry machinery is payload-agnostic; if budgeted hand-curated rules fail to propagate in practice, fragment assembly can be re-enabled for the rules layer without rebuilding anything.

## References

- [`../2026-07-05-5.md`](../2026-07-05-5.md) — the source retrospective.
- [`../../coe/survey-2026-07-02.md`](../../coe/survey-2026-07-02.md) — the survey whose "decision COE v0.1 has to make" section this draft records; evidence detail in its companion profiles file.
- PRs the decision was made in: #5 (survey recommendation; adoption pending owner review of this draft).
