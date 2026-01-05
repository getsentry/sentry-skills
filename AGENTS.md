# Sentry Agent Skills

A collection of agent skills following the [Agent Skills specification](https://agentskills.io) for use by Sentry employees.

## Structure

```
plugins/sentry-skills/skills/<skill-name>/SKILL.md
```

Each skill is a directory containing a `SKILL.md` file with YAML frontmatter (`name`, `description`) and markdown instructions.

## Creating a Skill

1. Create `plugins/sentry-skills/skills/<skill-name>/SKILL.md`
2. Add frontmatter with `name` (kebab-case, 1-64 chars) and `description` (up to 1024 chars with trigger keywords)
3. Write clear instructions in markdown

```yaml
---
name: example-skill
description: What this skill does and when to use it. Include trigger keywords.
---

# Example Skill

Instructions for the agent.
```

## Current Skills

- `code-review` - Sentry code review guidelines
- `commit` - Sentry commit message conventions

## References

- [Agent Skills Spec](https://agentskills.io/specification)
- [Sentry Engineering Practices](https://develop.sentry.dev/engineering-practices/)
