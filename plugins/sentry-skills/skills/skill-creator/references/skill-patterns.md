# Skill Patterns

Concrete examples of skill structures at each complexity tier.

## Simple: SKILL.md Only

Use when the entire skill fits in under ~200 lines with no external resources needed.

**Examples:** `brand-guidelines`, `commit`, `create-pr`

**Structure:**
```
brand-guidelines/
└── SKILL.md
```

**Pattern highlights:**
- Frontmatter with `name` and `description` only (no model override, no allowed-tools)
- Body organized with `##` sections for different aspects of the domain
- Heavy use of tables for decision logic and examples
- No references to external files

**When to use:** The skill provides a single coherent set of rules or a short procedural workflow. All the information an agent needs fits comfortably in one file.

## Workflow: SKILL.md + Scripts

Use when the skill automates a multi-step workflow with structured data processing.

**Examples:** `iterate-pr`

**Structure:**
```
iterate-pr/
├── SKILL.md
└── scripts/
    ├── fetch_pr_checks.py
    └── fetch_pr_feedback.py
```

**Pattern highlights:**
- SKILL.md documents each script's interface (arguments, output JSON schema)
- Scripts use PEP 723 inline metadata for dependencies:
  ```python
  # /// script
  # requires-python = ">=3.12"
  # dependencies = ["requests"]
  # ///
  ```
- Invoked with `uv run ${CLAUDE_SKILL_ROOT}/scripts/script_name.py`
- Scripts run from the **repository root**, not the skill directory
- Scripts output structured JSON for agent consumption
- SKILL.md includes a fallback section for when scripts fail

**When to use:** The workflow benefits from structured data extraction, API calls, or processing that would be fragile as inline bash commands.

## Domain Expert: SKILL.md + References

Use when the skill covers a broad domain with conditional knowledge loading.

**Examples:** `security-review`

**Structure:**
```
security-review/
├── SKILL.md
├── LICENSE
├── references/
│   ├── injection.md
│   ├── xss.md
│   ├── authentication.md
│   └── ... (17 reference files)
├── languages/
│   ├── python.md
│   └── javascript.md
└── infrastructure/
    ├── docker.md
    └── kubernetes.md
```

**Pattern highlights:**
- SKILL.md contains the core workflow and quick-reference tables
- Reference files are loaded **conditionally** based on detected context:
  ```markdown
  | Code Type | Load These References |
  |-----------|----------------------|
  | API endpoints | `authorization.md`, `injection.md` |
  | Frontend | `xss.md`, `csrf.md` |
  ```
- Each reference file is self-contained and focused on one topic
- SKILL.md includes a file index so the agent knows what's available
- LICENSE included because content is adapted from external sources

**When to use:** The domain is too large for one file, but the agent only needs a subset for any given task. Progressive disclosure keeps context small.

## Anti-Patterns

### Over-long SKILL.md

**Problem:** SKILL.md exceeds 500 lines, consuming excessive context window.

**Fix:** Extract reference material into `references/` files. Keep SKILL.md focused on the procedural workflow and load references conditionally.

### Missing Trigger Keywords

**Problem:** Description says "A skill for helping with code" — agents can't match this to user requests like "review my PR" or "check for bugs".

**Fix:** Include the actual phrases users say: `Use when asked to "review code", "find bugs", "check for issues"`.

### Duplicating CLAUDE.md

**Problem:** SKILL.md repeats repo conventions already in CLAUDE.md (commit format, PR process, etc.).

**Fix:** Reference CLAUDE.md where needed. Skills should add domain knowledge, not repeat general conventions. Example: "Follow the commit conventions in CLAUDE.md" instead of copying the entire commit format spec.

### Unconditional Reference Loading

**Problem:** SKILL.md says "Read all reference files before starting" — loads 20+ files into context regardless of the task.

**Fix:** Use a decision table to load only relevant references:
```markdown
| Detected Language | Read |
|------------------|------|
| Python           | `references/python.md` |
| JavaScript       | `references/javascript.md` |
```

### Scripts Without Documentation

**Problem:** SKILL.md says `uv run ${CLAUDE_SKILL_ROOT}/scripts/tool.py` but doesn't document what arguments it takes or what it outputs.

**Fix:** Document every script's interface in SKILL.md:
```markdown
### `scripts/tool.py`
Fetches X and returns structured data.
```bash
uv run ${CLAUDE_SKILL_ROOT}/scripts/tool.py --flag VALUE
```
Returns JSON:
```json
{"key": "value", "items": [...]}
```
```

### Hardcoded Paths

**Problem:** SKILL.md references a hardcoded path like `plugins/my-plugin/skills/my-skill/scripts/tool.py`.

**Fix:** Always use `${CLAUDE_SKILL_ROOT}/scripts/tool.py`. The variable resolves to the skill's directory regardless of where the agent runs from.
