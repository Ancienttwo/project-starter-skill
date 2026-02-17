/**
 * Template: Custom Overlay Component
 * 
 * Use this template to add a new tool visualization.
 * 
 * Steps:
 * 1. Copy this file and rename to your overlay (e.g., DiagramPreviewOverlay.tsx)
 * 2. Update the data interface to match your tool's output
 * 3. Implement the rendering logic
 * 4. Add to tool-parsers.ts routing
 */

import * as React from 'react'
import { X, Copy, Check, ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'

// ============================================================================
// Step 1: Define your overlay data type
// ============================================================================

export interface CustomOverlayData {
  type: 'custom'  // Change to your type name
  title: string
  // Add your tool-specific fields here
  content: string
  metadata?: Record<string, unknown>
  error?: string
}

// ============================================================================
// Step 2: Define component props
// ============================================================================

interface CustomPreviewOverlayProps {
  data: CustomOverlayData
  isOpen: boolean
  onClose: () => void
  // Optional callbacks
  onOpenFile?: (path: string) => void
  onOpenUrl?: (url: string) => void
}

// ============================================================================
// Step 3: Implement the component
// ============================================================================

export function CustomPreviewOverlay({
  data,
  isOpen,
  onClose,
  onOpenFile,
  onOpenUrl,
}: CustomPreviewOverlayProps) {
  const [copied, setCopied] = React.useState(false)

  // Handle copy to clipboard
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(data.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [data.content])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !window.getSelection()?.toString()) {
        handleCopy()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleCopy])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="fixed inset-4 bg-background border border-border rounded-lg shadow-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium">{data.title}</h2>
            {data.error && (
              <span className="text-xs text-destructive">Error: {data.error}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                copied 
                  ? "text-success" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Close (Escape)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* 
           * Replace this with your custom rendering logic.
           * Examples:
           * - Mermaid diagram renderer
           * - Data table
           * - Image viewer
           * - Custom visualization
           */}
          <pre className="text-sm font-mono whitespace-pre-wrap">
            {data.content}
          </pre>
          
          {/* Show metadata if available */}
          {data.metadata && Object.keys(data.metadata).length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Metadata</h3>
              <pre className="text-xs font-mono text-muted-foreground">
                {JSON.stringify(data.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer (optional) */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Press Escape to close
          </span>
          <span className="text-xs text-muted-foreground">
            {data.content.length.toLocaleString()} characters
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Step 4: Add to tool-parsers.ts
// ============================================================================

/*
In lib/tool-parsers.ts:

1. Add type to OverlayData union:

export type OverlayData =
  | CodeOverlayData
  | DiffOverlayData
  | CustomOverlayData  // Add here
  // ...

2. Add routing case in extractOverlayData():

if (toolName === 'your_tool_name' || toolName === 'mcp__server__your_tool') {
  return {
    type: 'custom',
    title: activity.displayName || 'Custom Tool Result',
    content: rawContent,
    metadata: activity.toolInput,
    error: activity.error,
  }
}

3. Add to overlay router:

case 'custom':
  return <CustomPreviewOverlay data={data} isOpen={isOpen} onClose={onClose} />
*/
