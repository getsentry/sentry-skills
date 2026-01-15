---
name: seer-review
description: Get AI-powered code review on local changes using Sentry CLI. Use when reviewing commits before creating a PR, finding bugs in recent changes, or getting automated code feedback. Triggers on: review my code, find bugs in commit, sentry review, ai code review, seer.
---

# Seer Code Review

Review local code changes using Sentry's AI-powered bug prediction service.

## Overview

This skill invokes `sentry-cli review` to analyze the most recent commit (HEAD vs HEAD~1) and get AI feedback on potential bugs before creating a pull request.

## Step 1: Resolve CLI Path

Get the sentry-cli path by running the helper script:

```bash
./plugins/sentry-skills/skills/seer-review/scripts/get-sentry-cli.sh
```

Store the output as `SENTRY_CLI` for subsequent commands.

## Step 2: Run the Review

Execute the review command:

```bash
$SENTRY_CLI review
```

**Expected outputs:**

1. **Success with no issues**: "No issues found in this commit."
2. **Success with issues**: Lists predictions with severity (HIGH/MEDIUM/LOW), file path, line number, description, and suggested fixes
3. **Error cases**:
   - "HEAD is a merge commit" - cannot review merge commits
   - "HEAD has no parent commit" - cannot review initial commit
   - "Diff is too large" - diff exceeds 500KB limit
   - "Authentication required" - user needs to run `sentry-cli login`
   - "No remote URL found" - repo needs an origin or upstream remote

## Step 3: Process Results

### If no issues found
Report success to the user.

### If issues found
For each prediction in the output:

1. **Present the issue** to the user with:
   - Severity level
   - File and line number
   - Description of the problem
   - Suggested fix (if provided)

2. **Offer to fix**: Ask the user if they want you to apply the suggested fixes.

3. **Apply fixes** (if user agrees):
   - Read the file at the specified path
   - Apply the suggested fix at the indicated line
   - Show the change to the user

4. **Verify fixes**: After applying all fixes, offer to re-run the review to confirm the issues are resolved.

## Step 4: Handle Errors

| Error | Resolution |
|-------|------------|
| Authentication required | Tell user to run `sentry-cli login` |
| HEAD is a merge commit | Tell user to review from a non-merge commit |
| HEAD has no parent | Tell user this is the initial commit, cannot review |
| Diff too large | Suggest breaking into smaller commits |
| No remote URL | Tell user to add a git remote |

## Notes

- The review analyzes HEAD vs HEAD~1 only (most recent commit)
- Binary files are automatically skipped
- The API has a 10-minute timeout for long-running analysis
- The base commit must be pushed to the remote repository
