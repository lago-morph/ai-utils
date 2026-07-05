# agent instruction

**Tool-verified dates outrank context-supplied dates.** Before writing any date into a filename or document, verify it with a tool call (`date -u`); when a harness-supplied date and the container clock disagree, resolve the conflict with an external timestamped record (e.g., GitHub `created_at`) and record the provenance rather than silently picking one.

*Grounded in: the PR #5 survey-date false alarm resolved via GitHub timestamps (2026-07-05).*

# justification

During the COE survey session, the harness context block said "Today's date is 2026-07-05" while every file timestamp and the container clock read 2026-07-02. The agent initially concluded the survey filenames (`survey-2026-07-02.md`, already merged to main in PR #5) were dated three days wrong and drafted a defect finding plus a plan to flag the "wrong" names to the owner. One GitHub API call (`created_at: 2026-07-02T15:28:24Z` on PR #5) proved the filenames were correct — the session simply spanned three days, and the context-supplied date described the continuation, not the original work. The cost of not having this rule would have been a false defect report and possibly a rename churning merged, linked files; the cost of the rule is one tool call plus, in the rare conflict case, one API lookup. The asymmetry is stark: dates silently anchor audit trails (retrospective filenames, survey as-of claims, PR cross-references), and a wrong "correction" damages them more than the original ambiguity ever could.
