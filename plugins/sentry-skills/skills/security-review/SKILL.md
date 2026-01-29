---
name: security-review
description: This skill should be used when the user asks to "security review", "find vulnerabilities", "check for security issues", "audit code security", "OWASP review", "pen test code", "identify security bugs", or mentions reviewing code for injection, XSS, authentication, authorization, cryptography, or other security concerns. Provides systematic security code review following OWASP guidelines.
model: sonnet
allowed-tools: Read Grep Glob Bash Task
license: LICENSE
---

<!--
Reference material in this skill is based on the OWASP Cheat Sheet Series:
https://cheatsheetseries.owasp.org/

The OWASP Cheat Sheet Series is licensed under Creative Commons
Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).
https://creativecommons.org/licenses/by-sa/4.0/

OWASP Foundation: https://owasp.org/
-->

# Security Review Skill

Review the provided code for exploitable security vulnerabilities. Focus only on the specific file or change given—do not map or explore the broader codebase.

## Review Process

1. **Read the code** provided by the user (file, diff, or code block)
2. **Check against security patterns** in each category below
3. **Report only actual vulnerabilities**—not best-practice suggestions or theoretical concerns
4. **Consult reference files** when deeper guidance is needed for a specific vulnerability type

## Severity Levels

- **Critical**: Directly exploitable, high impact (RCE, auth bypass, data breach)
- **High**: Exploitable with conditions, significant impact
- **Medium**: Requires specific conditions or moderate impact
- **Low**: Defense-in-depth issues with minimal direct impact

Do NOT report informational or best-practice items unless specifically requested.

---

## Security Categories

### 1. Injection Vulnerabilities

**Reference**: `references/injection.md`

| Type | Vulnerable Patterns |
|------|---------------------|
| SQL Injection | String concatenation in `execute`, `query`, `raw`, `cursor` |
| NoSQL Injection | `$where`, `$regex`, `eval`, dynamic MongoDB queries |
| OS Command Injection | User input in `exec`, `spawn`, `system`, `popen`, `subprocess` |
| Template Injection | User input in `render`, `template` strings |

### 2. Cross-Site Scripting (XSS)

**Reference**: `references/xss.md`

| Context | Vulnerable Patterns |
|---------|---------------------|
| HTML Body | `innerHTML`, `document.write`, unescaped template variables |
| HTML Attributes | Unquoted attributes, event handlers with user data |
| JavaScript | `eval`, `setTimeout(string)`, `Function()`, dynamic script generation |
| URL | `javascript:` URLs, unvalidated redirects |

### 3. Authentication & Sessions

**Reference**: `references/authentication.md`

| Issue | Vulnerable Patterns |
|-------|---------------------|
| Weak credential storage | `md5`, `sha1` for passwords |
| Predictable sessions | `uuid1`, `time()`, `Math.random` in session generation |
| Session fixation | Login without session ID regeneration |
| Insecure cookies | Missing `Secure`, `HttpOnly`, `SameSite` |

### 4. Authorization & Access Control

**Reference**: `references/authorization.md`

| Issue | Vulnerable Patterns |
|-------|---------------------|
| Missing authorization | Endpoint handlers without permission checks |
| IDOR | User-controlled IDs without ownership validation |
| Path traversal | File operations with user-controlled paths |

### 5. Cryptography

**Reference**: `references/cryptography.md`

| Issue | Vulnerable Patterns |
|-------|---------------------|
| Weak algorithms | `MD5`, `SHA1`, `DES`, `RC4`, `ECB` mode |
| Hardcoded keys | Key literals, crypto-looking constants |
| Insecure random | `Math.random`, `random.random` for security purposes |

### 6. Sensitive Data Exposure

**Reference**: `references/data-protection.md`

| Issue | Vulnerable Patterns |
|-------|---------------------|
| Credentials in logs | Logging passwords, tokens, secrets |
| Secrets in code | Hardcoded API keys, passwords, connection strings |
| Data leakage | Returning password hashes, PII in API responses |

### 7. Server-Side Request Forgery (SSRF)

**Reference**: `references/ssrf.md`

| Issue | Vulnerable Patterns |
|-------|---------------------|
| URL fetching | User input in `fetch`, `requests.get`, `urllib`, `curl` |
| Cloud metadata | Access to `169.254.169.254` |

### 8. Insecure Deserialization

**Reference**: `references/deserialization.md`

| Issue | Vulnerable Patterns |
|-------|---------------------|
| Python | `pickle.loads`, `yaml.load` (not `safe_load`) |
| Java | `ObjectInputStream.readObject`, `XMLDecoder` |
| PHP | `unserialize` with user input |

### 9. File Operations

**Reference**: `references/file-security.md`

| Issue | Vulnerable Patterns |
|-------|---------------------|
| Path traversal | User input in `open()`, `send_file()`, `../` sequences |
| Unrestricted upload | Missing file type/extension validation |
| XXE | XML parsing without disabling external entities |

### 10. Modern Threats

**Reference**: `references/modern-threats.md`

| Issue | Vulnerable Patterns |
|-------|---------------------|
| Prototype pollution | `__proto__`, `constructor.prototype` with user input |
| WebSocket auth | Missing origin/auth validation |
| LLM prompt injection | User input concatenated into LLM prompts |

---

## Output Format

```markdown
## Security Review: [File/Component Name]

### Summary
- **Issues Found**: X (Y Critical, Z High, ...)
- **Risk Level**: Critical/High/Medium/Low

### Findings

#### [VULN-001] [Vulnerability Type] (Severity)
- **Location**: `file.py:123`
- **Issue**: [What the vulnerability is]
- **Impact**: [What an attacker could do]
- **Evidence**: [Code snippet]
- **Fix**: [How to remediate]
```

If no vulnerabilities are found, state that clearly and briefly.

---

## Reference Files

Consult these for detailed patterns and remediation guidance:

- `references/injection.md` - SQL, NoSQL, OS Command injection
- `references/xss.md` - Cross-site scripting
- `references/authentication.md` - Authentication and sessions
- `references/authorization.md` - Access control and IDOR
- `references/cryptography.md` - Cryptographic operations
- `references/data-protection.md` - Sensitive data handling
- `references/ssrf.md` - Server-side request forgery
- `references/deserialization.md` - Insecure deserialization
- `references/file-security.md` - File upload and path traversal
- `references/modern-threats.md` - Prototype pollution, WebSocket, LLM injection
- `references/csrf.md` - Cross-site request forgery
- `references/api-security.md` - Mass assignment, GraphQL
- `references/business-logic.md` - Race conditions, workflow bypass
