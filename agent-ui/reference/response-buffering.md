# Smart Response Buffering

Showing every token as it arrives creates visual noise. Smart buffering waits for meaningful content before displaying.

## The Problem

Token-by-token rendering causes:
- Visual flicker and distraction
- Expensive re-renders on every character
- Users trying to read incomplete thoughts
- Markdown parsing on partial content (broken rendering)

## The Solution

Buffer content until we detect "meaningful" output, then display with throttled updates.

## Configuration

```typescript
const BUFFER_CONFIG = {
  // Word thresholds by content type
  MIN_WORDS_STANDARD: 40,     // Base threshold for unstructured text
  MIN_WORDS_CODE: 15,         // Code blocks - developers want to see early
  MIN_WORDS_LIST: 20,         // Lists indicate structure
  MIN_WORDS_QUESTION: 8,      // Questions from AI show fast
  MIN_WORDS_HEADER: 12,       // Headers indicate structure
  
  // Timing
  MIN_BUFFER_MS: 500,         // Always wait at least 500ms
  MAX_BUFFER_MS: 2500,        // Force show after 2.5s
  TIMEOUT_MIN_WORDS: 5,       // Minimum words to show on timeout
  
  // Performance
  HIGH_WORD_COUNT: 60,        // Show regardless of structure
  CONTENT_THROTTLE_MS: 300,   // Throttle updates during streaming
}
```

## Detection Functions

### Word Count

```typescript
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}
```

### Content Patterns

```typescript
/** Detect fenced code blocks */
function hasCodeBlock(text: string): boolean {
  return /```/.test(text)
}

/** Detect markdown lists */
function hasList(text: string): boolean {
  return /^\s*[-*•]\s/m.test(text) || /^\s*\d+\.\s/m.test(text)
}

/** Detect markdown headers */
function hasHeader(text: string): boolean {
  return /^#{1,4}\s/m.test(text)
}

/** Detect structural content */
function hasStructure(text: string): boolean {
  // Sentence ending
  if (/[.!?:]\s*$/.test(text.trimEnd())) return true
  // Paragraph breaks
  if (/\n\s*\n/.test(text)) return true
  // Headers anywhere
  if (/\n\s*#{1,4}\s/.test(text)) return true
  // Code blocks
  if (hasCodeBlock(text)) return true
  return false
}

/** Detect questions (AI asking for clarification) */
function isQuestion(text: string): boolean {
  return /\?\s*$/.test(text.trim())
}
```

## Decision Function

```typescript
type BufferReason =
  | 'complete'
  | 'min_time'
  | 'timeout'
  | 'code_block'
  | 'list'
  | 'header'
  | 'question'
  | 'threshold_met'
  | 'high_word_count'
  | 'buffering'

function shouldShowContent(
  text: string,
  isStreaming: boolean,
  streamStartTime?: number
): { shouldShow: boolean; reason: BufferReason; wordCount: number } {
  const wordCount = countWords(text)

  // Always show complete content immediately
  if (!isStreaming) {
    return { shouldShow: true, reason: 'complete', wordCount }
  }

  const elapsed = streamStartTime ? Date.now() - streamStartTime : 0

  // Minimum buffer time - always wait
  if (elapsed < BUFFER_CONFIG.MIN_BUFFER_MS) {
    return { shouldShow: false, reason: 'min_time', wordCount }
  }

  // Maximum buffer time - force show
  if (elapsed > BUFFER_CONFIG.MAX_BUFFER_MS && 
      wordCount >= BUFFER_CONFIG.TIMEOUT_MIN_WORDS) {
    return { shouldShow: true, reason: 'timeout', wordCount }
  }

  // High-confidence patterns (expedited)
  
  if (hasCodeBlock(text) && wordCount >= BUFFER_CONFIG.MIN_WORDS_CODE) {
    return { shouldShow: true, reason: 'code_block', wordCount }
  }

  if (hasHeader(text) && wordCount >= BUFFER_CONFIG.MIN_WORDS_HEADER) {
    return { shouldShow: true, reason: 'header', wordCount }
  }

  if (hasList(text) && wordCount >= BUFFER_CONFIG.MIN_WORDS_LIST) {
    return { shouldShow: true, reason: 'list', wordCount }
  }

  if (isQuestion(text) && wordCount >= BUFFER_CONFIG.MIN_WORDS_QUESTION) {
    return { shouldShow: true, reason: 'question', wordCount }
  }

  // Standard threshold with structure requirement
  if (wordCount >= BUFFER_CONFIG.MIN_WORDS_STANDARD && hasStructure(text)) {
    return { shouldShow: true, reason: 'threshold_met', wordCount }
  }

  // High word count - show regardless of structure
  if (wordCount >= BUFFER_CONFIG.HIGH_WORD_COUNT) {
    return { shouldShow: true, reason: 'high_word_count', wordCount }
  }

  return { shouldShow: false, reason: 'buffering', wordCount }
}
```

## Throttled Content Updates

During streaming, don't re-render on every token. Use throttled snapshots:

```typescript
function ResponseCard({ text, isStreaming, streamStartTime }: Props) {
  const [displayedText, setDisplayedText] = useState(text)
  const lastUpdateRef = useRef(Date.now())

  useEffect(() => {
    if (!isStreaming) {
      // Streaming ended - show final content immediately
      setDisplayedText(text)
      return
    }

    const now = Date.now()
    const elapsed = now - lastUpdateRef.current

    if (elapsed >= BUFFER_CONFIG.CONTENT_THROTTLE_MS) {
      // Enough time passed - update immediately
      setDisplayedText(text)
      lastUpdateRef.current = now
    } else {
      // Schedule update for remaining time
      const timeout = setTimeout(() => {
        setDisplayedText(text)
        lastUpdateRef.current = Date.now()
      }, BUFFER_CONFIG.CONTENT_THROTTLE_MS - elapsed)
      return () => clearTimeout(timeout)
    }
  }, [text, isStreaming])

  // Use displayedText for rendering, not text
  return <Markdown>{displayedText}</Markdown>
}
```

## Integration with TurnCard

```typescript
function TurnCard({ response, ... }: TurnCardProps) {
  // Check if response is buffering
  const isBuffering = useMemo(
    () => isResponseBuffering(response),
    [response]
  )

  // Show thinking indicator while buffering
  const isThinking = shouldShowThinkingIndicator(turnPhase, isBuffering)

  return (
    <div>
      {/* Activity section */}
      {hasActivities && <ActivitySection ... />}
      
      {/* Thinking indicator (shown during buffering) */}
      {isThinking && <ThinkingIndicator />}
      
      {/* Response card (hidden during buffering) */}
      {response && !isBuffering && (
        <ResponseCard
          text={response.text}
          isStreaming={response.isStreaming}
          streamStartTime={response.streamStartTime}
        />
      )}
    </div>
  )
}

function isResponseBuffering(response?: ResponseContent): boolean {
  if (!response) return false
  if (!response.isStreaming) return false
  const decision = shouldShowContent(
    response.text, 
    response.isStreaming, 
    response.streamStartTime
  )
  return !decision.shouldShow
}
```

## Tuning for Different Use Cases

### Chatbot (Show Faster)

```typescript
const CHATBOT_CONFIG = {
  MIN_WORDS_STANDARD: 15,
  MIN_WORDS_CODE: 5,
  MIN_BUFFER_MS: 200,
  MAX_BUFFER_MS: 1000,
  CONTENT_THROTTLE_MS: 150,
}
```

### Code Generation (Wait for Complete Blocks)

```typescript
const CODEGEN_CONFIG = {
  MIN_WORDS_STANDARD: 60,
  MIN_WORDS_CODE: 5,    // But show code early
  MIN_BUFFER_MS: 800,
  MAX_BUFFER_MS: 4000,
  CONTENT_THROTTLE_MS: 500,
}
```

### Documentation (Prioritize Structure)

```typescript
const DOCS_CONFIG = {
  MIN_WORDS_STANDARD: 30,
  MIN_WORDS_HEADER: 5,  // Headers are key
  MIN_WORDS_LIST: 10,
  MIN_BUFFER_MS: 400,
}
```

## Performance Impact

| Approach | Re-renders/sec | CPU Usage | UX |
|----------|----------------|-----------|-----|
| Token-by-token | 50-100 | High | Flickery |
| 300ms throttle | 3-4 | Low | Smooth |
| Smart buffering | 1-2 (then throttled) | Minimal | Professional |

## Source File Reference

- ResponseCard: `packages/ui/src/components/chat/TurnCard.tsx` (ResponseCard section)
- Buffer config: Same file, `BUFFER_CONFIG` constant
