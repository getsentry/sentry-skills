---
name: seer-review
description: >-
  Get AI-powered code review on local changes using Sentry CLI.
  Use when reviewing commits before creating a PR, finding bugs in recent changes,
  or getting automated code feedback.
  Triggers on: review my code, find bugs in commit, sentry review, ai code review, seer.
allowed-tools:
  - Bash
  - Task
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - AskUserQuestion
  - EnterPlanMode
---

# Seer Code Review

Review local code changes using Sentry's AI-powered bug prediction service.

## Overview

This skill invokes `sentry-cli review` to analyze the most recent commit (HEAD vs HEAD~1) and get AI feedback on potential bugs before creating a pull request.

**Important context:** Seer analyzes code without knowing **why** changes were made. You have context from the user's original request that Seer lacks. Treat Seer's suggestions with healthy skepticism and evaluate them against your existing context.

## Step 1: Run Review

Execute the review script:

```bash
./plugins/sentry-skills/skills/seer-review/scripts/run-review.sh
```

## Step 2: Handle Errors

If the review command fails, handle these common errors:

| Error | Resolution |
|-------|------------|
| Authentication required | Tell user to create a token at https://sentry.io/settings/account/api/auth-tokens/ with the correct permissions |
| Command not found / unavailable | Tell user to upgrade Sentry CLI to the latest version |
| HEAD is a merge commit | Tell user to review from a non-merge commit |
| HEAD has no parent | Tell user this is the initial commit, cannot review |
| Diff too large | Suggest breaking into smaller commits |
| No remote URL | Tell user to add a git remote |

If an error occurs, stop here and report the error to the user with the resolution.

## Step 3: Evaluate Each Comment

If the review returns issues, you must evaluate each one against your existing context.

**Critical:** Seer analyzes code in isolation without access to the conversation history or the user's intent. This means Seer may identify issues that seem valid from its perspective but are incorrect given what you know. For example:
- Seer might flag a behavioral change as a bug when the user explicitly requested that change
- Seer might suggest reverting code that the user specifically asked you to write
- Seer might identify a "missing" check that was intentionally removed

**Do not blindly trust Seer's confidence levels or severity ratings.** Seer may label an issue as "critical" or express high confidence, but this confidence is based solely on its limited context. When your context contradicts Seer's assessment, your context takes precedence.

**For each Seer comment, spawn a Plan sub-agent** (using the Task tool) to evaluate validity:

```
Evaluate this Seer code review comment against the context of the user's original request.

SEER COMMENT:
[paste the comment here]

USER'S ORIGINAL CONTEXT:
[summarize what the user asked you to do and why]

IMPORTANT: Seer does not have access to the conversation history or the user's intent.
Its confidence levels and severity ratings are based only on its limited context.
If Seer's suggestion contradicts what the user asked for, the suggestion is likely invalid
regardless of how confident or critical Seer's assessment appears.

Determine if this issue is:
- **Fully valid**: The issue is a real problem that should be fixed
- **Not valid**: The issue is incorrect because it conflicts with the user's intent
- **Partially valid**: Part of the issue is valid (specify which part)

Do NOT plan fixes yet. Only evaluate validity.

OUTPUT FORMAT:
VERDICT: [fully valid | not valid | partially valid (specify which part)]

SUMMARY: [1-2 sentence summary for someone who has NOT read the full Seer output.
First, briefly state what Seer flagged. Then, state your assessment of whether it's valid.
This will be shown in a dialog, so it must be standalone and clearly distinguish
Seer's concern from your evaluation.]

OPTIONS CONSIDERED:
1. Fully valid
   - Implication: [what this means if true]
   - Reasoning: [why you accepted/rejected this - one sentence]
2. Not valid
   - Implication: [what this means if true]
   - Reasoning: [why you accepted/rejected this - one sentence]
3. Partially valid (if applicable)
   - Implication: [what this means if true]
   - Reasoning: [why you accepted/rejected this - one sentence]
```

**Spawn these sub-agents in parallel** for efficiency when there are multiple comments.

## Step 4: Present Results to User

After all sub-agents complete, present results in two phases:

### Phase 1: Print Raw Seer Output

First, print the complete Seer output with reference numbers. Emphasize this is Seer's uninterpreted output:

```
## Raw Seer Output

The following issues were identified by Seer. Note: This is Seer's uninterpreted
output—Seer does not have access to our conversation context.

### Issue #1: [file:line] [SEVERITY]
[Full description from Seer]
Suggested fix: [Seer's suggested fix]

### Issue #2: [file:line] [SEVERITY]
[Full description from Seer]
Suggested fix: [Seer's suggested fix]
```

### Phase 2: Ask User with Summaries

Then use AskUserQuestion for each issue, using the sub-agent's SUMMARY in the question. The summary must be clear enough that users can make decisions without reading the raw output above.

For each issue:
- Reference the issue number (e.g., "Issue #1")
- Include the sub-agent's summary (1-2 sentences)
- Offer options: Accept, Reject, or Modify
- Mark the sub-agent's verdict as the recommended option

The user has ultimate authority over all decisions.

## Step 5: Plan and Implement Fixes

If the user accepts any issues as valid:

1. Use EnterPlanMode to plan fixes for the accepted issues only
2. Get user approval on the plan
3. Implement the approved fixes
4. Commit the changes if appropriate

## Step 6: Re-run Review (Loop)

After implementing fixes, re-run the review:

```bash
./plugins/sentry-skills/skills/seer-review/scripts/run-review.sh
```

**Repeat this entire workflow** (Steps 1-6) until one of these conditions is met:
- Seer returns an error
- Seer finds no issues
- User rejects all remaining comments

## Notes

- The review analyzes HEAD vs HEAD~1 only (most recent commit)
- Binary files are automatically skipped
- The API has a 10-minute timeout for long-running analysis
- The base commit must be pushed to the remote repository
- Maximum diff size: 500 KB
