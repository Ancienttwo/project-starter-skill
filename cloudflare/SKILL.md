---
name: cloudflare
description: Load Cloudflare skill and get contextual guidance for your task
---

# Cloudflare Skill Router

This skill helps you select the right Cloudflare-specific skill based on your task.

## Available Skills

| Skill | Load When | Trigger Examples |
|-------|-----------|------------------|
| `wrangler` | CLI commands, resource management (KV/R2/D1/Vectorize/Queues) | "create a D1 database", "deploy worker", "wrangler commands" |
| `durable-objects` | Building stateful coordination, DO patterns, SQLite storage | "create a Durable Object", "DO best practices", "websocket room" |
| `agents-sdk` | SDK reference for Agent/AIChatAgent, quick patterns | "agents sdk api", "setState", "@callable", "Code Mode" |
| `building-ai-agent-on-cloudflare` | Full agent tutorial with lifecycle, client integration | "build an agent from scratch", "agent tutorial", "WebSocket agent" |
| `building-mcp-server-on-cloudflare` | MCP servers, tools, OAuth authentication | "build MCP server", "MCP tools", "OAuth for MCP" |
| `cf-deploy` | Deployment architecture, Containers, Sandbox setup | "deploy to cloudflare", "container setup", "sandbox isolation" |

## Decision Tree

```
User wants to...
├─ Run wrangler commands / manage resources
│   └─ Load: wrangler
│
├─ Build stateful coordination (chat room, game, booking)
│   └─ Load: durable-objects
│
├─ Build AI agent
│   ├─ Need SDK API reference / quick patterns
│   │   └─ Load: agents-sdk
│   └─ Need full tutorial / lifecycle / client integration
│       └─ Load: building-ai-agent-on-cloudflare
│
├─ Build MCP server with tools
│   └─ Load: building-mcp-server-on-cloudflare
│
├─ Deploy Workers/Containers/Sandbox
│   └─ Load: cf-deploy
│
└─ Multiple concerns?
    └─ Load multiple skills as needed
```

## Skill Details

### wrangler
**Use for**: CLI reference, resource creation/management
- Workers deployment commands
- KV, R2, D1, Vectorize, Hyperdrive management
- Secrets, environments, configuration
- Local development (`wrangler dev`)
- Troubleshooting deployment issues

### durable-objects
**Use for**: Low-level DO implementation
- DurableObject class patterns
- SQLite storage, KV storage
- Alarms and scheduled work per entity
- WebSocket handling in DO
- Testing with Vitest
- Sharding strategies

### agents-sdk
**Use for**: SDK API reference, concise patterns
- Agent and AIChatAgent class APIs
- State management (`this.state`, `this.setState()`)
- Scheduling (`this.schedule()`, cron)
- RPC methods (`@callable`)
- Code Mode for token optimization
- Quick reference tables

### building-ai-agent-on-cloudflare
**Use for**: Complete agent tutorial
- Full agent lifecycle (onConnect, onMessage, onClose)
- Client integration (React hooks, vanilla JS)
- SQL storage patterns
- Scheduled tasks examples
- Common patterns (RAG, tool calling, human-in-the-loop)
- Troubleshooting guide

### building-mcp-server-on-cloudflare
**Use for**: MCP protocol servers
- Tool definition with Zod schemas
- OAuth provider setup (GitHub, Google, etc.)
- McpAgent class
- SSE endpoints
- Client configuration (Claude Desktop)

### cf-deploy
**Use for**: Deployment architecture
- Worker + Container patterns
- Sandbox isolation for code execution
- wrangler.toml templates
- Secret passing to containers
- Troubleshooting deployment errors

## Instructions

After reading this skill:

1. **Identify the user's primary need** from the decision tree above
2. **Load the appropriate skill(s)** using `mcp_skill`
3. **If multiple skills needed**, load them in order of relevance

Example: User wants to "build a chat agent and deploy it"
- Primary: `agents-sdk` (building the agent)
- Secondary: `cf-deploy` (deployment architecture)
