#!/bin/bash

# Script to update SESSION_MEMORY.md with current commit information
# This is called automatically by the git pre-commit hook

# Get the repository root directory (where .git folder is)
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT" || exit 1

MEMORY_FILE="SESSION_MEMORY.md"

if [ ! -f "$MEMORY_FILE" ]; then
    echo "Warning: $MEMORY_FILE not found"
    exit 0
fi

# Get current date and time
CURRENT_DATE=$(date +"%B %d, %Y")
CURRENT_TIME=$(date +"%I:%M %p %Z")

# Get git user info
GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Get staged files
STAGED_FILES=$(git diff --cached --name-only | head -10 | tr '\n' ',' | sed 's/,$//' | sed 's/,/, /g')

# Update the "Last Updated" line at the top of the file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|^\*\*Last Updated:\*\*.*|\*\*Last Updated:\*\* ${CURRENT_DATE} at ${CURRENT_TIME}|" "$MEMORY_FILE"
    sed -i '' "s|^\*\*Last Commit By:\*\*.*|\*\*Last Commit By:\*\* ${GIT_USER} (${GIT_EMAIL})|" "$MEMORY_FILE"
    sed -i '' "s|^\*\*Branch:\*\*.*|\*\*Branch:\*\* ${CURRENT_BRANCH}|" "$MEMORY_FILE"
else
    # Linux
    sed -i "s|^\*\*Last Updated:\*\*.*|\*\*Last Updated:\*\* ${CURRENT_DATE} at ${CURRENT_TIME}|" "$MEMORY_FILE"
    sed -i "s|^\*\*Last Commit By:\*\*.*|\*\*Last Commit By:\*\* ${GIT_USER} (${GIT_EMAIL})|" "$MEMORY_FILE"
    sed -i "s|^\*\*Branch:\*\*.*|\*\*Branch:\*\* ${CURRENT_BRANCH}|" "$MEMORY_FILE"
fi

# Add the memory file to staging if it's not already staged
if ! git diff --cached --name-only | grep -q "$MEMORY_FILE"; then
    git add "$MEMORY_FILE"
fi

echo "✅ Updated $MEMORY_FILE with current commit information"

