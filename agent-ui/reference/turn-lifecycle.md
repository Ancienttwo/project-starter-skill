# Turn Lifecycle & State Machine

Users experience AI interactions as "turns", not individual messages. This document explains the turn grouping algorithm and lifecycle state machine.

## State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Turn Lifecycle States                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PENDING ──(tool_start)──► TOOL_ACTIVE ──(all_tools_done)──► AWAITING     │
│      │                          │                                  │        │
│      │ text_delta               │ text_delta                       │        │
│      ▼                          ▼                                  │        │
│   STREAMING ◄───────────── STREAMING (intermediate) ◄──────────────┘        │
│      │                          │                                           │
│      │ text_complete            │ text_complete + more work                 │
│      ▼                          ▼                                           │
│   COMPLETE                   AWAITING                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Phase Definitions

| Phase | Description | UI Indicator |
|-------|-------------|--------------|
| `pending` | Turn created, waiting for first activity | "Thinking..." |
| `tool_active` | At least one tool is currently running | Tool spinners |
| `awaiting` | All tools done, waiting for next action | "Thinking..." |
| `streaming` | Final response text is actively streaming | Response card |
| `complete` | Turn is finished | Static response |

## The Critical "Awaiting" Phase

**Problem**: After a tool completes, there's a gap before the model decides what to do next. Without the `awaiting` phase, the UI would show nothing (turn card "disappears").

**Solution**: The `awaiting` phase explicitly represents this gap, keeping the "Thinking..." indicator visible.

```typescript
export function deriveTurnPhase(turn: AssistantTurn): TurnPhase {
  // Complete takes precedence
  if (turn.isComplete) {
    return 'complete'
  }

  // Final response streaming
  if (turn.response?.isStreaming) {
    return 'streaming'
  }

  // Only TOOL-type activities count for tool_active
  // (intermediate text and status activities don't)
  const hasRunningTools = turn.activities.some(
    a => a.type === 'tool' && a.status === 'running'
  )
  if (hasRunningTools) {
    return 'tool_active'
  }

  // THE KEY INSIGHT: Has activities but none running = "the gap"
  if (turn.activities.length > 0) {
    return 'awaiting'
  }

  return 'pending'
}
```

## Thinking Indicator Logic

```typescript
export function shouldShowThinkingIndicator(
  phase: TurnPhase,
  isBuffering: boolean
): boolean {
  // Show during:
  // - pending: waiting for first activity
  // - awaiting: gap between tool completion and next action
  // - streaming but buffering: text started but not ready to display
  return (
    phase === 'pending' ||
    phase === 'awaiting' ||
    (phase === 'streaming' && isBuffering)
  )
}
```

## Turn Types

```typescript
/** Assistant turn with activities and response */
interface AssistantTurn {
  type: 'assistant'
  turnId: string
  activities: ActivityItem[]
  response?: ResponseContent
  intent?: string
  isStreaming: boolean
  isComplete: boolean
  timestamp: number
  todos?: TodoItem[]
}

/** User message */
interface UserTurn {
  type: 'user'
  message: Message
  timestamp: number
}

/** System/info/error message */
interface SystemTurn {
  type: 'system'
  message: Message
  timestamp: number
}

/** Auth request (credential input, OAuth) */
interface AuthRequestTurn {
  type: 'auth-request'
  message: Message
  timestamp: number
}

type Turn = AssistantTurn | UserTurn | SystemTurn | AuthRequestTurn
```

## Activity Types

```typescript
interface ActivityItem {
  id: string
  type: 'tool' | 'thinking' | 'intermediate' | 'status'
  status: 'pending' | 'running' | 'completed' | 'error' | 'backgrounded'
  
  // Tool info
  toolName?: string
  toolUseId?: string
  toolInput?: Record<string, unknown>
  content?: string
  intent?: string
  displayName?: string
  
  // Nesting
  parentId?: string
  depth?: number
  
  // Background
  taskId?: string
  shellId?: string
  elapsedSeconds?: number
  isBackground?: boolean
  
  timestamp: number
  error?: string
}
```

## Grouping Algorithm

```typescript
export function groupMessagesByTurn(messages: Message[]): Turn[] {
  const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp)
  const turns: Turn[] = []
  let currentTurn: AssistantTurn | null = null

  const flushCurrentTurn = (interrupted = false) => {
    if (currentTurn) {
      // Sort activities chronologically
      currentTurn.activities.sort((a, b) => a.timestamp - b.timestamp)
      
      // Calculate nesting depths
      calculateActivityDepths(currentTurn.activities)
      
      // Extract todos from TodoWrite
      currentTurn.todos = extractTodosFromActivities(currentTurn.activities)
      
      // Handle interruption
      if (interrupted) {
        currentTurn.activities = currentTurn.activities.map(a =>
          a.status === 'running'
            ? { ...a, status: 'error', error: 'Interrupted' }
            : a
        )
      }
      
      turns.push(currentTurn)
      currentTurn = null
    }
  }

  for (const message of sortedMessages) {
    // User messages start fresh context
    if (message.role === 'user') {
      if (currentTurn) currentTurn.isComplete = true
      flushCurrentTurn()
      turns.push({ type: 'user', message, timestamp: message.timestamp })
      continue
    }

    // Tool messages belong to current turn
    if (message.role === 'tool') {
      if (!currentTurn) {
        currentTurn = createNewTurn(message)
      }
      currentTurn.activities.push(
        messageToActivity(message, currentTurn.activities)
      )
      continue
    }

    // Intermediate assistant text = activity
    if (message.role === 'assistant' && message.isIntermediate) {
      if (!currentTurn) {
        currentTurn = createNewTurn(message)
      }
      currentTurn.activities.push({
        id: message.id,
        type: 'intermediate',
        status: message.isPending ? 'running' : 'completed',
        content: message.content,
        timestamp: message.timestamp,
        parentId: message.parentToolUseId,
        depth: 0,
      })
      continue
    }

    // Final assistant text = response
    if (message.role === 'assistant') {
      if (!currentTurn) {
        currentTurn = createNewTurn(message)
      }
      currentTurn.response = {
        text: message.content,
        isStreaming: !!message.isStreaming,
      }
      currentTurn.isComplete = !message.isStreaming
      if (!message.isStreaming) {
        flushCurrentTurn()
      }
    }
  }

  flushCurrentTurn()
  return turns
}
```

## Depth Calculation for Nested Tools

Task subagents create parent-child relationships. We calculate depth for tree-view rendering.

```typescript
function calculateActivityDepths(activities: ActivityItem[]): void {
  // Build lookup map
  const toolIdToActivity = new Map<string, ActivityItem>()
  for (const activity of activities) {
    if (activity.toolUseId) {
      toolIdToActivity.set(activity.toolUseId, activity)
    }
  }

  // Calculate depth by walking parent chain
  for (const activity of activities) {
    let depth = 0
    let parentId = activity.parentId

    while (parentId && depth < 10) {  // Max 10 to prevent infinite loops
      depth++
      const parent = toolIdToActivity.get(parentId)
      parentId = parent?.parentId
    }

    activity.depth = depth
  }
}
```

## Activity Grouping for Task Subagents

```typescript
interface ActivityGroup {
  type: 'group'
  parent: ActivityItem           // The Task tool
  children: ActivityItem[]       // Tools executed by the subagent
  taskOutputData?: {
    durationMs?: number
    inputTokens?: number
    outputTokens?: number
  }
}

export function groupActivitiesByParent(
  activities: ActivityItem[]
): (ActivityItem | ActivityGroup)[] {
  // Build set of Task toolUseIds
  const taskToolUseIds = new Set<string>()
  for (const activity of activities) {
    if (activity.toolName === 'Task' && activity.toolUseId) {
      taskToolUseIds.add(activity.toolUseId)
    }
  }

  // Group children by parent
  const childrenByParent = new Map<string, ActivityItem[]>()
  for (const activity of activities) {
    if (activity.parentId && taskToolUseIds.has(activity.parentId)) {
      const existing = childrenByParent.get(activity.parentId) || []
      existing.push(activity)
      childrenByParent.set(activity.parentId, existing)
    }
  }

  // Build result
  const result: (ActivityItem | ActivityGroup)[] = []
  const childIds = new Set<string>()
  
  for (const children of childrenByParent.values()) {
    for (const child of children) {
      childIds.add(child.id)
    }
  }

  for (const activity of activities) {
    if (childIds.has(activity.id)) continue  // Skip children
    if (activity.toolName === 'TaskOutput') continue  // Skip TaskOutput
    
    if (activity.toolName === 'Task') {
      result.push({
        type: 'group',
        parent: activity,
        children: childrenByParent.get(activity.toolUseId!) || [],
      })
    } else {
      result.push(activity)
    }
  }

  return result
}
```

## Source File Reference

- Turn utils: `packages/ui/src/components/chat/turn-utils.ts`
- TurnCard: `packages/ui/src/components/chat/TurnCard.tsx`
