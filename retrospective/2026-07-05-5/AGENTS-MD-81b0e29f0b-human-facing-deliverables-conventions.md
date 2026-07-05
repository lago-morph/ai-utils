# agent instruction

**Human-facing deliverables follow the human-scoped conventions.** Any document whose primary audience is the human owner gets a short orientation block up top, the load-bearing finding first, comparison tables, labeled decision points with alternatives and rewind paths, opinion marked as opinion, and no hash IDs or cross-reference chains in body text.

*Grounded in: loading human-scoped-deliverables before writing the PR #5 survey materially reshaped its structure.*

# justification

The survey deliverable was drafted only after loading the `human-scoped-deliverables` skill (installed in k8s-platform and software-factory, not yet in ai-utils), and the skill changed the plan in concrete ways: the deliverable split into a one-sitting synthesis plus an evidence companion instead of one long report; the rule-pipeline contradiction was promoted from a friction-list entry to a labeled decision point with alternatives, a trade-off statement, and a rewind path; the recommendation was explicitly marked "opinion, not synthesis"; and the divergence evidence became tables rather than prose. The owner has stated plainly that database-normalized, cross-reference-heavy output is unreadable to a human, and that unreadable deliverables cost more than they save — if the reader has to re-ask, the writing failed. ai-utils has no AGENTS.md and no installed copy of that skill yet, so this rule carries the convention until COE distribution does; the marginal cost is following a checklist that already exists.
