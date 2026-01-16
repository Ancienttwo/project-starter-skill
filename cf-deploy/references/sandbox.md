# Cloudflare Sandbox SDK Reference

## Table of Contents

1. [Architecture](#architecture)
2. [wrangler.toml Configuration](#wranglertoml-configuration)
3. [Sandbox API](#sandbox-api)
4. [Claude Agent SDK Integration](#claude-agent-sdk-integration)
5. [Security Model](#security-model)
6. [Dockerfile.sandbox Template](#dockerfilesandbox-template)

## Architecture

### Sandbox Execution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Request Flow with Sandbox                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Container (port 8080)                                              │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Hono HTTP Server                                            │   │
│   │    /webhook → Business Logic                                 │   │
│   │    /mcp     → MCP Server (45+ tools) ←─────────────────┐    │   │
│   │                                                          │    │   │
│   │  claude_agent_sdk_service.js                            │    │   │
│   │    1. Receive message                                    │    │   │
│   │    2. rewriteMcpUrlsForSandbox()                        │    │   │
│   │    3. POST /internal/sandbox/claude-agent               │    │   │
│   └──────────────────────────────────────┬──────────────────┘   │
│                                           │                       │
│                                           ▼                       │
│   Worker                                                          │
│   ┌─────────────────────────────────────────────────────────────┐ │
│   │  handleClaudeAgentSandbox():                                 │ │
│   │    1. getSandbox(env.Sandbox, `agent-${seatId}`)            │ │
│   │    2. sandbox.writeFile('/workspace/agent-config.json')     │ │
│   │    3. sandbox.writeFile('/workspace/agent-prompt.txt')      │ │
│   │    4. sandbox.exec('su -s /bin/bash claude -c "node..."')   │ │
│   │    5. Stream stdout + stderr back                            │ │
│   └──────────────────────────────────────┬──────────────────────┘ │
│                                           │                       │
│                                           ▼                       │
│   Sandbox (isolated container)                                    │
│   ┌─────────────────────────────────────────────────────────────┐ │
│   │  runner.mjs (as 'claude' user):                              │ │
│   │    - Read config from file (not env vars)                   │ │
│   │    - import { query } from '@anthropic-ai/claude-agent-sdk' │ │
│   │    - query({ prompt, options })                              │ │
│   │    - MCP calls → external URL (https://app.example.com/mcp) │ │
│   └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## wrangler.toml Configuration

```toml
name = "my-app-with-sandbox"
main = "src/worker.js"
compatibility_flags = ["nodejs_compat"]
workers_dev = true

# Main application container
[[containers]]
class_name = "AppContainer"
image = "./Dockerfile"
max_instances = 5
instance_type = "basic"

# Sandbox container - MUST be named "Sandbox"
[[containers]]
class_name = "Sandbox"
image = "./Dockerfile.sandbox"
max_instances = 3
instance_type = "basic"

# Durable Object bindings
[durable_objects]
bindings = [
  { name = "APP_CONTAINER", class_name = "AppContainer" },
  { name = "Sandbox", class_name = "Sandbox" }  # MUST be "Sandbox"
]

# Migrations - increment tag for new classes
[[migrations]]
tag = "v1"
new_sqlite_classes = ["AppContainer"]

[[migrations]]
tag = "v2"
new_sqlite_classes = ["Sandbox"]

# Extended CPU limit for sandbox cold starts
[limits]
cpu_ms = 300000  # 5 minutes
```

## Sandbox API

### Basic Usage

```javascript
import { getSandbox, Sandbox } from '@cloudflare/sandbox'

// CRITICAL: Must re-export Sandbox class
export { Sandbox }

// Get sandbox instance by identity
const sandbox = getSandbox(env.Sandbox, 'my-sandbox-id')

// Execute command
const result = await sandbox.exec('python3 -c "print(2+2)"')
// result: { stdout: '4\n', stderr: '', exitCode: 0 }

// File operations
await sandbox.writeFile('/workspace/data.json', '{"key": "value"}')
const file = await sandbox.readFile('/workspace/data.json')

// With timeout
const result = await sandbox.exec('long-running-command', {
  timeout: 30000  // 30 seconds
})
```

### Sandbox Options

```javascript
const sandbox = getSandbox(env.Sandbox, 'sandbox-id', {
  keepAlive: 30 * 60 * 1000,  // 30 minutes TTL
})
```

### Stream Output

```javascript
const result = await sandbox.exec('python3 script.py', {
  onOutput: (data) => {
    // Called for each chunk of stdout/stderr
    console.log(data.stdout || data.stderr)
  }
})
```

## Claude Agent SDK Integration

### The 6 Critical Pitfalls

| # | Problem | Solution |
|---|---------|----------|
| 1 | Root user rejected | Create `claude` user, use `su -s /bin/bash claude -c "..."` |
| 2 | API Key lost on `su` | Write to config file, not env vars |
| 3 | MCP localhost unreachable | Rewrite URLs to external addresses |
| 4 | Error messages lost | Capture both stdout AND stderr |
| 5 | Permission prompts | `permissionMode: bypassPermissions` + `allowDangerouslySkipPermissions: true` |
| 6 | Missing Seat ID | Include in system prompt |

### Worker Handler

```javascript
// src/worker.js
import { getSandbox, Sandbox } from '@cloudflare/sandbox'

export { Sandbox }  // MUST re-export

export async function handleClaudeAgentSandbox(request, env) {
  const { seatId, prompt, systemPrompt, mcpServers } = await request.json()

  const sandbox = getSandbox(env.Sandbox, `claude-agent-${seatId}`)

  // 1. Write config file (API key from file, not env)
  const config = {
    model: 'claude-sonnet-4-5',
    anthropicApiKey: env.ANTHROPIC_API_KEY,
    permissionMode: 'bypassPermissions',
    systemPrompt: `${systemPrompt}\n\nSeat ID: ${seatId}`,
    mcpServers: rewriteMcpUrls(mcpServers, env.MCP_EXTERNAL_URL),
    tools: ['Read', 'Grep', 'Skill'],
  }

  await sandbox.writeFile('/workspace/agent-config.json', JSON.stringify(config))
  await sandbox.writeFile('/workspace/agent-prompt.txt', prompt)

  // 2. Execute as non-root user
  const result = await sandbox.exec(
    'su -s /bin/bash claude -c "node /workspace/claude-agent/runner.mjs"',
    {
      timeout: 120000,  // 2 minutes
      onOutput: (data) => {
        // Stream both stdout and stderr
        if (data.stdout) console.log(data.stdout)
        if (data.stderr) console.error(data.stderr)
      }
    }
  )

  return new Response(JSON.stringify({
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

function rewriteMcpUrls(mcpServers, externalUrl) {
  const rewritten = {}
  for (const [name, config] of Object.entries(mcpServers)) {
    rewritten[name] = {
      ...config,
      url: config.url.replace('http://localhost:8080', externalUrl)
    }
  }
  return rewritten
}
```

### Sandbox Runner Script

```javascript
// sandbox/claude-agent/runner.mjs
import { readFileSync } from 'fs'
import { query } from '@anthropic-ai/claude-agent-sdk'

const config = JSON.parse(readFileSync('/workspace/agent-config.json', 'utf-8'))
const prompt = readFileSync('/workspace/agent-prompt.txt', 'utf-8')

const options = {
  model: config.model || 'claude-sonnet-4-5',
  permissionMode: config.permissionMode || 'default',
  allowedTools: config.tools || ['Read', 'Grep'],
  workingDirectory: '/workspace',
  systemPrompt: config.systemPrompt,
  mcpServers: config.mcpServers,
  env: {
    ...process.env,
    ANTHROPIC_API_KEY: config.anthropicApiKey,  // From file, not env
  },
}

// CRITICAL for bypassPermissions mode
if (options.permissionMode === 'bypassPermissions') {
  options.allowDangerouslySkipPermissions = true
}

try {
  const stream = query({ prompt, options })
  for await (const message of stream) {
    console.log(JSON.stringify(message))
  }
} catch (error) {
  console.error('Agent error:', error.message)
  process.exit(1)
}
```

### Container Service (MCP URL Rewriting)

```javascript
// src/llm_service/claude_agent_sdk_service.js

export function rewriteMcpUrlsForSandbox(mcpConfig, externalBaseUrl) {
  if (!mcpConfig?.servers) return mcpConfig

  const rewritten = { ...mcpConfig, servers: {} }

  for (const [name, server] of Object.entries(mcpConfig.servers)) {
    rewritten.servers[name] = {
      ...server,
      url: server.url
        .replace('http://localhost:8080', externalBaseUrl)
        .replace('http://127.0.0.1:8080', externalBaseUrl)
    }
  }

  return rewritten
}

// Usage
const mcpExternal = rewriteMcpUrlsForSandbox(
  agentConfig.mcp,
  'https://app.salesko.ai'  // External URL accessible from Sandbox
)
```

## Security Model

### Sandbox Isolation

```yaml
Sandbox Security Defaults:
  network: off           # No outbound by default
  secrets: none          # Never pass long-term tokens
  user: non-root         # Claude user, not root
  execution: serial      # One exec per sandbox at a time
```

### Recommended Security Configuration

```yaml
# agent.yaml
sandbox:
  enabled: true

  defaults:
    network: off
    secrets: none
    execution_model: serial

  limits:
    timeout_ms: 30000
    memory_mb: 256
    max_output_bytes: 1048576
    max_stderr_bytes: 10240

  quota:
    daily_exec_seconds: 300
    daily_exec_count: 100
```

### MCP AuthN/AuthZ (Production)

```javascript
// Sign MCP requests from Sandbox
import jwt from 'jsonwebtoken'

function signMcpRequest(seatId, secret) {
  return jwt.sign(
    { seat_id: seatId, iat: Date.now() },
    secret,
    { expiresIn: '5m' }
  )
}

// MCP server validates
app.use('/mcp', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, MCP_SECRET)
    c.set('seatId', decoded.seat_id)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})
```

## Dockerfile.sandbox Template

```dockerfile
# Cloudflare Sandbox container
# Base: Ubuntu Jammy (NOT Alpine!)
FROM docker.io/cloudflare/sandbox:0.6.7

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3 /usr/bin/python

# CRITICAL: Create non-root user for Claude Agent SDK
RUN useradd -m -s /bin/bash claude

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code

# Copy runner script
COPY sandbox/claude-agent/ /workspace/claude-agent/

# Set ownership
RUN chown -R claude:claude /workspace

WORKDIR /workspace
EXPOSE 8080
```

### Important Notes

1. **Base Image**: `cloudflare/sandbox` is Ubuntu Jammy, NOT Alpine. Use `apt-get`, not `apk`.

2. **Non-root User**: Claude Agent SDK refuses to run as root. Create `claude` user.

3. **Execution**: Use `su -s /bin/bash claude -c "..."` to run as non-root.

4. **Python Buffering**: Use `python3 -u` or `PYTHONUNBUFFERED=1` to avoid empty stdout.
