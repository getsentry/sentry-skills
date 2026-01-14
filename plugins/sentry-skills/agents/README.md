# Subagents

This directory contains subagent definitions for use with Claude Code.

## What are Subagents?

Subagents are specialized AI agents that operate autonomously to perform specific tasks. Unlike skills (which provide instructions for the main agent), subagents run independently and can be invoked automatically by Claude Code when relevant.

Learn more: https://code.claude.com/docs/en/sub-agents

## Available Subagents

### code-simplifier

**Based on:** [Anthropic's code-simplifier subagent](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md)

Simplifies and refines code for clarity, consistency, and maintainability while preserving all functionality. This subagent operates autonomously and proactively, refining code immediately after it's written or modified.

## Adding New Subagents

To add a new subagent:

1. Create a `.md` file in this directory with YAML frontmatter
2. Include required fields: `name`, `description`, and optionally `model`
3. Add attribution if the subagent is from an external source
4. Update this README to document the new subagent
