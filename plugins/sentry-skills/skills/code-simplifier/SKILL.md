---
name: code-simplifier
description: Simplify code changes in a branch by removing unnecessary complexity, AI-generated patterns, defensive checks, and verbose constructs. Use when cleaning up code, removing over-engineering, simplifying complex logic, or improving readability. Checks diff against base branch.
---

# Code Simplifier

Analyze the diff against the base branch and simplify all code changes by removing unnecessary complexity, over-engineering, and AI-generated patterns.

## What to Simplify

### Remove Unnecessary Patterns

- **Extra comments** that a human wouldn't add or are inconsistent with the rest of the file
- **Defensive checks** or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted/validated codepaths)
- **Type casts to any** or similar escape hatches to get around type issues
- **Inline imports** in Python (move to top of file with other imports)
- **Overly verbose variable names** that don't match the project's style
- **Unnecessary abstractions** like single-use helper functions that could be inlined
- **Redundant null/undefined checks** when values are guaranteed to exist
- **Console.log or print statements** added for debugging

### Simplify Complex Code

- **Nested conditionals** that can be flattened with early returns
- **Complex boolean expressions** that can be simplified or extracted into well-named variables
- **Overly generic code** that tries to handle cases that don't exist
- **Duplicate logic** that should be consolidated
- **Long chains of ternary operators** that should be if/else or switch statements
- **Over-abstracted code** that's harder to understand than a simpler alternative

### Fix Style Inconsistencies

- **Inconsistent formatting** compared to the rest of the file
- **Mixed quote styles** (single vs double quotes)
- **Inconsistent naming conventions** (camelCase vs snake_case)
- **Spacing and indentation** that doesn't match the file
- **Import organization** that doesn't follow the project's conventions

## What NOT to Change

- **Legitimate bug fixes** or error handling that's necessary
- **Intentional architectural changes** that add necessary complexity
- **Required type annotations** or casts for legitimate type safety
- **Comments explaining non-obvious behavior** or business logic
- **Code that matches the existing pattern** in the file, even if verbose

## Process

1. Get the diff against the default branch:
   ```bash
   git diff $(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name')...HEAD
   ```

2. For each changed file:
   - Read the full file to understand the existing style and patterns
   - Identify changes that introduce unnecessary complexity or verbosity
   - Identify AI-generated patterns that don't match the codebase style
   - Look for opportunities to simplify logic while preserving functionality

3. Apply simplifications:
   - Remove identified patterns and unnecessary code
   - Simplify complex constructs while maintaining correctness
   - Ensure changes match the file's existing style
   - Preserve all legitimate functionality

4. Verify:
   - Ensure simplified code maintains the same behavior
   - Check that the style is consistent with the rest of the file
   - Verify no legitimate changes were removed

5. Report a 1-3 sentence summary of what was simplified

## Examples

### Example 1: Removing Defensive Checks

**Before:**
```python
def get_user_name(user):
    # Make sure user exists
    if user is None:
        return None
    # Check if name attribute exists
    if hasattr(user, 'name'):
        name = user.name
        # Ensure name is not None
        if name is not None:
            return name
    return None
```

**After:**
```python
def get_user_name(user):
    return user.name if user else None
```

### Example 2: Simplifying Nested Conditionals

**Before:**
```python
def process_order(order):
    if order is not None:
        if order.status == 'pending':
            if order.amount > 0:
                return process_payment(order)
            else:
                return 'Invalid amount'
        else:
            return 'Order not pending'
    else:
        return 'No order'
```

**After:**
```python
def process_order(order):
    if not order:
        return 'No order'
    if order.status != 'pending':
        return 'Order not pending'
    if order.amount <= 0:
        return 'Invalid amount'
    return process_payment(order)
```

### Example 3: Removing Unnecessary Abstractions

**Before:**
```typescript
const getUserEmail = (user: User): string => user.email;
const getUserName = (user: User): string => user.name;

function displayUser(user: User) {
  const email = getUserEmail(user);
  const name = getUserName(user);
  console.log(`${name}: ${email}`);
}
```

**After:**
```typescript
function displayUser(user: User) {
  console.log(`${user.name}: ${user.email}`);
}
```

## Guidelines

- **Prioritize readability** over cleverness
- **Match the existing codebase style** rather than imposing external patterns
- **Preserve all functionality** - simplification should not change behavior
- **Focus on recent changes** in the diff, not pre-existing code
- **When in doubt, keep it** - only remove or simplify when clearly unnecessary
- **Test understanding** by reading the simplified code aloud - does it make sense?
