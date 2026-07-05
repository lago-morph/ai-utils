# Spec: `comparative-repo-survey`

- **ID**: SKILL-SPEC-bce5154cb9
- **Source retrospective**: ../2026-07-05-5.md

## Intent

Survey a fleet of related repositories and produce a decision-ready comparison — a ranked friction list, the conventions that have earned their place, and scoped recommendations — without the orchestrator's context absorbing the full contents of every repo. Grounded in the 2026-07-02 COE step-0 survey of eight repos, where seven parallel explorer subagents with an identical eight-heading brief, a checksum-based drift pre-pass, and an orchestrator-read of the two pivot documents produced a merged synthesis (ai-utils PR #5) in one session.

## Trigger

Direct: "survey these repos", "compare how my repos do X", "standardize across my repositories", "where do conventions drift between projects", "run the COE survey again".
Proactive: offer when a task requires comparing ≥3 repositories' structures or conventions before making a recommendation.
Negative: do NOT use for a single-repo summary (use a repo-summary skill), or when the user asks a narrow factual question answerable by one `grep` across clones.

## Inputs

- A list of repo paths (local clones side by side, e.g. `/home/user/<repo>`), with any writable-vs-read-only designation.
- The purpose of the comparison (what decision the output feeds), stated in one sentence — it goes into every subagent brief.
- Optional: known focus areas per repo (e.g., "this one has heavy root sprawl") to seed per-repo hints.

## Outputs

- A synthesis document: orientation block, headline finding, at-a-glance table (one row per repo), a "where the same thing lives under different names" table, a ranked friction list with evidence, a keepers table with provenance, labeled decision points, scoped recommendations.
- A companion evidence file: one profile per repo (purpose, entry chain, homes, enforcement, learning-loop status, frictions, keepers).
- Both committed on a feature branch and delivered via PR.

## Workflow

1. Read the document that defines the comparison's purpose first (for the COE survey: `coe/README.md`), and extract the questions the output must answer.
2. Cheap structural scan of every repo yourself: `ls` top two levels, locate instruction files (`CLAUDE.md`, `AGENTS.md`, entry docs), list `.claude/`, list CI workflows. This calibrates briefs and identifies pivot documents.
3. Run the mechanical drift pre-pass BEFORE any content reading: for every artifact type that recurs across repos (skills, templates, configs), compare `md5sum` and `wc -l` across all copies. Record identical/divergent clusters. In the source session this took two shell commands and produced the single most-cited finding (three simultaneous generations of one skill).
4. Dispatch one read-only explorer subagent per repo, all in parallel, each with the SAME numbered-heading brief. The brief must include: the comparison's purpose, the required headings (purpose / instruction chain / directory conventions / tool-config layout / checks / knowledge-memory flow / friction signals / distinctive keepers), the instruction "be factual and specific; exact filenames and line counts; do not pad", and one or two per-repo hints. Mark any embedded count or claim you have not verified as unverified.
5. While subagents run, personally read the pivot documents identified in step 2 — the few files the synthesis will hinge on. Do not delegate these.
6. As each report arrives, extract one keeper and one friction into a running list; verify any surprising claim with a direct `ls`/`grep` before it becomes load-bearing.
7. Synthesize: rank frictions by (cost per session × repos affected); attribute every keeper to the repo that proved it; convert cross-repo contradictions into labeled decision points (alternatives, trade-off, rewind path, recommendation marked as opinion).
8. Write the two-file deliverable (synthesis + profiles), load any human-facing-deliverable conventions the fleet defines before writing, then commit, push, PR.

## Concrete examples

### Example 1: skill-drift pre-pass (step 3, verbatim from the session)

Command shape: for each shared skill name, for each repo, `md5sum <repo>/.claude/skills/<skill>/SKILL.md | cut -c1-8` plus `wc -l`. Output that drove the synthesis:

```
=== self-retrospective ===
  c8e9b4be  1355 lines  agent-os
  dddd7bcc   530 lines  conference-summaries
  ea8402a6  1401 lines  k8s-platform
  dddd7bcc   530 lines  policy-engine
  c8e9b4be  1355 lines  software-factory
```

Three checksum clusters = three simultaneous generations of one skill; the 1401-line outlier contained an evidence-based amendment that never propagated. This finding cost minutes and anchored the survey's #2 friction.

### Example 2: the uniform brief catching a bad premise (step 4)

The software-factory brief said "the ~26 skills — group them by theme". Because the brief also demanded facts from disk, the subagent reported: "24 skills (24 SKILL.md files — note: the brief said 26; the actual installed count is 24)." The premise error died in one report instead of shaping the synthesis. Keep the verify-from-disk instruction in every brief.

## Anti-patterns

- **Reading every repo yourself first.** The session's eight-repo fleet was ~700 markdown files in one repo alone; full orchestrator reads would have consumed the context before synthesis. Delegate breadth.
- **Relying on subagent summaries for the pivot documents.** The doctrine contradiction at the survey's center required the orchestrator to have read `ai/LESSONS.md` verbatim; a summary would have flattened it.
- **Divergent briefs per repo.** Comparability of the seven reports came from identical headings; free-form briefs produce reports that cannot be laid side by side.
- **Skipping the checksum pre-pass and inferring drift from prose.** Drift claims need mechanical evidence; "these skills look different" is not a finding.
- **Absorbing full file dumps from subagents.** Require structured reports with exact paths and counts; reject padding explicitly in the brief.

## Acceptance criteria

- [ ] Every friction in the ranked list cites at least one concrete file path, count, or checksum observed in a named repo.
- [ ] Every keeper names the repo that proved it in practice.
- [ ] Any cross-repo contradiction appears as a labeled decision point with alternatives and a rewind path, not buried in prose.
- [ ] The synthesis is readable in one sitting; per-repo evidence lives in the companion file.
- [ ] The deliverable states its method and epistemic limits (what was verified on disk vs. taken from repos' self-reports).

## Files this skill creates / modifies

- `<target>/survey-YYYY-MM-DD.md` — the synthesis (dated as-of filename, verified via tool call).
- `<target>/survey-YYYY-MM-DD-repo-profiles.md` — per-repo evidence companion.
- A hub README link (e.g., `coe/README.md`) marking the survey done — the only edit outside the two new files.
