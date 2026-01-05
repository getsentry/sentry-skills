# Sentry Skills

Agent skills for Sentry employees, following the [Agent Skills](https://agentskills.io) open format.

## Installation

### Claude Code (via Marketplace)

```bash
# Add the marketplace
/plugin marketplace add getsentry/sentry-skills

# Install the plugin
/plugin install sentry-skills@sentry-skills
```

### Claude Code (from local clone)

```bash
# Clone the repository
git clone git@github.com:getsentry/sentry-skills.git ~/sentry-skills

# Install the plugin directly
/plugin install ~/sentry-skills
```

After installation, restart Claude Code. The skills will be automatically invoked when relevant to your task.

### Other Agents

Copy the `skills/` directory to your agent's skills location, or reference the SKILL.md files directly according to your agent's documentation.

## Available Skills

| Skill | Description |
|-------|-------------|
| [code-review](plugins/sentry-skills/skills/code-review/SKILL.md) | Sentry code review guidelines and checklist |
| [commit](plugins/sentry-skills/skills/commit/SKILL.md) | Sentry commit message conventions |

## Repository Structure

```
sentry-skills/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace manifest
├── plugins/
│   └── sentry-skills/
│       ├── .claude-plugin/
│       │   └── plugin.json   # Plugin manifest
│       └── skills/
│           ├── code-review/
│           │   └── SKILL.md
│           └── commit/
│               └── SKILL.md
├── AGENTS.md                 # Agent-facing documentation
├── CLAUDE.md                 # Symlink to AGENTS.md
└── README.md                 # This file
```

## Creating New Skills

Skills follow the [Agent Skills specification](https://agentskills.io/specification). Each skill requires a `SKILL.md` file with YAML frontmatter.

### Skill Template

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

### Naming Conventions

- **name**: 1-64 characters, lowercase alphanumeric with hyphens only
- **description**: Up to 1024 characters, include trigger keywords
- Keep SKILL.md under 500 lines; split longer content into reference files

### Optional Fields

```yaml
---
name: my-skill
description: What this skill does
license: Apache-2.0
compatibility: Requires Python 3.9+
allowed-tools: Read, Grep, Glob  # Restrict available tools
---
```

## References

- [Agent Skills Specification](https://agentskills.io/specification)
- [Sentry Engineering Practices](https://develop.sentry.dev/engineering-practices/)

## License

Apache-2.0
