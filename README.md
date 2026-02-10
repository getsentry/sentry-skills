# Sentry Skills

Agent skills for Sentry employees, following the [Agent Skills](https://agentskills.io) open format.

## Installation

### Claude Code

```bash
claude plugin marketplace add getsentry/skills
claude plugin install sentry-skills@sentry-skills
```

Restart Claude Code after installation. Skills activate automatically when relevant.

**Update:**

```bash
claude plugin marketplace update
claude plugin update sentry-skills@sentry-skills
```

Or run `/plugin` to open the plugin manager.

### Skills Package (skills.sh)

For agents supporting the [skills.sh](https://skills.sh) ecosystem:

```bash
npx skills add getsentry/skills
```

Works with Claude Code, Cursor, Cline, GitHub Copilot, and other compatible agents.

## Available Skills

| Skill | Description |
|-------|-------------|
| [code-review](plugins/sentry-skills/skills/code-review/SKILL.md) | Sentry code review guidelines and checklist |
| [commit](plugins/sentry-skills/skills/commit/SKILL.md) | Sentry commit message conventions |
| [create-pr](plugins/sentry-skills/skills/create-pr/SKILL.md) | Create pull requests following Sentry conventions |
| [find-bugs](plugins/sentry-skills/skills/find-bugs/SKILL.md) | Find bugs and security vulnerabilities in branch changes |
| [iterate-pr](plugins/sentry-skills/skills/iterate-pr/SKILL.md) | Iterate on a PR until CI passes and feedback is addressed |
| [claude-settings-audit](plugins/sentry-skills/skills/claude-settings-audit/SKILL.md) | Analyze repo and generate recommended Claude Code settings.json permissions |
| [agents-md](plugins/sentry-skills/skills/agents-md/SKILL.md) | Maintain AGENTS.md with concise agent instructions |
| [brand-guidelines](plugins/sentry-skills/skills/brand-guidelines/SKILL.md) | Write copy following Sentry brand guidelines |
| [doc-coauthoring](plugins/sentry-skills/skills/doc-coauthoring/SKILL.md) | Structured workflow for co-authoring documentation, proposals, and specs |
| [security-review](plugins/sentry-skills/skills/security-review/SKILL.md) | Systematic security code review following OWASP guidelines |
| [code-simplifier](plugins/sentry-skills/skills/code-simplifier/SKILL.md) | Simplifies and refines code for clarity, consistency, and maintainability |
| [skill-creator](plugins/sentry-skills/skills/skill-creator/SKILL.md) | Create new agent skills for this repository |
| [skill-scanner](plugins/sentry-skills/skills/skill-scanner/SKILL.md) | Scan agent skills for security issues before adoption |

## Available Subagents

| Subagent | Description |
|----------|-------------|
| [code-simplifier](plugins/sentry-skills/agents/code-simplifier.md) | Simplifies and refines code for clarity, consistency, and maintainability while preserving all functionality |

## Contributing

### Local Development

```bash
git clone git@github.com:getsentry/skills.git ~/sentry-skills
claude plugin marketplace add ~/sentry-skills
claude plugin install sentry-skills
```

### Repository Structure

```
sentry-skills/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace manifest
├── plugins/
│   └── sentry-skills/
│       ├── .claude-plugin/
│       │   └── plugin.json   # Plugin manifest
│       ├── agents/
│       │   └── code-simplifier.md
│       └── skills/
│           ├── code-review/
│           │   └── SKILL.md
│           └── commit/
│               └── SKILL.md
├── AGENTS.md                 # Agent-facing documentation
├── CLAUDE.md                 # Symlink to AGENTS.md
└── README.md                 # This file
```

### Creating New Skills

Skills follow the [Agent Skills specification](https://agentskills.io/specification). Each skill requires a `SKILL.md` file with YAML frontmatter.

#### Skill Template

Create a new directory under `plugins/sentry-skills/skills/`:

```
plugins/sentry-skills/skills/my-skill/
└── SKILL.md
```

**SKILL.md format:**

```yaml
---
name: my-skill
description: A clear description of what this skill does and when to use it. Include keywords that help agents identify when this skill is relevant.
---

# My Skill Name

## Instructions

Step-by-step guidance for the agent.

## Examples

Concrete examples showing expected input/output.

## Guidelines

- Specific rules to follow
- Edge cases to handle
```

#### Naming Conventions

- **name**: 1-64 characters, lowercase alphanumeric with hyphens only
- **description**: Up to 1024 characters, include trigger keywords
- Keep SKILL.md under 500 lines; split longer content into reference files

#### Optional Fields

| Field | Description |
|-------|-------------|
| `license` | License name or path to license file |
| `compatibility` | Environment requirements (max 500 chars) |
| `model` | Override model for this skill (e.g., `sonnet`, `opus`, `haiku`) |
| `allowed-tools` | Space-delimited list of tools the skill can use |
| `metadata` | Arbitrary key-value pairs for additional properties |

```yaml
---
name: my-skill
description: What this skill does
license: Apache-2.0
model: sonnet
allowed-tools: Read Grep Glob
---
```

### Where Skills Belong

Skills should live in the appropriate location based on their scope:

| Scope | Location | Example |
|-------|----------|---------|
| **Global** - Used across Sentry | `sentry-skills` plugin | `commit`, `code-review`, `create-pr` |
| **Domain-specific** - Used by a team or domain | Dedicated plugin in this repo (e.g., `infra-skills`) | `gcp-logs`, `terraform-review` |
| **Repo-specific** - Only relevant to one repo | The repository itself (`.claude/skills/`) | Project-specific workflows |

When deciding where to place a skill:
- If most Sentry engineers would benefit, add it to `sentry-skills`
- If only a specific team needs it, create or use a domain-specific plugin
- If it only makes sense in one repo, keep it in that repo

#### Marketplace Structure

This repository is a Claude Code **marketplace** - a collection of plugins that can be installed independently. The marketplace manifest (`.claude-plugin/marketplace.json`) lists all available plugins:

```json
{
  "plugins": [
    { "name": "sentry-skills", "source": "./plugins/sentry-skills" },
    { "name": "infra-skills", "source": "./plugins/infra-skills" }
  ]
}
```

Each plugin lives in its own directory under `plugins/` with its own `plugin.json` manifest. Users can install individual plugins:

```bash
# Install just the global skills
claude plugin install sentry-skills@sentry-skills

# Install domain-specific skills
claude plugin install infra-skills@sentry-skills
```

To add a new domain-specific plugin:

1. Create `plugins/<plugin-name>/.claude-plugin/plugin.json`
2. Add skills under `plugins/<plugin-name>/skills/`
3. Register the plugin in `.claude-plugin/marketplace.json`

### Vendoring Skills

We vendor (copy) skills and agents that we use regularly into this repository rather than depending on external sources at runtime. This approach:

- **Ensures consistency** - Everyone on the team uses the same version of each skill
- **Enables customization** - We can adapt skills to Sentry-specific conventions
- **Improves reliability** - No external dependencies that could change or disappear

#### Attribution

When vendoring a skill or agent from an external source, retain proper attribution:

1. **Add a comment** at the top of the file referencing the original source:
   ```markdown
   <!--
   Based on [Original Name] by [Author/Org]:
   https://github.com/example/original-source
   -->
   ```

2. **Include a LICENSE file** in the skill directory if the original has specific licensing requirements:
   ```
   plugins/sentry-skills/skills/vendored-skill/
   ├── SKILL.md
   └── LICENSE      # Original license text
   ```

#### Example: code-simplifier

The `code-simplifier` agent is vendored from [Anthropic's official plugins](https://github.com/anthropics/claude-plugins-official). See the attribution comment at the top of the agent file.

## References

- [Agent Skills Specification](https://agentskills.io/specification)
- [Sentry Engineering Practices](https://develop.sentry.dev/engineering-practices/)

## License

Apache-2.0
