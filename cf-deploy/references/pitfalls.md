# Cloudflare Deployment Pitfalls

Common issues and solutions when deploying to Cloudflare Workers, Containers, and Sandbox.

## Table of Contents

1. [Quick Diagnosis Checklist](#quick-diagnosis-checklist)
2. [Worker Errors](#worker-errors)
3. [Container Errors](#container-errors)
4. [Sandbox Errors](#sandbox-errors)
5. [Docker/Build Errors](#dockerbuild-errors)
6. [Claude Agent SDK Errors](#claude-agent-sdk-errors)

## Quick Diagnosis Checklist

Deploy not working? Check in order:

| # | Check | Command/Method |
|---|-------|----------------|
| 1 | Worker deployed? | `curl https://your-worker.dev/health` |
| 2 | Bindings exist? | Check response for `"Sandbox": "set"` |
| 3 | Container built? | Check `wrangler deploy` output |
| 4 | Python installed? | `sandbox.exec('python3 --version')` |
| 5 | Logs show errors? | `wrangler tail <worker-name>` |
| 6 | CPU limit set? | Confirm `cpu_ms = 300000` in wrangler.toml |

## Worker Errors

### Error 1042: Worker-to-Worker Fetch Limit

**Symptom:**
```
Error 1042: The worker could not route the request
```

**Cause:** Missing `workers_dev = true` in wrangler.toml.

**Fix:**
```toml
# wrangler.toml
workers_dev = true  # Add this line
```

---

### Sandbox Binding Not Available

**Symptom:**
```
Error: Sandbox binding not available
```

**Cause:** Wrong binding name or missing export.

**Fix:**
```javascript
// src/worker.js
import { Sandbox } from '@cloudflare/sandbox'
export { Sandbox }  // MUST re-export!
```

```toml
# wrangler.toml - binding name MUST be "Sandbox"
[durable_objects]
bindings = [
  { name = "Sandbox", class_name = "Sandbox" }  # Not "SANDBOX"
]
```

---

### Worker Exceeded CPU Time Limit

**Symptom:**
```
{"error": "Worker exceeded CPU time limit"}
```

**Cause:** Sandbox cold start takes too long (5-60 seconds).

**Fix:**
```toml
# wrangler.toml
[limits]
cpu_ms = 300000  # 5 minutes
```

---

### Migration Failed: Tag Already Exists

**Symptom:**
```
Migration failed: tag already exists
```

**Cause:** Reusing same migration tag.

**Fix:**
```toml
# Increment tag for new classes
[[migrations]]
tag = "v1"
new_sqlite_classes = ["AppContainer"]

[[migrations]]
tag = "v2"  # Use v2, v3, etc.
new_sqlite_classes = ["Sandbox"]
```

## Container Errors

### Container Not Running

**Symptom:**
```
Error: Container not running
```

**Cause:** Container failed to start, check Dockerfile.

**Fix:**
```bash
# Check logs
wrangler tail <worker-name>

# Common causes:
# - Missing CMD in Dockerfile
# - App not listening on port 8080
# - Missing dependencies
```

---

### Not Listening on Port

**Symptom:**
```
Error: Not listening on expected port
```

**Cause:** App not binding to correct port.

**Fix:**
```javascript
// App must listen on 0.0.0.0:8080
app.listen(8080, '0.0.0.0', () => {
  console.log('Server running on port 8080')
})
```

---

### Secrets Not Available in Container

**Symptom:** Environment variables undefined in container.

**Cause:** Worker secrets don't auto-pass to Container.

**Fix:**
```javascript
// Worker must explicitly pass secrets
await instance.startAndWaitForPorts({
  startOptions: {
    envVars: {
      API_KEY: env.API_KEY,  // Manual pass-through
      DATABASE_URL: env.DATABASE_URL,
    },
  },
})
```

## Sandbox Errors

### HTTP Error 500 on Sandbox

**Symptom:**
```
SandboxError: HTTP error! status: 500
Error checking if container is ready: The operation was aborted
```

**Cause:** Concurrent sandbox operations on same identity.

**Fix:**
```javascript
// Use serial execution
// ❌ Wrong: Parallel
await Promise.all([
  sandbox.exec('cmd1'),
  sandbox.exec('cmd2'),
])

// ✅ Correct: Serial
await sandbox.exec('cmd1')
await sandbox.exec('cmd2')
```

---

### Python Output Empty

**Symptom:**
```json
{"success": true, "stdout": "", "exitCode": 0}
```

**Cause:** Python stdout buffering.

**Fix:**
```javascript
// Use -u flag
await sandbox.exec('python3 -u -c "print(\'hello\')"')

// Or set environment variable
await sandbox.exec('PYTHONUNBUFFERED=1 python3 script.py')
```

---

### apk: not found

**Symptom:**
```
/bin/sh: 1: apk: not found
```

**Cause:** Sandbox base image is Ubuntu, not Alpine.

**Fix:**
```dockerfile
# ❌ Wrong - Alpine commands
RUN apk add --no-cache python3

# ✅ Correct - Ubuntu commands
RUN apt-get update && apt-get install -y python3
```

## Docker/Build Errors

### Unauthorized / Registry Auth

**Symptom:**
```
Unauthorized
Error saving credentials: error storing credentials
```

**Cause:** Docker registry auth expired.

**Fix:**
```bash
# Re-login
wrangler login

# Or just retry deploy (auto-reauth)
wrangler deploy
```

---

### Docker Desktop Hang

**Symptom:** Docker commands hang indefinitely.

**Cause:** Docker Desktop resource exhaustion.

**Fix:**
```bash
# Restart Docker
killall Docker
sleep 3
open -a Docker
sleep 15

# Clean up
docker builder prune --all -f
docker system prune -f

# Retry
wrangler deploy
```

---

### Build Context Too Large

**Symptom:** Slow builds, large image size.

**Fix:**
```dockerfile
# Add .dockerignore
node_modules/
.git/
*.log
dist/
coverage/
.env*
```

## Claude Agent SDK Errors

### Cannot Use --dangerously-skip-permissions with Root

**Symptom:**
```
Error: --dangerously-skip-permissions cannot be used with root/sudo privileges
```

**Cause:** Running as root user.

**Fix:**
```dockerfile
# Create non-root user in Dockerfile
RUN useradd -m -s /bin/bash claude
```

```javascript
// Execute as non-root
await sandbox.exec('su -s /bin/bash claude -c "node runner.mjs"')
```

---

### Invalid API Key / Fix External API Key

**Symptom:**
```
Invalid API key · Fix external API key
```

**Cause:** `su` drops environment variables.

**Fix:**
```javascript
// Write API key to config file instead
const config = {
  anthropicApiKey: env.ANTHROPIC_API_KEY,
  // ... other config
}
await sandbox.writeFile('/workspace/agent-config.json', JSON.stringify(config))

// runner.mjs reads from file
const config = JSON.parse(readFileSync('agent-config.json'))
const apiKey = config.anthropicApiKey
```

---

### MCP Tools Not Connecting

**Symptom:** MCP tool calls fail from sandbox.

**Cause:** localhost inside sandbox != container localhost.

**Fix:**
```javascript
// Rewrite MCP URLs to external addresses
function rewriteMcpUrls(servers, externalUrl) {
  const result = {}
  for (const [name, config] of Object.entries(servers)) {
    result[name] = {
      ...config,
      url: config.url.replace('http://localhost:8080', externalUrl)
    }
  }
  return result
}

// Usage
const mcpConfig = rewriteMcpUrls(
  originalConfig.mcp.servers,
  'https://app.example.com'  // External URL
)
```

---

### Seat ID Required

**Symptom:**
```
MCP error: seat_id is required
```

**Cause:** System prompt missing seat context.

**Fix:**
```javascript
// Include seat ID in system prompt
const systemPrompt = `${originalPrompt}

Seat ID: ${seatId}
Company: ${companyName}
`
```

---

### Only See "Exited with Code 1"

**Symptom:** No error details, just exit code.

**Cause:** Not capturing stderr.

**Fix:**
```javascript
// Capture both stdout and stderr
const result = await sandbox.exec('node runner.mjs', {
  onOutput: (data) => {
    if (data.stdout) console.log('stdout:', data.stdout)
    if (data.stderr) console.error('stderr:', data.stderr)
  }
})

// Result includes both
console.log('stdout:', result.stdout)
console.log('stderr:', result.stderr)
```

## Emergency Rollback

```bash
# Disable sandbox immediately
wrangler secret put SANDBOX_ENABLED --value "false"

# Or set rollout to 0%
wrangler secret put SANDBOX_ROLLOUT_PERCENTAGE --value "0"

# Redeploy previous version
git checkout <previous-commit>
wrangler deploy
```
