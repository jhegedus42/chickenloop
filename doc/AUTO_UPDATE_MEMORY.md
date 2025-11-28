# 🔄 Auto-Update Memory File System

This document explains the automatic update system for `SESSION_MEMORY.md`.

## Overview

The `SESSION_MEMORY.md` file is automatically updated on each commit to keep it synchronized with the latest project state and commit information.

## How It Works

1. **Git Pre-Commit Hook**: When you run `git commit`, a pre-commit hook runs automatically
2. **Update Script**: The hook calls `scripts/update-memory.sh`
3. **Memory File Update**: The script updates metadata in `SESSION_MEMORY.md`:
   - Last Updated timestamp
   - Last Commit By (git user name and email)
   - Current branch name
4. **Auto-Stage**: The updated memory file is automatically added to the commit
5. **Commit Proceeds**: Your commit includes the updated memory file

## What Gets Updated

The following metadata at the top of `SESSION_MEMORY.md` is updated automatically:

```markdown
**Last Updated:** November 26, 2025 at 10:22 AM CET
**Last Commit By:** Tzwengali (sven.kelling@gmail.com)
**Branch:** main
```

## Installation

### First Time Setup

For new team members or fresh repository clones, install the git hooks:

```bash
./scripts/install-git-hooks.sh
```

This script:
- Creates the pre-commit hook in `.git/hooks/pre-commit`
- Makes it executable
- Ensures it runs the update script correctly

### Already Installed?

If you've already run `install-git-hooks.sh`, the hook is active and will run automatically on every commit. No additional setup needed!

## Files Involved

- **`.git/hooks/pre-commit`** - Git hook that runs before each commit (installed by `install-git-hooks.sh`)
- **`scripts/update-memory.sh`** - Script that updates the memory file
- **`scripts/install-git-hooks.sh`** - Installation script for the hook
- **`SESSION_MEMORY.md`** - The memory file that gets updated

## Testing

To test that the system works:

1. Make a small change to any file
2. Stage it: `git add <file>`
3. Commit: `git commit -m "Test commit"`
4. Check `SESSION_MEMORY.md` - it should show the updated timestamp and your git user info

## Disabling Auto-Update

If you need to disable the auto-update temporarily:

```bash
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

To re-enable:

```bash
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Manual Update

If you want to update the memory file manually without committing:

```bash
./scripts/update-memory.sh
```

This will update the file and stage it, but you still need to commit it.

## Notes

- The hook runs before each commit automatically
- If the hook fails, the commit will be aborted
- The memory file is always included in commits when it's updated
- The update script is safe - it only updates metadata, not the content

## Troubleshooting

**Hook not running?**
- Verify it exists: `ls -la .git/hooks/pre-commit`
- Check permissions: `chmod +x .git/hooks/pre-commit`
- Reinstall: `./scripts/install-git-hooks.sh`

**Memory file not updating?**
- Check if `SESSION_MEMORY.md` exists in the repo root
- Verify the script is executable: `chmod +x scripts/update-memory.sh`
- Run the script manually: `./scripts/update-memory.sh`

**Permission errors?**
- Ensure scripts are executable: `chmod +x scripts/*.sh`
- Check git hook permissions: `chmod +x .git/hooks/pre-commit`

---

**This system ensures that `SESSION_MEMORY.md` always reflects the latest commit information, making it a reliable reference for project state across sessions.**

