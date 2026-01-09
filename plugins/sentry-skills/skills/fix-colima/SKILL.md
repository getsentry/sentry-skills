---
name: fix-colima
description: Diagnose and fix Colima/Docker issues when devservices or devenv doctor fails - handles broken Docker contexts, stuck VMs, and DNS issues
---

# Fix Colima

## Overview

Diagnoses and fixes common Colima/Docker issues that prevent local Sentry development.

**Core principle:** Check Docker context first (most common issue), then Colima status, then escalate.

**Announce at start:** "I'm using the fix-colima skill to diagnose and fix your Docker/Colima setup."

## Diagnostic Steps

Run these checks in parallel to gather information:

```bash
# Check Docker context - most common issue
docker context ls

# Check Colima status
colima status 2>&1

# Run devenv doctor (non-interactive)
echo "n" | devenv doctor 2>&1 | head -50
```

## Common Issues and Fixes

### Issue 1: Broken Docker Context (Most Common)

**Symptoms:**
- `docker context ls` shows `desktop-linux *` with an error
- Context marked with `*` but shows "context not found"

**Fix:**

```bash
# Switch to default context
docker context use default

# Force stop Colima
colima stop -f

# Start Colima (uses devenv to get correct config)
devenv colima start
```

**Why this happens:** Old Docker Desktop installations leave behind a broken `desktop-linux` context.

### Issue 2: Colima Not Running

**Symptoms:**
- `colima status` shows "not running" or "empty value" error
- devenv doctor shows "colima's DNS isn't working"

**Fix:**

```bash
# Force stop (cleans up stuck state)
colima stop -f

# Start Colima (uses devenv to get correct config)
devenv colima start
```

### Issue 3: Colima VM Stuck

**Symptoms:**
- Colima hangs on "Waiting for the essential requirement 1 of 4: ssh"
- `colima stop` hangs

**Fix:**

```bash
# Check for stuck processes
ps aux | grep -E 'colima|lima' | grep -v grep

# Force stop with cleanup
colima stop -f

# Start Colima
devenv colima start
```

### Issue 4: Wrong Docker Context After Fix

**Symptoms:**
- After starting Colima, `docker context ls` doesn't show `colima *`

**Fix:**

```bash
docker context use colima
```

## Verification Steps

After applying fixes, verify everything works:

```bash
# Check Docker context is correct
docker context ls
# Should show: colima *

# Check containers are running
docker ps

# Run devenv doctor
echo "n" | devenv doctor 2>&1
# Should show all green checkmarks
```

## Quick Reference

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `desktop-linux` context with error | Old Docker Desktop | `docker context use default` → restart Colima |
| "empty value" error | Colima not running | `colima stop -f` → `devenv colima start` |
| Hangs on SSH requirement | VM stuck | `colima stop -f` → restart |
| DNS not working | Colima not running | Restart Colima |
| Containers not visible | Wrong context | `docker context use colima` |

## Nuclear Option (Last Resort)

**WARNING: This deletes Docker volumes and databases. Only use if above steps fail.**

```bash
colima delete default
devenv colima start
devenv sync  # Recreate dev database
```

**Ask user before running nuclear option.**

## Data Safety Notes

- Switching Docker context does NOT delete containers or volumes
- `colima stop -f` does NOT delete data
- Only `colima delete` destroys data

## Red Flags

**Never:**
- Run `colima delete` without asking user first
- Skip verification steps after fix
- Assume the fix worked without checking `docker ps`

**Always:**
- Check Docker context first (most common issue)
- Use `colima stop -f` before starting (cleans up stuck state)
- Verify with `docker ps` and `devenv doctor` after fix
- Reassure user their data is safe (unless using nuclear option)
