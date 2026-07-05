# agent instruction

**Verify premises in subagent briefs against the tree.** Any count, filename, or structural claim embedded in a subagent brief must be verified with `ls`/`grep` before dispatch, or explicitly marked as unverified with an instruction to the subagent to check it; a false premise multiplies across every downstream agent.

*Grounded in: the "~26 skills" brief error, corrected to 24 by the software-factory survey agent.*

# justification

The software-factory survey brief stated the repo had "~26 skills" — a number read off the session's skill-list reminder, which double-lists skills that several repos install. The actual on-disk count was 24. The error was harmless only because the brief also instructed the subagent to report facts from disk with exact filenames, so the agent counted for itself and corrected the premise in its report. Had the brief instead asked the agent to "summarize each of the 26 skills," the fabricated count would have shaped the output — and in a seven-agent fan-out, a shared wrong premise repeats seven times before the orchestrator sees it once. k8s-platform's forensics recorded exactly this failure class at larger scale (one unverified constraint propagated into three plans and fourteen reviews). The marginal cost is one `ls | wc -l` per load-bearing claim at briefing time; the alternative is paying for the correction in every downstream artifact.
