---
name: deslop
description: Remove AI-generated code slop from a branch. Use when cleaning up AI-generated code, removing unnecessary comments, defensive checks, or type casts. Checks diff against base branch (main/master) and fixes style inconsistencies.
---

# Remove AI Code Slop

Check the diff against the base branch and remove all AI-generated slop introduced in this branch.

## What to Remove

- Extra comments that a human wouldn't add or are inconsistent with the rest of the file
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted/validated codepaths)
- Casts to `any` to get around type issues
- Inline imports in Python (move to top of file with other imports)
- Any other style that is inconsistent with the file

## Process

1. Detect the base branch and get the diff:
   ```bash
   BASE=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
   git diff $BASE...HEAD
   ```
2. Review each changed file for slop patterns
3. Remove identified slop while preserving legitimate changes
4. Report a 1-3 sentence summary of what was changed
