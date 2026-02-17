# Tool Result Parsing & Overlay Routing

This document explains how to parse tool results and route them to appropriate overlay components.

## Architecture

```
Tool Result (JSON/text) → Parser → OverlayData → Overlay Component
```

The system uses a **discriminated union** for type-safe routing.

## Overlay Data Types

```typescript
export type OverlayData =
  | CodeOverlayData
  | DiffOverlayData
  | TerminalOverlayData
  | GenericOverlayData
  | JSONOverlayData

interface CodeOverlayData {
  type: 'code'
  filePath: string
  content: string
  mode: 'read' | 'write'
  startLine?: number
  totalLines?: number
  numLines?: number
  error?: string
}

interface DiffOverlayData {
  type: 'diff'
  filePath: string
  original: string
  modified: string
  error?: string
}

interface TerminalOverlayData {
  type: 'terminal'
  command: string
  output: string
  exitCode?: number
  toolType: 'bash' | 'grep' | 'glob'
  description: string
}

interface GenericOverlayData {
  type: 'generic'
  content: string
  title: string
}

interface JSONOverlayData {
  type: 'json'
  data: unknown
  rawContent: string
  title: string
  error?: string
}
```

## Individual Tool Parsers

### Read Tool

```typescript
interface ReadResult {
  content: string
  numLines?: number
  startLine?: number
  totalLines?: number
}

export function parseReadResult(rawContent: string): ReadResult {
  try {
    const parsed = JSON.parse(rawContent)
    if (parsed.file) {
      return {
        content: parsed.file.content || '',
        numLines: parsed.file.numLines,
        startLine: parsed.file.startLine,
        totalLines: parsed.file.totalLines,
      }
    }
  } catch {
    // Not JSON, use as plain text
  }
  return { content: rawContent }
}
```

### Bash Tool

```typescript
interface BashResult {
  output: string
  exitCode?: number
}

export function parseBashResult(rawContent: string): BashResult {
  try {
    const parsed = JSON.parse(rawContent)
    if (parsed.stdout !== undefined || parsed.stderr !== undefined) {
      const stdout = parsed.stdout || ''
      const stderr = parsed.stderr || ''
      return {
        output: stdout + (stderr ? `\n${stderr}` : ''),
        exitCode: parsed.interrupted ? 130 : parsed.exitCode,
      }
    }
  } catch {
    // Try to extract exit code from text
    const exitMatch = rawContent.match(/Exit code: (\d+)/)
    if (exitMatch?.[1]) {
      return { output: rawContent, exitCode: parseInt(exitMatch[1], 10) }
    }
  }
  return { output: rawContent }
}
```

### Grep Tool

```typescript
interface GrepResult {
  output: string
  description: string
  command: string
}

export function parseGrepResult(
  rawContent: string,
  pattern: string,
  searchPath: string,
  outputMode: string
): GrepResult {
  let output = rawContent
  let description = `Search for "${pattern}"`

  try {
    const parsed = JSON.parse(rawContent)
    if (parsed.content !== undefined) {
      output = parsed.content || ''
      if (parsed.numFiles !== undefined) {
        description = `Search for "${pattern}" (${parsed.numFiles} files, ${parsed.numLines || 0} lines)`
      }
    } else if (parsed.filenames) {
      output = parsed.filenames.join('\n')
      description = `Search for "${pattern}" (${parsed.filenames.length} files)`
    }
  } catch {
    // Not JSON
  }

  return {
    output,
    description,
    command: `grep "${pattern}" ${searchPath} --${outputMode}`,
  }
}
```

### Glob Tool

```typescript
interface GlobResult {
  output: string
  description: string
  command: string
}

export function parseGlobResult(
  rawContent: string,
  pattern: string,
  searchPath: string
): GlobResult {
  let output = rawContent
  let description = `Find files matching "${pattern}"`

  try {
    const parsed = JSON.parse(rawContent)
    if (parsed.filenames && Array.isArray(parsed.filenames)) {
      output = parsed.filenames.join('\n')
      const truncated = parsed.truncated ? ' (truncated)' : ''
      description = `Find files matching "${pattern}" (${parsed.numFiles || parsed.filenames.length} files${truncated})`
    } else if (Array.isArray(parsed)) {
      output = parsed.join('\n')
      description = `Find files matching "${pattern}" (${parsed.length} matches)`
    }
  } catch {
    // Not JSON
  }

  return {
    output,
    description,
    command: `glob "${pattern}" in ${searchPath}`,
  }
}
```

## Main Routing Function

```typescript
export function extractOverlayData(activity: ActivityItem): OverlayData | null {
  if (!activity) return null

  const input = activity.toolInput as Record<string, unknown> | undefined
  const rawContent = activity.content || ''
  const toolName = activity.toolName?.toLowerCase() || ''
  const filePath = (input?.file_path as string) || (input?.path as string) || 'file'

  // Read tool → Code overlay (read mode)
  if (toolName === 'read') {
    const parsed = parseReadResult(rawContent)
    return {
      type: 'code',
      filePath,
      content: parsed.content,
      mode: 'read',
      startLine: parsed.startLine,
      totalLines: parsed.totalLines,
      numLines: parsed.numLines,
      error: activity.error,
    }
  }

  // Write tool → Code overlay (write mode)
  if (toolName === 'write') {
    return {
      type: 'code',
      filePath,
      content: (input?.content as string) || rawContent,
      mode: 'write',
      error: activity.error,
    }
  }

  // Edit tool → Diff overlay
  if (toolName === 'edit' || toolName === 'multiedit') {
    return {
      type: 'diff',
      filePath,
      original: (input?.old_string as string) || '',
      modified: (input?.new_string as string) || '',
      error: activity.error,
    }
  }

  // Bash tool → Terminal overlay
  if (toolName === 'bash') {
    const parsed = parseBashResult(rawContent)
    return {
      type: 'terminal',
      command: (input?.command as string) || '',
      output: parsed.output,
      exitCode: parsed.exitCode,
      description: (input?.description as string) || activity.displayName || '',
      toolType: 'bash',
    }
  }

  // Grep tool → Terminal overlay
  if (toolName === 'grep') {
    const pattern = (input?.pattern as string) || ''
    const searchPath = (input?.path as string) || '.'
    const outputMode = (input?.output_mode as string) || 'files_with_matches'
    const parsed = parseGrepResult(rawContent, pattern, searchPath, outputMode)
    return {
      type: 'terminal',
      command: parsed.command,
      output: parsed.output,
      description: parsed.description,
      toolType: 'grep',
    }
  }

  // Glob tool → Terminal overlay
  if (toolName === 'glob') {
    const pattern = (input?.pattern as string) || '*'
    const searchPath = (input?.path as string) || '.'
    const parsed = parseGlobResult(rawContent, pattern, searchPath)
    return {
      type: 'terminal',
      command: parsed.command,
      output: parsed.output,
      description: parsed.description,
      toolType: 'glob',
    }
  }

  // Try JSON detection for MCP tools
  const trimmedContent = rawContent.trim()
  if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
      (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmedContent)
      return {
        type: 'json',
        data: parsed,
        rawContent: trimmedContent,
        title: activity.displayName || activity.toolName || 'JSON Result',
        error: activity.error,
      }
    } catch {
      // Not valid JSON
    }
  }

  // Fallback
  return {
    type: 'generic',
    content: rawContent || (input ? JSON.stringify(input, null, 2) : ''),
    title: activity.displayName || activity.toolName || 'Activity',
  }
}
```

## Adding a New Tool

### Step 1: Define Overlay Data Type

```typescript
// Add to OverlayData union
interface DiagramOverlayData {
  type: 'diagram'
  diagramType: 'mermaid' | 'graphviz' | 'plantuml'
  source: string
  title: string
}

export type OverlayData =
  | CodeOverlayData
  | DiffOverlayData
  | TerminalOverlayData
  | GenericOverlayData
  | JSONOverlayData
  | DiagramOverlayData  // Add here
```

### Step 2: Add Parser (if needed)

```typescript
interface DiagramResult {
  source: string
  diagramType: string
}

export function parseDiagramResult(rawContent: string): DiagramResult {
  try {
    const parsed = JSON.parse(rawContent)
    return {
      source: parsed.source || parsed.diagram || rawContent,
      diagramType: parsed.type || 'mermaid',
    }
  } catch {
    return { source: rawContent, diagramType: 'mermaid' }
  }
}
```

### Step 3: Add Routing Case

```typescript
// In extractOverlayData()
if (toolName === 'diagram' || toolName === 'mcp__diagrams__render') {
  const parsed = parseDiagramResult(rawContent)
  return {
    type: 'diagram',
    diagramType: parsed.diagramType as 'mermaid' | 'graphviz' | 'plantuml',
    source: parsed.source,
    title: activity.displayName || 'Diagram',
  }
}
```

### Step 4: Create Overlay Component

```typescript
// components/overlay/DiagramPreviewOverlay.tsx
import { FullscreenOverlayBase } from './FullscreenOverlayBase'
import { MermaidRenderer } from '../diagram/MermaidRenderer'

interface DiagramPreviewOverlayProps {
  data: DiagramOverlayData
  isOpen: boolean
  onClose: () => void
}

export function DiagramPreviewOverlay({ 
  data, 
  isOpen, 
  onClose 
}: DiagramPreviewOverlayProps) {
  return (
    <FullscreenOverlayBase
      isOpen={isOpen}
      onClose={onClose}
      title={data.title}
    >
      {data.diagramType === 'mermaid' && (
        <MermaidRenderer source={data.source} />
      )}
      {data.diagramType === 'graphviz' && (
        <GraphvizRenderer source={data.source} />
      )}
    </FullscreenOverlayBase>
  )
}
```

### Step 5: Add to Overlay Router

```typescript
// In your overlay rendering logic
function renderOverlay(data: OverlayData, isOpen: boolean, onClose: () => void) {
  switch (data.type) {
    case 'code':
      return <CodePreviewOverlay data={data} isOpen={isOpen} onClose={onClose} />
    case 'diff':
      return <DiffPreviewOverlay data={data} isOpen={isOpen} onClose={onClose} />
    case 'terminal':
      return <TerminalPreviewOverlay data={data} isOpen={isOpen} onClose={onClose} />
    case 'json':
      return <JSONPreviewOverlay data={data} isOpen={isOpen} onClose={onClose} />
    case 'diagram':
      return <DiagramPreviewOverlay data={data} isOpen={isOpen} onClose={onClose} />
    case 'generic':
    default:
      return <GenericOverlay data={data} isOpen={isOpen} onClose={onClose} />
  }
}
```

## Overlay Components Reference

| Component | Purpose | Features |
|-----------|---------|----------|
| `CodePreviewOverlay` | File content display | Syntax highlighting, line numbers, read/write modes |
| `DiffPreviewOverlay` | Side-by-side diff | Syntax highlighting, line-by-line comparison |
| `MultiDiffPreviewOverlay` | Multiple file diffs | File tabs, batch view |
| `TerminalPreviewOverlay` | Command output | ANSI color parsing, exit code display |
| `JSONPreviewOverlay` | Interactive JSON tree | Expand/collapse, search, copy paths |
| `GenericOverlay` | Plain text/markdown | Markdown rendering, copy |
| `FullscreenOverlayBase` | Base component | Header, close button, keyboard handling |

## Source File Reference

- Tool parsers: `packages/ui/src/lib/tool-parsers.ts`
- Overlay components: `packages/ui/src/components/overlay/`
