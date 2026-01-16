# Cloudflare Containers Reference

## Table of Contents

1. [Architecture](#architecture)
2. [wrangler.toml Configuration](#wranglertoml-configuration)
3. [Worker Code Patterns](#worker-code-patterns)
4. [Dockerfile Best Practices](#dockerfile-best-practices)
5. [Secret Management](#secret-management)
6. [MCP Server Integration](#mcp-server-integration)

## Architecture

### Request Flow

```
┌─────────────────────────────────────────────────────────┐
│                 Cloudflare Workers Platform              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌─────────────────────────────────┐│
│  │   Worker     │───▶│    Durable Object Binding       ││
│  │ (fetch)      │    │    env.MY_CONTAINER             ││
│  └──────────────┘    └───────────┬─────────────────────┘│
│                                   │                      │
│                                   ▼                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Container Instance                      ││
│  │  ┌─────────────────────────────────────────────┐   ││
│  │  │           App Server (port 8080)             │   ││
│  │  │  - HTTP endpoints                            │   ││
│  │  │  - Business logic                            │   ││
│  │  │  - Database connections                      │   ││
│  │  └─────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Container Class Properties

```javascript
import { Container } from '@cloudflare/containers'

export class MyContainer extends Container {
  // Port container listens on (required)
  defaultPort = 8080

  // Sleep after inactivity (optional)
  sleepAfter = '10m'  // '5m', '30m', '1h'

  // Allow outbound internet (optional, default: false)
  enableInternet = true
}
```

## wrangler.toml Configuration

### Complete Configuration

```toml
name = "my-container-app"
main = "src/worker.js"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

# CRITICAL: Enable workers_dev to avoid Error 1042
workers_dev = true

# Container definition
[[containers]]
class_name = "MyContainer"
image = "./Dockerfile"
max_instances = 10
instance_type = "basic"  # "lite" | "basic" | "standard"

# Optional: Build-time variables
image_vars = { NODE_ENV = "production" }

# Optional: Rollout configuration
rollout_active_grace_period = 300  # seconds
rollout_step_percentage = [10, 50, 100]

# Durable Object binding
[durable_objects]
bindings = [
  { name = "MY_CONTAINER", class_name = "MyContainer" }
]

# Migration (required for new DO classes)
[[migrations]]
tag = "v1"
new_sqlite_classes = ["MyContainer"]

# Public variables (non-sensitive)
[vars]
NODE_ENV = "production"
PORT = "8080"
LOG_LEVEL = "info"

# CPU/Memory limits
[limits]
cpu_ms = 300000  # 5 minutes max

# Secrets: Set via `wrangler secret put NAME`
# SUPABASE_URL, SUPABASE_KEY, API_KEY, etc.
```

### Instance Types

| Type | Memory | vCPU | Use Case |
|------|--------|------|----------|
| lite | 128MB | Shared | Simple tasks |
| basic | 256MB | Shared | Most apps |
| standard | 1GB | Dedicated | Heavy workloads |

## Worker Code Patterns

### Basic Pattern

```javascript
import { Container } from '@cloudflare/containers'

export class MyContainer extends Container {
  defaultPort = 8080
  sleepAfter = '10m'
  enableInternet = true
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Health check at Worker level
    if (url.pathname === '/health') {
      return new Response('OK')
    }

    // Get container instance
    const instance = env.MY_CONTAINER.getByName('default')

    // Start with environment variables
    await instance.startAndWaitForPorts({
      startOptions: {
        envVars: {
          // CRITICAL: Secrets must be passed manually
          SUPABASE_URL: env.SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
          ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
          // Public vars
          NODE_ENV: env.NODE_ENV || 'production',
          PORT: '8080',
        },
      },
    })

    // Forward request to container
    return instance.fetch(request)
  },
}
```

### Multi-Container Pattern

```javascript
import { Container } from '@cloudflare/containers'

export class AppContainer extends Container {
  defaultPort = 8080
  sleepAfter = '10m'
  enableInternet = true
}

export class WorkerContainer extends Container {
  defaultPort = 8080
  sleepAfter = '30m'
  enableInternet = false  // No outbound for security
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Route to different containers
    if (url.pathname.startsWith('/api/')) {
      const app = env.APP_CONTAINER.getByName('default')
      await app.startAndWaitForPorts({ startOptions: { envVars: {...} } })
      return app.fetch(request)
    }

    if (url.pathname.startsWith('/worker/')) {
      const worker = env.WORKER_CONTAINER.getByName('default')
      await worker.startAndWaitForPorts({ startOptions: { envVars: {...} } })
      return worker.fetch(request)
    }

    return new Response('Not Found', { status: 404 })
  },
}
```

### Named Instances Pattern

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const seatId = url.searchParams.get('seat_id')

    // Each seat gets dedicated container instance
    const instance = env.MY_CONTAINER.getByName(`seat-${seatId}`)

    await instance.startAndWaitForPorts({
      startOptions: {
        envVars: {
          SEAT_ID: seatId,
          // ... other vars
        },
      },
    })

    return instance.fetch(request)
  },
}
```

## Dockerfile Best Practices

### Node.js Application

```dockerfile
FROM node:20-slim

WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Build if needed
RUN npm run build --if-present

# Create non-root user
RUN useradd -m -s /bin/bash appuser
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["node", "dist/index.js"]
```

### Python Application

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -s /bin/bash appuser
USER appuser

EXPOSE 8080
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

## Secret Management

### Setting Secrets

```bash
# Set individual secret
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ANTHROPIC_API_KEY

# Bulk set from .env file
cat .env | while read line; do
  if [[ ! -z "$line" && ! "$line" =~ ^# ]]; then
    name=$(echo $line | cut -d= -f1)
    value=$(echo $line | cut -d= -f2-)
    echo "$value" | npx wrangler secret put "$name"
  fi
done
```

### Accessing in Container

```javascript
// Worker passes secrets to container
await instance.startAndWaitForPorts({
  startOptions: {
    envVars: {
      // env.SECRET_NAME comes from wrangler secret
      DATABASE_URL: env.DATABASE_URL,
      API_KEY: env.API_KEY,
    },
  },
})
```

```javascript
// Container app reads from process.env
const dbUrl = process.env.DATABASE_URL
const apiKey = process.env.API_KEY
```

## MCP Server Integration

### Problem: Single Port Limitation

Cloudflare Containers only expose port 8080. If you need MCP server + main app:

```
❌ Wrong: Two separate ports
   App:8080 + MCP:8081  → MCP unreachable

✅ Correct: Single port with routing
   Hono Server:8080
     /api/* → Business routes
     /mcp   → MCP handler
```

### Solution: Hono + MCP Integration

```javascript
// src/http_server/create_app.js
import { Hono } from 'hono'
import { mcpHandler } from './mcp_handler.js'

export function createApp() {
  const app = new Hono()

  // Health check
  app.get('/health', (c) => c.json({ status: 'ok' }))

  // Business routes
  app.get('/api/v1/*', apiRoutes)

  // MCP Server (all methods)
  app.all('/mcp', mcpHandler)

  return app
}
```

```javascript
// src/http_server/mcp_handler.js
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { createMcpHandler } from '@hono/mcp'

const server = new McpServer({
  name: 'my-crm-tools',
  version: '1.0.0'
})

// Register tools
server.tool('list_products', schema, async (args) => { ... })
server.tool('create_customer', schema, async (args) => { ... })

export const mcpHandler = createMcpHandler(server, {
  redactedLogging: true,
})
```

### MCP URL Configuration

```yaml
# agent.yaml - MCP server URL
mcp:
  servers:
    my-crm:
      url: "http://localhost:8080/mcp"  # Same port as main app
```
