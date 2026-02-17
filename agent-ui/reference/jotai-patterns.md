# Jotai State Management Patterns

This document explains how to use Jotai's `atomFamily` for per-session state isolation in multi-session AI agent applications.

## The Problem

Without proper state isolation:

```
Session A streaming → triggers sessions[] update → Session B re-renders → input loses focus!
```

This is a critical UX bug in multi-session applications.

## The Solution: atomFamily

```typescript
import { atom } from 'jotai'
import { atomFamily } from 'jotai-family'

// Each session gets its own isolated atom
export const sessionAtomFamily = atomFamily(
  (_sessionId: string) => atom<Session | null>(null),
  (a, b) => a === b  // Equality function
)
```

### Usage in Components

```typescript
function ChatDisplay({ sessionId }: { sessionId: string }) {
  // Only re-renders when THIS session changes
  const session = useAtomValue(sessionAtomFamily(sessionId))
  
  // Session B's streaming doesn't trigger this component
  return <div>{/* ... */}</div>
}
```

## Complete Session Atoms Architecture

```typescript
// atoms/sessions.ts

// ============================================================
// Core Atoms
// ============================================================

/** Per-session state - isolated updates */
export const sessionAtomFamily = atomFamily(
  (_sessionId: string) => atom<Session | null>(null),
  (a, b) => a === b
)

/** Lightweight metadata for list display (no messages) */
export const sessionMetaMapAtom = atom<Map<string, SessionMeta>>(new Map())

/** Ordered session IDs */
export const sessionIdsAtom = atom<string[]>([])

/** Track which sessions have messages loaded */
export const loadedSessionsAtom = atom<Set<string>>(new Set())

/** Currently active session ID */
export const activeSessionIdAtom = atom<string | null>(null)

// ============================================================
// UI State Atoms (per-session)
// ============================================================

/** Expanded turn IDs - persists across session switches */
export const expandedTurnsAtomFamily = atomFamily(
  (_sessionId: string) => atom<Set<string>>(new Set()),
  (a, b) => a === b
)

/** Expanded activity groups for Task subagents */
export const expandedActivityGroupsAtomFamily = atomFamily(
  (_sessionId: string) => atom<Set<string>>(new Set()),
  (a, b) => a === b
)

/** Active background tasks */
export const backgroundTasksAtomFamily = atomFamily(
  (_sessionId: string) => atom<BackgroundTask[]>([]),
  (a, b) => a === b
)
```

## Metadata Separation

Keep message data separate from list display data:

```typescript
interface SessionMeta {
  id: string
  name?: string
  preview?: string           // First user message
  workspaceId: string
  lastMessageAt?: number
  isProcessing?: boolean
  isFlagged?: boolean
  sharedUrl?: string
  todoState?: string
  lastMessageRole?: 'user' | 'assistant' | 'plan' | 'tool' | 'error'
  // NO messages[] - that's heavy data
}

function extractSessionMeta(session: Session): SessionMeta {
  return {
    id: session.id,
    name: session.name,
    isProcessing: session.isProcessing,
    // ... lightweight fields only
  }
}
```

## Action Atoms

### Update Single Session

```typescript
export const updateSessionAtom = atom(
  null,
  (get, set, sessionId: string, updater: (prev: Session | null) => Session | null) => {
    const sessionAtom = sessionAtomFamily(sessionId)
    const current = get(sessionAtom)
    const updated = updater(current)
    set(sessionAtom, updated)

    // Also update metadata
    if (updated) {
      const metaMap = get(sessionMetaMapAtom)
      const newMetaMap = new Map(metaMap)
      newMetaMap.set(sessionId, extractSessionMeta(updated))
      set(sessionMetaMapAtom, newMetaMap)
    }
  }
)
```

### Append Message (Optimized)

```typescript
export const appendMessageAtom = atom(
  null,
  (get, set, sessionId: string, message: Message) => {
    const sessionAtom = sessionAtomFamily(sessionId)
    const session = get(sessionAtom)
    if (session) {
      set(sessionAtom, {
        ...session,
        messages: [...session.messages, message],
      })
    }
  }
)
```

### Lazy Load Messages

```typescript
export const ensureSessionMessagesLoadedAtom = atom(
  null,
  async (get, set, sessionId: string): Promise<Session | null> => {
    const loadedSessions = get(loadedSessionsAtom)
    
    // Already loaded
    if (loadedSessions.has(sessionId)) {
      return get(sessionAtomFamily(sessionId))
    }

    // Fetch from backend
    const loadedSession = await window.electronAPI.getSessionMessages(sessionId)
    if (!loadedSession) {
      return get(sessionAtomFamily(sessionId))
    }

    // Update atom
    set(sessionAtomFamily(sessionId), loadedSession)
    
    // Mark as loaded
    const newLoaded = new Set(loadedSessions)
    newLoaded.add(sessionId)
    set(loadedSessionsAtom, newLoaded)

    return loadedSession
  }
)
```

## Memory Management

Clean up atoms when sessions are deleted:

```typescript
export const removeSessionAtom = atom(
  null,
  (get, set, sessionId: string) => {
    // Clear value
    set(sessionAtomFamily(sessionId), null)
    
    // Remove from family cache - allows GC
    sessionAtomFamily.remove(sessionId)
    
    // Clean up UI state atoms too
    expandedTurnsAtomFamily.remove(sessionId)
    expandedActivityGroupsAtomFamily.remove(sessionId)
    backgroundTasksAtomFamily.remove(sessionId)
    
    // Remove from collections
    const metaMap = get(sessionMetaMapAtom)
    const newMetaMap = new Map(metaMap)
    newMetaMap.delete(sessionId)
    set(sessionMetaMapAtom, newMetaMap)
  }
)
```

## Streaming Priority Strategy

During streaming, the atom is the source of truth. React state may lag behind.

```typescript
export const syncSessionsToAtomsAtom = atom(
  null,
  (get, set, sessions: Session[]) => {
    for (const session of sessions) {
      const atomSession = get(sessionAtomFamily(session.id))
      
      // CRITICAL: If atom is processing, it has streaming data
      // Don't overwrite - atom is source of truth during streaming
      if (atomSession?.isProcessing) {
        continue
      }

      // Only update if different
      if (atomSession !== session) {
        set(sessionAtomFamily(session.id), session)
      }
    }
  }
)
```

## Direct Store Access (Event Handlers)

For event handlers outside React components:

```typescript
import { getDefaultStore } from 'jotai'

function handleToolStart(event: ToolStartEvent) {
  const store = getDefaultStore()
  
  // Read current state
  const session = store.get(sessionAtomFamily(event.sessionId))
  
  // Update directly
  store.set(sessionAtomFamily(event.sessionId), {
    ...session,
    messages: [...session.messages, newToolMessage],
  })
}
```

## HMR Handling

Jotai atoms are module-level. HMR can cause data loss if not handled:

```typescript
// Force full refresh when atoms file changes
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    import.meta.hot?.invalidate()
  })
}
```

## Performance Comparison

| Metric | Global sessions[] | atomFamily |
|--------|-------------------|------------|
| Session A streaming re-renders Session B | Yes | No |
| 300 sessions memory (initial) | ~500MB | ~50MB |
| Update single session | O(n) copies | O(1) |
| GC on session delete | Manual | Automatic |

## When to Use atomFamily vs Global Atom

| Use Case | Recommendation |
|----------|----------------|
| Per-entity state (sessions, tabs, documents) | `atomFamily` |
| Global singleton (theme, user, config) | Regular `atom` |
| Derived from multiple entities | Derived atom with selectors |
| Temporary UI state | Local component state |

## Source File Reference

- Sessions atoms: `apps/electron/src/renderer/atoms/sessions.ts`
- App setup: `apps/electron/src/renderer/main.tsx`
