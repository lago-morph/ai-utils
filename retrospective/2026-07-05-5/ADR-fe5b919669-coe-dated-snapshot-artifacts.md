# ADR: COE artifacts live in coe/ as dated snapshot files linked from a hub README

- **ID**: ADR-fe5b919669
- **Status**: Draft (not yet adopted to docs/adr/)
- **Date**: 2026-07-05
- **Source retrospective**: ../2026-07-05-5.md
- **PRs covered**: #5

## Context

The COE effort will produce a sequence of point-in-time artifacts — this survey, future dogfood logs, spec-version evidence — and the survey itself documented what happens to point-in-time material without a placement convention: session residue accumulated at repo roots (15 grandfathered files in k8s-platform), handoff documents accreted stale sections, and self-describing indexes drifted from reality in four repos. PR #5 needed a placement decision for the survey and made one; recording it keeps the next COE artifact from re-deciding.

## Decision

Point-in-time COE artifacts are dated snapshot files in coe/ — a synthesis file plus an evidence companion, both carrying their as-of date in the filename — linked from coe/README.md, which remains the single evolving hub document.

The pattern from PR #5: `coe/survey-2026-07-02.md` (one-sitting synthesis) plus `coe/survey-2026-07-02-repo-profiles.md` (evidence companion), with the README's roadmap entry marked done and linked. Snapshots are immutable once merged — a repeated exercise produces a new dated pair, never an edit to the old one. The date is verified by tool call at write time (and, per this retrospective's dating incident, cross-checked externally if clocks disagree).

## Alternatives considered

- **One evolving document per topic (edit in place)** — loses the as-of anchoring that made the survey's claims auditable ("verified on disk on 2026-07-02"), and invites the stale-self-description failure the survey ranked as friction #3.
- **A single combined file per exercise** — the eight-repo survey ran ~700 lines total; one file would have either bloated past one-sitting readability or dropped the per-repo evidence. The split matches the fleet's proven human/evidence two-tier pattern.
- **Root-level placement** (`ai-utils/survey-*.md`) — recreates the root-sprawl friction the survey itself ranked #5; coe/ is the effort's one home.

## Consequences

Easier: any COE artifact is findable from one hub; snapshots compare cleanly across dates; the README stays small because detail lives in snapshots.
Harder: the README link list must be maintained by hand until a conformance check exists — the exact class of unchecked convention the survey warns about; this ADR is honest that the convention is currently held by discipline alone.
Accepted trade-off: dated filenames mean a re-run three days later produces a near-duplicate pair rather than a diff against the old file; the audit value of immutable snapshots outweighs the duplication for artifacts of this cadence.

## References

- [`../2026-07-05-5.md`](../2026-07-05-5.md) — the source retrospective.
- [`../../coe/README.md`](../../coe/README.md) — the hub this decision keeps authoritative.
- PRs the decision was made in: #5.
