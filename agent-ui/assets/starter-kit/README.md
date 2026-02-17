# Agent UI Starter Kit

Production-ready code from [craft-agents](https://github.com/anthropics/craft-agents).

## File Index

| File | Purpose | Key Exports |
|------|---------|-------------|
| `event-processor/processor.ts` | Pure event processing | `processEvent()` |
| `event-processor/types.ts` | Event & state types | `AgentEvent`, `SessionState` |
| `event-processor/helpers.ts` | State manipulation helpers | `appendMessage()`, `updateMessage()` |
| `event-processor/handlers/tool.ts` | Tool event handlers | `handleToolStart()`, `handleToolResult()` |
| `event-processor/handlers/text.ts` | Text streaming handlers | `handleTextDelta()`, `handleTextComplete()` |
| `event-processor/handlers/session.ts` | Session lifecycle handlers | `handleComplete()`, `handleError()` |
| `atoms/sessions.ts` | Jotai session atoms | `sessionAtomFamily`, `syncSessionsToAtomsAtom` |
| `components/turn-utils.ts` | Turn grouping algorithm | `groupMessagesByTurn()`, `deriveTurnPhase()` |
| `lib/tool-parsers.ts` | Tool result parsing | `extractOverlayData()`, `parseToolResult()` |

## Quick Integration

```bash
# Copy to your project
cp -r ~/.claude/skills/agent-ui/assets/starter-kit/* ./src/agent-ui/

# Install dependencies
npm install jotai
```

## Architecture

```
Your App
    │
    ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  SDK Events     │ ──► │  processEvent()  │ ──► │  Jotai Atoms    │
│  (WebSocket)    │     │  (Pure function) │     │  (Per-session)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │  React Components│ ◄── │  Turn Grouping  │
                        │  (TurnCard, etc) │     │  (Hierarchical) │
                        └──────────────────┘     └─────────────────┘
```

## Customization Points

1. **Add new event type**: Edit `types.ts`, add handler in `handlers/`
2. **Add new tool overlay**: Edit `tool-parsers.ts`, add overlay data type
3. **Change buffering**: Edit buffer config in your component
4. **Add state fields**: Edit `SessionState` in `types.ts`
