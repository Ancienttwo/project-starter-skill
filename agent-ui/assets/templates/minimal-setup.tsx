/**
 * Template: Minimal Agent UI Setup
 * 
 * This shows the minimum code needed to integrate agent UI components.
 * Use this as a starting point for new projects.
 */

import * as React from 'react'
import { useState, useCallback } from 'react'

// ============================================================================
// Types (copy from packages/ui or define your own)
// ============================================================================

type ActivityStatus = 'pending' | 'running' | 'completed' | 'error'
type ActivityType = 'tool' | 'intermediate'

interface ActivityItem {
  id: string
  type: ActivityType
  status: ActivityStatus
  toolName?: string
  toolInput?: Record<string, unknown>
  content?: string
  intent?: string
  timestamp: number
  error?: string
}

interface ResponseContent {
  text: string
  isStreaming: boolean
}

interface Turn {
  id: string
  activities: ActivityItem[]
  response?: ResponseContent
  isComplete: boolean
}

// ============================================================================
// Minimal TurnCard Component
// ============================================================================

interface MinimalTurnCardProps {
  turn: Turn
  onActivityClick?: (activity: ActivityItem) => void
}

function MinimalTurnCard({ turn, onActivityClick }: MinimalTurnCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600"
      >
        <span>{isExpanded ? '▼' : '▶'}</span>
        <span>{turn.activities.length} activities</span>
        {!turn.isComplete && <span className="animate-pulse">●</span>}
      </button>

      {/* Activities */}
      {isExpanded && turn.activities.length > 0 && (
        <div className="space-y-1 pl-4 border-l-2 border-gray-200">
          {turn.activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => onActivityClick?.(activity)}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
            >
              {/* Status indicator */}
              <span className={
                activity.status === 'completed' ? 'text-green-500' :
                activity.status === 'error' ? 'text-red-500' :
                activity.status === 'running' ? 'text-blue-500 animate-pulse' :
                'text-gray-400'
              }>
                {activity.status === 'completed' ? '✓' :
                 activity.status === 'error' ? '✗' :
                 activity.status === 'running' ? '○' : '○'}
              </span>
              
              {/* Tool name or type */}
              <span className="font-medium">
                {activity.toolName || activity.type}
              </span>
              
              {/* Intent/description */}
              {activity.intent && (
                <span className="text-gray-500 truncate">
                  · {activity.intent}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response */}
      {turn.response && (
        <div className="bg-gray-50 rounded p-3 text-sm">
          {turn.response.isStreaming && (
            <span className="text-blue-500 animate-pulse mr-2">●</span>
          )}
          <div className="whitespace-pre-wrap">
            {turn.response.text}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Event Handler (simplified)
// ============================================================================

interface AgentEvent {
  type: string
  toolUseId?: string
  toolName?: string
  toolInput?: Record<string, unknown>
  result?: string
  text?: string
  isError?: boolean
  isIntermediate?: boolean
}

function processEvent(
  turn: Turn,
  event: AgentEvent
): Turn {
  switch (event.type) {
    case 'tool_start':
      return {
        ...turn,
        activities: [
          ...turn.activities,
          {
            id: event.toolUseId || crypto.randomUUID(),
            type: 'tool',
            status: 'running',
            toolName: event.toolName,
            toolInput: event.toolInput,
            timestamp: Date.now(),
          },
        ],
      }

    case 'tool_result':
      return {
        ...turn,
        activities: turn.activities.map((a) =>
          a.id === event.toolUseId
            ? { ...a, status: event.isError ? 'error' : 'completed', content: event.result }
            : a
        ),
      }

    case 'text_complete':
      if (event.isIntermediate) {
        return {
          ...turn,
          activities: [
            ...turn.activities,
            {
              id: crypto.randomUUID(),
              type: 'intermediate',
              status: 'completed',
              content: event.text,
              timestamp: Date.now(),
            },
          ],
        }
      }
      return {
        ...turn,
        response: { text: event.text || '', isStreaming: false },
      }

    case 'complete':
      return { ...turn, isComplete: true }

    default:
      return turn
  }
}

// ============================================================================
// Demo App
// ============================================================================

export function MinimalAgentUI() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [currentTurn, setCurrentTurn] = useState<Turn | null>(null)

  // Simulate receiving events (replace with real event source)
  const simulateEvents = useCallback(() => {
    let turn: Turn = {
      id: crypto.randomUUID(),
      activities: [],
      isComplete: false,
    }

    const events: AgentEvent[] = [
      { type: 'tool_start', toolUseId: '1', toolName: 'Read', toolInput: { path: '/file.txt' } },
      { type: 'tool_result', toolUseId: '1', result: 'File content here...' },
      { type: 'text_complete', text: 'I found the file. Here is what it contains...', isIntermediate: true },
      { type: 'tool_start', toolUseId: '2', toolName: 'Write', toolInput: { path: '/output.txt' } },
      { type: 'tool_result', toolUseId: '2', result: 'Written successfully' },
      { type: 'text_complete', text: 'Done! I have processed the file and saved the output.' },
      { type: 'complete' },
    ]

    let i = 0
    const interval = setInterval(() => {
      if (i >= events.length) {
        clearInterval(interval)
        setTurns((prev) => [...prev, turn])
        setCurrentTurn(null)
        return
      }

      turn = processEvent(turn, events[i])
      setCurrentTurn({ ...turn })
      i++
    }, 500)
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Minimal Agent UI</h1>
      
      <button
        onClick={simulateEvents}
        disabled={currentTurn !== null}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Simulate Agent Turn
      </button>

      <div className="space-y-4">
        {turns.map((turn) => (
          <MinimalTurnCard key={turn.id} turn={turn} />
        ))}
        {currentTurn && (
          <MinimalTurnCard turn={currentTurn} />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Usage Notes
// ============================================================================

/*
To integrate with a real agent:

1. Replace simulateEvents() with actual event streaming:

   const eventSource = new EventSource('/api/agent/stream')
   eventSource.onmessage = (e) => {
     const event = JSON.parse(e.data)
     setCurrentTurn((prev) => processEvent(prev || createNewTurn(), event))
   }

2. For Jotai integration, see reference/jotai-patterns.md

3. For full component library, use @craft-agent/ui package:

   import { TurnCard, groupMessagesByTurn } from '@craft-agent/ui'

4. For overlays (file preview, diff, terminal), see reference/tool-routing.md
*/
