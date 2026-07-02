# Common Operating Environment (COE)

A proposed standard for repositories that are developed with an AI partner
(Claude Code or similar). Captured from handwritten notes dated 2026-07-01;
expanded with interpretation, suggestions, and a proposed roadmap.

## Original notes (transcribed)

- Common operating environment (COE)
  - Skills
  - AGENTS.md
  - Sandbox
    - APIs available / keys
    - Network permissions
    - Data access
    - Cloud env.
  - Principles
    - Adoption + upgrades to COE 1st class
    - Progressive disclosure (enforced)
    - Shared mutable knowledge base
    - Retrospection / self-optimization
  - Directory structure
  - Deterministic checks
    - Hooks (specifically for Claude Code)
    - Linters
    - GH actions
  - Devcontainer(s)

## Summary / interpretation

The COE is a **repository conformance standard**: any repo that adopts it
gives an AI partner a predictable environment — the agent always knows where
instructions live, what it is allowed to touch, what checks will run, and how
to record what it learned. The notes break down into three layers:

1. **Contract with the agent** — `AGENTS.md`, skills, directory structure,
   progressive disclosure. What the agent reads and when.
2. **Execution environment** — sandbox manifest (APIs/keys, network, data
   access, cloud), devcontainer(s). What the agent runs in.
3. **Feedback loops** — deterministic checks (hooks, linters, GH Actions),
   shared knowledge base, retrospection/self-optimization. How quality is
   enforced and how the system improves itself.

Plus a meta-principle that ties it together: **adoption and upgrades are
first-class**. Installing the COE into a repo, and moving a repo from COE
vN to vN+1, must be a supported, largely automated operation — not a
copy-paste exercise.

## Suggested shape of the standard

Treat the COE like a versioned spec with a reference implementation:

- **A spec document** (`SPEC.md`) using MUST / SHOULD / MAY language,
  versioned (v0.1, v0.2, ...). Small enough to read in one sitting.
- **A machine-readable manifest** in each conforming repo (e.g. `coe.yaml`)
  declaring: COE version, sandbox requirements (named API keys — names only,
  never values), network allowlist, data-access scope, and cloud environment
  assumptions. This is the file both humans and conformance tooling read.
- **A template / reference implementation** — a directory in this repo (or a
  template repo) containing the canonical `AGENTS.md` skeleton, `.claude/`
  layout (skills, hooks, settings), devcontainer, linter configs, and GH
  Actions workflows.
- **An installer + upgrader** — a slash command or small CLI (`/coe-init`,
  `/coe-upgrade`) that stamps the standard into a repo and migrates between
  versions. This directly extends the existing idea in `ideas.md` about
  slash commands that set up agents/skills/prompts from this repository.
- **A conformance checker** — a GH Action (and matching local script) that
  validates a repo against its declared COE version: required files present,
  AGENTS.md within size budget, hooks configured, manifest schema valid.

### Notes per component

- **AGENTS.md** — keep it short and enforce it (progressive disclosure):
  a size budget checked by the linter, with pointers to deeper docs and
  skills rather than inlined detail. Consider a tool-agnostic core
  (`AGENTS.md` is emerging as a cross-tool convention) with a thin
  Claude-Code-specific adapter (`CLAUDE.md` importing it) so the standard
  is not locked to one vendor.
- **Skills** — canonical skills live here in ai-utils and are *installed*
  into repos by the installer, so fixes propagate on upgrade instead of
  drifting per-repo.
- **Sandbox** — the manifest declares needs; the devcontainer and Claude
  Code permission settings *implement* them. One source of truth, generated
  outputs.
- **Deterministic checks** — the same checks should run in three places
  with one config: Claude Code hooks (immediate feedback while the agent
  works), pre-commit/local scripts, and GH Actions (authoritative). Hooks
  and CI drifting apart is the main failure mode to design against.
- **Shared mutable knowledge base** — decide early where it lives: a
  `knowledge/` directory per repo, synced or referenced from a central hub
  (this repo is the natural hub). Define who may write (agent
  retrospection sessions append; periodic distillation compacts).
- **Retrospection / self-optimization** — an end-of-session skill that
  appends learnings to the knowledge base, plus a periodic "distill and
  propose COE changes" task. This is what makes the standard improve
  instead of rot.

## Suggested roadmap

1. **v0.1 spec** — write `SPEC.md` covering only the highest-leverage
   pieces: AGENTS.md conventions + directory structure + deterministic
   checks. Leave sandbox/knowledge-base as "reserved" sections.
2. **Dogfood** — make ai-utils itself the first conforming repo.
3. **Reference template** — extract what dogfooding produced into a
   template directory.
4. **Installer** — `/coe-init` slash command that applies the template to a
   fresh repo; then `/coe-upgrade` with a version stamp (`coe.yaml`).
5. **Conformance CI** — GH Action validating the manifest and required
   structure; add it to the template.
6. **Rounds 2+** — sandbox manifest → devcontainer generation, knowledge
   base, retrospection skill. Each lands as a spec version bump plus an
   upgrader migration.

## Open questions

- **Scope**: per-repo standard only, or also an org-level layer (shared
  settings, shared knowledge hub)?
- **Vendor coupling**: how much is Claude-Code-specific (hooks, `.claude/`)
  vs. tool-agnostic (AGENTS.md, devcontainer, CI)? Suggest: agnostic core,
  vendor adapters.
- **Secrets**: manifest names required keys, but what provisions them —
  devcontainer secrets, environment config, something else?
- **Knowledge base writes**: does the agent commit learnings directly, or
  propose them via PR for human review?
- **Enforcement strictness**: is non-conformance a CI failure or a warning?
  Likely warning at first, failure once the standard stabilizes.
