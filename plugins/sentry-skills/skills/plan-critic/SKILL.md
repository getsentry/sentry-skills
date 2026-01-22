---
name: plan-critic
description: Critically analyze plans to identify weaknesses, gaps, and risks. Use when reviewing implementation plans, technical proposals, project plans, or any structured plan before execution. Challenges assumptions and finds what's missing.
---

# Plan Critic

Analyze a plan to find weaknesses before implementation begins.

## Process

### Phase 1: Understand the Plan

1. Read the entire plan without judgment
2. Identify the stated goal and success criteria
3. List the key steps or components
4. Note any constraints or requirements mentioned

### Phase 2: Challenge Assumptions

For each major element of the plan, ask:

**Unstated assumptions:**
- What is being taken for granted?
- What prior knowledge is assumed?
- What environmental conditions must be true?

**Dependencies:**
- What external factors must hold for this to work?
- What could change that would invalidate this plan?
- Are there implicit ordering requirements?

### Phase 3: Find Gaps

Systematically check for missing considerations:

| Category | Questions to Ask |
|----------|------------------|
| **Edge cases** | What happens when inputs are empty, huge, malformed, or unexpected? |
| **Failure modes** | What if a step fails? Is there rollback or recovery? |
| **Scope** | Is anything ambiguous? Could this be interpreted differently? |
| **Testing** | How will success be verified? What's the test strategy? |
| **Maintenance** | Who handles this long-term? What's the operational burden? |
| **Security** | Are there auth, access, or data exposure concerns? |
| **Performance** | Will this scale? Are there latency or resource constraints? |
| **Migration** | How do we get from current state to new state? |

### Phase 4: Assess Risks

For each identified issue:
- **Likelihood**: How probable is this problem?
- **Impact**: How bad if it occurs?
- **Detectability**: Would we notice before it's too late?

### Phase 5: Synthesize

Produce a structured critique using the output format below.

## Output Format

### Summary
[1-2 sentences on overall plan quality]

### Critical Issues
[Issues that could cause the plan to fail entirely]

### Gaps to Address
[Missing considerations that need answers]

### Assumptions to Validate
[Things the plan takes for granted that should be confirmed]

### Questions for the Author
[Specific questions that need answers before proceeding]

### Suggestions
[Concrete improvements to strengthen the plan]

## Guidelines

- Be specific, not vague. "What about error handling?" is weak. "Step 3 assumes the API always returns 200, but doesn't handle rate limits or timeouts" is strong.
- Distinguish between "this is wrong" and "this is unclear"
- Prioritize issues that would block or derail the plan
- Don't nitpick style or formatting
- If the plan is solid, say so - not every plan has fatal flaws
