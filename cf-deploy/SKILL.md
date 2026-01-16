---
name: cf-deploy
description: |
  Deploy applications to Cloudflare Workers, Containers, and Sandbox environments.
  Use this skill when:
  (1) Deploying Workers with Durable Objects or Containers
  (2) Setting up Cloudflare Sandbox for isolated code execution
  (3) Configuring wrangler.toml for complex deployments
  (4) Integrating Claude Agent SDK with Sandbox isolation
  (5) Troubleshooting Cloudflare deployment issues
  (6) Setting up MCP servers on Cloudflare
  Triggers: "deploy to cloudflare", "cf deploy", "sandbox deployment", "wrangler config", "containers setup"
---

# Cloudflare Deployment

Deploy Workers, Containers, and Sandbox environments on Cloudflare's edge network.

## Architecture Patterns

```
Pattern A: Worker only
  Request → Worker

Pattern B: Worker + Container
  Request → Worker → Durable Object → Container (port 8080)

Pattern C: Worker + Container + Sandbox (Claude Agent SDK)
  Request → Worker → Container → Sandbox (isolated code execution)
                         ↓
                    MCP Server (external URL)
```

## Quick Reference

| Task | Command |
|------|---------|
| Deploy | `npx wrangler deploy` |
| Logs | `npx wrangler tail <name>` |
| Set secret | `npx wrangler secret put NAME` |
| List containers | `npx wrangler containers list` |

## wrangler.toml Templates

### Basic Worker + Container

```toml
name = "my-app"
main = "src/worker.js"
compatibility_flags = ["nodejs_compat"]
workers_dev = true  # Required for container access

[[containers]]
class_name = "MyContainer"
image = "./Dockerfile"
max_instances = 5
instance_type = "basic"

[durable_objects]
bindings = [
  { name = "MY_CONTAINER", class_name = "MyContainer" }
]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["MyContainer"]

[vars]
NODE_ENV = "production"
PORT = "8080"
```

### Worker + Container + Sandbox

```toml
name = "my-app-with-sandbox"
main = "src/worker.js"
compatibility_flags = ["nodejs_compat"]
workers_dev = true

# Main container
[[containers]]
class_name = "AppContainer"
image = "./Dockerfile"
max_instances = 5
instance_type = "basic"

# Sandbox container (isolated execution)
[[containers]]
class_name = "Sandbox"
image = "./Dockerfile.sandbox"
max_instances = 3
instance_type = "basic"

[durable_objects]
bindings = [
  { name = "APP_CONTAINER", class_name = "AppContainer" },
  { name = "Sandbox", class_name = "Sandbox" }  # Must be "Sandbox"
]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["AppContainer"]

[[migrations]]
tag = "v2"
new_sqlite_classes = ["Sandbox"]

[limits]
cpu_ms = 300000  # 5min for sandbox cold starts
```

## Worker Code Pattern

```javascript
import { Container } from '@cloudflare/containers'

export class MyContainer extends Container {
  defaultPort = 8080
  sleepAfter = '10m'
  enableInternet = true
}

export default {
  async fetch(request, env) {
    const instance = env.MY_CONTAINER.getByName('default')

    // CRITICAL: Worker secrets must be passed manually
    await instance.startAndWaitForPorts({
      startOptions: {
        envVars: {
          SUPABASE_URL: env.SUPABASE_URL,
          SUPABASE_KEY: env.SUPABASE_KEY,
          ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
        },
      },
    })

    return instance.fetch(request)
  },
}
```

## Critical Rules

1. **Secrets don't auto-pass**: Worker secrets require manual `envVars` in `startAndWaitForPorts()`
2. **Single port**: Containers only expose port 8080; integrate all services on one port
3. **Sandbox binding name**: Must be exactly `Sandbox` for SDK compatibility
4. **Migration tags**: Increment for each new Durable Object class
5. **workers_dev**: Set `true` to avoid Error 1042 (Worker-to-Worker fetch)
6. **CPU limits**: Set `cpu_ms = 300000` for Sandbox cold starts

## Detailed References

- **Container deployment**: See [references/containers.md](references/containers.md)
- **Sandbox SDK setup**: See [references/sandbox.md](references/sandbox.md)
- **Troubleshooting**: See [references/pitfalls.md](references/pitfalls.md)
