#!/bin/bash
# Fetches PR template from GitHub or outputs the default template

template=$(gh repo view --json pullRequestTemplates --jq '.pullRequestTemplates[0].body' 2>/dev/null)

if [ -n "$template" ]; then
    echo "$template"
else
    cat <<'EOF'
<brief description of what the PR does>

<why these changes are being made - the motivation>

<alternative approaches considered, if any>

<any additional context reviewers need>
EOF
fi
