---
name: agent-ui
description: |
  Build real-time AI agent interfaces with streaming tool calls, turn-based 
  conversations, and smart response buffering. Covers both AG-UI protocol (industry 
  standard) and custom implementation patterns.
  
  Use when: (1) Building UI for AI agents with tool use, (2) Implementing streaming 
  responses with tool visualization, (3) Choosing between AG-UI vs custom approach,
  (4) Integrating assistant-ui or custom components, (5) WebSocket/SSE transport decisions.
  
  Triggers: "agent UI", "streaming tool calls", "turn-based chat", "AG-UI", "assistant-ui",
  "CopilotKit", "frontend tool calls", "WebSocket chat", "SSE streaming", "tool visualization",
  "local agent", "web agent", "messenger agent", "headless agent", "whatsapp agent"
---

# Agent UI Skill

Build real-time AI agent interfaces. Two approaches:

| Approach | Best For | Ecosystem |
|----------|----------|-----------|
| **AG-UI Protocol** | Most projects, teams, WebSocket | Microsoft, Google, LangChain |
| **Custom (craft-agents)** | Full control, learning | Anthropic craft-agents |

## Quick Decision

```
Need agent UI?
├─ Want fastest path ──────────► AG-UI + assistant-ui (Part 1)
├─ Need WebSocket + other features ► AG-UI over WebSocket (Part 1)
├─ Need full control ──────────► Custom patterns (Part 3)
├─ Migrating existing code ────► Event Mapping (Part 2)
└─ Specific scenario? ─────────► See scenario-recommendations.md
```

**Scenario Quick Reference**: [scenario-recommendations.md](reference/scenario-recommendations.md)
- Structured Report UI (命理分析) → SSE + Vercel AI SDK
- Office AI Agent (本地办公) → AG-UI or craft-agents
- Messenger Agent (WhatsApp) → Headless, conversational auth
- Spreadsheet Agent (Financial Model) → WebSocket + AG-UI + Frontend Tool Calls

---

## Part 1: AG-UI Protocol (Recommended)

AG-UI is the emerging standard for AI agent ↔ frontend communication.

**Adopters**: Microsoft Agent Framework, Google ADK, LangChain, Vercel AI SDK, CopilotKit

**Best for**: B2B SaaS, Internal Tools, Data Dashboards, Enterprise Copilots. See [ag-ui-best-practices.md](reference/ag-ui-best-practices.md) for detailed product recommendations.

### Core Event Types

```typescript
// Lifecycle
RUN_STARTED → RUN_FINISHED | RUN_ERROR

// Text streaming
TEXT_MESSAGE_START → TEXT_MESSAGE_CONTENT* → TEXT_MESSAGE_END

// Tool calls
TOOL_CALL_START → TOOL_CALL_ARGS* → TOOL_CALL_END → TOOL_CALL_RESULT

// State sync
STATE_SNAPSHOT | STATE_DELTA
```

### Fastest Path: assistant-ui

```bash
npm install @assistant-ui/react @assistant-ui/react-ai-sdk
```

```tsx
import { AssistantRuntimeProvider, Thread } from "@assistant-ui/react";
import { useVercelAIRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat } from "ai/react";

function Chat() {
  const chat = useChat({ api: "/api/agent" });
  const runtime = useVercelAIRuntime(chat);
  
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
```

### WebSocket with AG-UI

For unified WebSocket (chat + other features like SpreadJS):

```typescript
// Server: emit AG-UI events over WebSocket
ws.send(JSON.stringify({
  type: "TEXT_MESSAGE_CONTENT",
  content: "Hello",
  messageId: "msg_1"
}));

// Client: AG-UI client handles event routing
import { AGUIClient } from "@ag-ui/client";
const client = new AGUIClient({ transport: "websocket", url: "ws://..." });
```

### Frontend Tool Calls

AG-UI allows agents to trigger frontend actions:

```typescript
// Agent sends tool call to frontend
{ type: "TOOL_CALL_START", name: "navigate", callId: "tc_1" }
{ type: "TOOL_CALL_ARGS", callId: "tc_1", args: { path: "/dashboard" } }

// Frontend executes and responds
{ type: "TOOL_CALL_RESULT", callId: "tc_1", result: { success: true } }
```

---

## Part 2: Event Mapping (AG-UI ↔ Custom)

| AG-UI Standard | craft-agents Custom | Notes |
|----------------|---------------------|-------|
| `RUN_STARTED` | (session start) | AG-UI explicit lifecycle |
| `TEXT_MESSAGE_CONTENT` | `text_delta` | 1:1 mapping |
| `TEXT_MESSAGE_END` | `text_complete` | 1:1 mapping |
| `TOOL_CALL_START` | `tool_start` | 1:1 mapping |
| `TOOL_CALL_ARGS` | (embedded in tool_start) | AG-UI streams args separately |
| `TOOL_CALL_RESULT` | `tool_result` | 1:1 mapping |
| `STATE_SNAPSHOT` | Jotai atom sync | AG-UI manages state |
| `RUN_FINISHED` | `complete` | 1:1 mapping |
| `RUN_ERROR` | `error` | 1:1 mapping |

### Interop: Wrap Custom in AG-UI

```typescript
// Adapter: craft-agents events → AG-UI events
function toAGUI(event: CraftEvent): AGUIEvent {
  switch (event.type) {
    case 'text_delta': 
      return { type: 'TEXT_MESSAGE_CONTENT', content: event.delta };
    case 'tool_start':
      return { type: 'TOOL_CALL_START', name: event.toolName, callId: event.toolUseId };
    // ...
  }
}
```

---

## Part 3: Custom Implementation (Advanced)

Use these patterns when you need full control over state management, custom transports, or want to understand streaming internals.

> **Note**: These patterns map 1:1 to AG-UI events. See mapping table above.

### Architecture Overview

```
SDK Events → Pure Event Processor → Jotai Atoms → Turn Grouping → React Components
```

```
┌─────────────────────────────────────────────────────────────────┐
│                        Data Flow                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  text_delta      processEvent()      sessionAtomFamily(id)      │
│  tool_start  ──► ─────────────── ──► ──────────────────────     │
│  tool_result     Pure function       Per-session isolation      │
│  complete        No side effects     Automatic GC               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  messages[]      groupMessagesByTurn()      TurnCard            │
│  ────────────►   ──────────────────────  ►  ├── ActivityRow     │
│                  Flat → Hierarchical        ├── ResponseCard    │
│                  Parent-child nesting       └── TodoList        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Core Patterns

| Pattern | Purpose | Reference |
|---------|---------|-----------|
| **Pure Event Processing** | Testable, predictable state transitions | [event-types.md](reference/event-types.md) |
| **Turn Lifecycle** | State machine with "awaiting" phase | [turn-lifecycle.md](reference/turn-lifecycle.md) |
| **Jotai atomFamily** | Per-session isolation, no cross-render | [jotai-patterns.md](reference/jotai-patterns.md) |
| **Tool Routing** | Type-safe overlay selection | [tool-routing.md](reference/tool-routing.md) |
| **Smart Buffering** | Wait for meaningful content | [response-buffering.md](reference/response-buffering.md) |

## When to Use Each Pattern

| Need | Pattern | Reference |
|------|---------|-----------|
| Single session, simple chat | React state only | [minimal-setup.tsx](assets/templates/minimal-setup.tsx) |
| Multi-session, prevent re-render | Jotai atomFamily | [jotai-patterns.md](reference/jotai-patterns.md) |
| Custom tool visualization | Overlay routing | [tool-routing.md](reference/tool-routing.md) |
| Reduce text flicker | Smart buffering | [response-buffering.md](reference/response-buffering.md) |
| Nested subagents | Parent tracking | [turn-lifecycle.md](reference/turn-lifecycle.md) |

## Quick Start

```bash
# 1. Install dependencies
npm install jotai shiki react-markdown tailwindcss

# 2. Copy production starter-kit (recommended)
cp -r ~/.claude/skills/agent-ui/assets/starter-kit/* ./src/agent-ui/

# 3. Or copy minimal template only
cp ~/.claude/skills/agent-ui/assets/templates/minimal-setup.tsx ./src/components/Chat.tsx
```

See [assets/starter-kit/README.md](assets/starter-kit/README.md) for file index and customization points.

### Full Integration Example

```typescript
import { TurnCard, groupMessagesByTurn } from '@craft-agent/ui'
import { Provider as JotaiProvider } from 'jotai'
import { sessionAtomFamily } from './atoms/sessions'

function App() {
  return (
    <JotaiProvider>
      <ChatDisplay sessionId={activeSessionId} />
    </JotaiProvider>
  )
}

function ChatDisplay({ sessionId }) {
  const session = useAtomValue(sessionAtomFamily(sessionId))
  const turns = groupMessagesByTurn(session.messages)
  
  return turns.map(turn => 
    turn.type === 'assistant' 
      ? <TurnCard key={turn.turnId} {...turn} />
      : <UserMessage key={turn.message.id} {...turn} />
  )
}
```

For templates, see:
- [assets/templates/minimal-setup.tsx](assets/templates/minimal-setup.tsx) - Minimal working example
- [assets/templates/custom-overlay.tsx](assets/templates/custom-overlay.tsx) - Add new tool overlay
- [assets/templates/tool-parser.ts](assets/templates/tool-parser.ts) - Add new tool parser

## Key Components

| Component | Purpose |
|-----------|---------|
| `TurnCard` | Main turn rendering with activities and response |
| `ActivityRow` | Single tool/thinking activity display |
| `ResponseCard` | Buffered streaming response |
| `CodePreviewOverlay` | File content with syntax highlighting |
| `DiffPreviewOverlay` | Side-by-side code diff |
| `TerminalPreviewOverlay` | Bash/Grep/Glob output |
| `JSONPreviewOverlay` | Interactive JSON tree |

## Patterns Worth Adopting

### 1. Pure Event Processing
Side effects are returned, not executed. Enables testing, debugging, and event replay.

### 2. Streaming Priority
During streaming, atom is source of truth—never overwrite with stale React state. Check `isProcessing` before sync.

### 3. The "Awaiting" Phase
After tool completes, show "Thinking..." until model decides next action. Prevents UI "disappearing".

### 4. Graceful Degradation
If Jotai unavailable, fall back to React state. If animations disabled, use static rendering.

## Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Token-by-token rendering | Flicker, poor UX | Use smart buffering (MIN_WORDS: 40) |
| Overwriting streaming atom | Lost streaming data | Check `isProcessing` before sync |
| Missing awaiting phase | Turn card disappears | Derive phase from activities array |
| Wrong atomFamily import | Build error | Use `jotai/utils` not `jotai-family` |
| No parent tracking | Nested tools flat | Use `parentToolUseId` field |

## Dependencies

**Required**: React 18+, Tailwind CSS, Shiki, react-markdown

**Optional**: 
- `jotai` (multi-session isolation)
- `motion` (animations)
- `@radix-ui/react-dialog` (overlays)

## File Structure

```
agent-ui/
├── SKILL.md                    # This file (index)
├── reference/
│   ├── ag-ui-best-practices.md     # Product type recommendations
│   ├── scenario-recommendations.md # 4 detailed scenarios with architecture
│   ├── event-types.md              # AgentEvent type definitions
│   ├── turn-lifecycle.md           # Turn state machine
│   ├── jotai-patterns.md           # State management patterns
│   ├── tool-routing.md             # Tool → Overlay routing
│   └── response-buffering.md       # Smart buffering config
└── assets/
    ├── starter-kit/            # Production code from craft-agents
    │   ├── README.md           # File index & integration guide
    │   ├── event-processor/    # Pure event processing
    │   │   ├── processor.ts
    │   │   ├── types.ts
    │   │   ├── helpers.ts
    │   │   └── handlers/
    │   ├── atoms/
    │   │   └── sessions.ts     # Jotai atomFamily
    │   ├── components/
    │   │   └── turn-utils.ts   # Turn grouping algorithm
    │   └── lib/
    │       └── tool-parsers.ts # Tool result parsing
    └── templates/              # Minimal templates
        ├── minimal-setup.tsx
        ├── custom-overlay.tsx
        └── tool-parser.ts
```

## Agent Modes

Choose your deployment mode based on user interaction requirements:

| Mode | UI | Authorization | Use Case | Components Needed |
|------|-----|---------------|----------|-------------------|
| **Local Agent** | Full Electron UI | Pop-up dialogs | Desktop power users | Full starter-kit |
| **Web Agent** | Browser UI | Pop-up dialogs | Cloud access, no install | Full starter-kit + cf-deploy |
| **Messenger Agent** | None (headless) | Conversational | WhatsApp, Telegram, Slack | event-processor only |

### Local Agent (Electron)

Full-featured desktop application with native filesystem access.

```bash
cp -r ~/.claude/skills/agent-ui/assets/starter-kit/* ./src/
```

- Pop-up authorization
- File overlays, diff viewers
- Multi-session with Jotai atomFamily

### Web Agent (Cloudflare Sandbox)

Browser-based agent with isolated code execution.

```bash
cp -r ~/.claude/skills/agent-ui/assets/starter-kit/* ./src/
# Then use cf-deploy skill for deployment
```

- Pop-up authorization
- No installation required
- Requires Cloudflare setup (see [cf-deploy](~/.claude/skills/cf-deploy/SKILL.md))

### Messenger Agent (Headless)

Text/voice-only interface for messaging platforms. No visual UI.

```bash
# Only need event-processor (no UI components)
cp -r ~/.claude/skills/agent-ui/assets/starter-kit/event-processor ./src/
```

- No pop-up — use conversational confirmation
- No overlays — return text summaries of tool results
- Lightweight, works with WhatsApp, Telegram, Slack

**Authorization pattern**:
```typescript
// Conversational confirmation instead of pop-up
if (event.type === 'permission_request') {
  await sendMessage(chatId, `Claude wants to: ${event.description}\nReply YES to allow`)
}
```

## Related Skills

- [claude-code-best-practices](~/.claude/skills/claude-code-best-practices/SKILL.md) - Project configuration
- [cf-deploy](~/.claude/skills/cf-deploy/SKILL.md) - Cloudflare deployment for Web Agent

## Source Code Reference

| File | Purpose |
|------|---------|
| `packages/ui/src/components/chat/TurnCard.tsx` | Main turn component |
| `packages/ui/src/components/chat/turn-utils.ts` | Turn grouping algorithm |
| `packages/ui/src/lib/tool-parsers.ts` | Tool result parsing |
| `apps/electron/src/renderer/event-processor/` | Event processing |
| `apps/electron/src/renderer/atoms/sessions.ts` | Jotai state |

## Source

Patterns and starter-kit from [craft-agents](https://github.com/anthropics/craft-agents) - Anthropic's open-source AI agent UI.
