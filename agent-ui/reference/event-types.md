# Agent Event Types

Complete type definitions for the event processing system.

## Event Union

```typescript
type AgentEvent =
  | TextDeltaEvent
  | TextCompleteEvent
  | ToolStartEvent
  | ToolResultEvent
  | ParentUpdateEvent
  | TaskBackgroundedEvent
  | ShellBackgroundedEvent
  | TaskProgressEvent
  | CompleteEvent
  | ErrorEvent
  | TypedErrorEvent
  | PermissionRequestEvent
  | CredentialRequestEvent
  | StatusEvent
  | InfoEvent
  | InterruptedEvent
  | TitleGeneratedEvent
  | AsyncOperationEvent
  | UserMessageEvent
  | AuthRequestEvent
  | AuthCompletedEvent
  | UsageUpdateEvent
```

## Core Events

### TextDeltaEvent
Streaming text chunk from the model.

```typescript
interface TextDeltaEvent {
  type: 'text_delta'
  sessionId: string
  delta: string      // The text chunk
  turnId?: string    // Which turn this belongs to
}
```

### TextCompleteEvent
Finalizes streaming text - indicates whether it's intermediate or final.

```typescript
interface TextCompleteEvent {
  type: 'text_complete'
  sessionId: string
  text: string              // Complete text
  turnId?: string
  isIntermediate?: boolean  // true = more work coming, false = final response
  parentToolUseId?: string  // For nested tool commentary
}
```

### ToolStartEvent
Tool execution has started.

```typescript
interface ToolStartEvent {
  type: 'tool_start'
  sessionId: string
  toolUseId: string                    // Unique ID for this tool invocation
  toolName: string                     // e.g., "Read", "Bash", "mcp__github__search"
  toolInput?: Record<string, unknown>  // Tool parameters
  turnId?: string
  parentToolUseId?: string             // Parent tool (for Task subagents)
  toolIntent?: string                  // Human-friendly description
  toolDisplayName?: string             // LLM-generated display name
}
```

### ToolResultEvent
Tool execution completed.

```typescript
interface ToolResultEvent {
  type: 'tool_result'
  sessionId: string
  toolUseId: string          // Matches the tool_start
  toolName?: string
  result: string             // Tool output (often JSON)
  isError?: boolean          // Whether tool failed
  turnId?: string
  parentToolUseId?: string
}
```

### ParentUpdateEvent
Deferred parent assignment for nested tools.

```typescript
interface ParentUpdateEvent {
  type: 'parent_update'
  sessionId: string
  toolUseId: string          // The child tool
  parentToolUseId: string    // The correct parent
}
```

**Why needed**: When multiple Task subagents are active simultaneously, we can't determine the correct parent at `tool_start` time. This event assigns the correct parent once the tool result arrives with the authoritative `parent_tool_use_id` from SDK.

## Background Task Events

### TaskBackgroundedEvent
Background agent task started.

```typescript
interface TaskBackgroundedEvent {
  type: 'task_backgrounded'
  sessionId: string
  toolUseId: string    // The Task tool invocation
  taskId: string       // Agent ID for polling
  intent?: string
  turnId?: string
}
```

### ShellBackgroundedEvent
Background bash shell started.

```typescript
interface ShellBackgroundedEvent {
  type: 'shell_backgrounded'
  sessionId: string
  toolUseId: string
  shellId: string      // Shell ID for reference
  intent?: string
  turnId?: string
}
```

### TaskProgressEvent
Live progress update for background tasks.

```typescript
interface TaskProgressEvent {
  type: 'task_progress'
  sessionId: string
  toolUseId: string
  elapsedSeconds: number    // For live UI display
  turnId?: string
}
```

## Session Lifecycle Events

### CompleteEvent
Agent loop finished successfully.

```typescript
interface CompleteEvent {
  type: 'complete'
  sessionId: string
  tokenUsage?: {
    inputTokens: number
    outputTokens: number
    cacheReadTokens?: number
    cacheWriteTokens?: number
  }
}
```

### ErrorEvent
Untyped error occurred.

```typescript
interface ErrorEvent {
  type: 'error'
  sessionId: string
  error: string        // Error message
  code?: string        // Error code
  title?: string       // Display title
  details?: string     // Additional details
  original?: string    // Original error message
}
```

### TypedErrorEvent
Structured error with retry capability.

```typescript
interface TypedErrorEvent {
  type: 'typed_error'
  sessionId: string
  error: {
    code: string
    title: string
    message: string
    details?: string
    canRetry?: boolean
  }
}
```

### InterruptedEvent
User interrupted the agent.

```typescript
interface InterruptedEvent {
  type: 'interrupted'
  sessionId: string
  message: Message     // Info message to display
}
```

## UI State Events

### StatusEvent
Status indicator (e.g., "Compacting context...").

```typescript
interface StatusEvent {
  type: 'status'
  sessionId: string
  message: string
  statusType?: 'compacting'  // For specific UI treatment
}
```

### InfoEvent
Informational message.

```typescript
interface InfoEvent {
  type: 'info'
  sessionId: string
  message: string
  statusType?: 'compaction_complete'
  level?: 'info' | 'warning' | 'error' | 'success'
}
```

### AsyncOperationEvent
Generic async operation state (shimmer effects).

```typescript
interface AsyncOperationEvent {
  type: 'async_operation'
  sessionId: string
  isOngoing: boolean   // true = start shimmer, false = stop
}
```

### UsageUpdateEvent
Real-time context usage during processing.

```typescript
interface UsageUpdateEvent {
  type: 'usage_update'
  sessionId: string
  tokenUsage: {
    inputTokens: number
    contextWindow?: number
  }
}
```

## Auth Events

### AuthRequestEvent
Credential or OAuth flow needed.

```typescript
interface AuthRequestEvent {
  type: 'auth_request'
  sessionId: string
  message: Message           // Auth-request message for UI
  request: {
    requestId: string
    type: 'credential' | 'oauth'
    sourceSlug: string
    sourceName: string
    // ... additional auth fields
  }
}
```

### AuthCompletedEvent
Auth flow completed.

```typescript
interface AuthCompletedEvent {
  type: 'auth_completed'
  sessionId: string
  requestId: string
  success: boolean
  cancelled?: boolean
  error?: string
}
```

## State Types

### SessionState
Complete state for event processing.

```typescript
interface SessionState {
  session: Session
  streaming: StreamingState | null
}

interface StreamingState {
  content: string
  turnId?: string
  parentToolUseId?: string
}
```

### ProcessResult
Return type from `processEvent()`.

```typescript
interface ProcessResult {
  state: SessionState
  effects: Effect[]    // Side effects to execute
}

type Effect =
  | { type: 'permission_request'; request: PermissionRequest }
  | { type: 'credential_request'; request: CredentialRequest }
  | { type: 'generate_title'; sessionId: string; userMessage: string }
  | { type: 'auto_retry'; sessionId: string; originalMessage: string }
```

## Source File Reference

- Types: `apps/electron/src/renderer/event-processor/types.ts`
- Processor: `apps/electron/src/renderer/event-processor/processor.ts`
- Handlers: `apps/electron/src/renderer/event-processor/handlers/`
