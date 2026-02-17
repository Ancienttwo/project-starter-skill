/**
 * Template: Tool Result Parser
 * 
 * Use this template to add parsing logic for a new tool.
 * 
 * Steps:
 * 1. Define the result interface
 * 2. Implement the parser function
 * 3. Add to extractOverlayData() routing
 */

// ============================================================================
// Step 1: Define Result Interface
// ============================================================================

/**
 * Parsed result from your tool.
 * Define fields based on what your tool returns.
 */
export interface CustomToolResult {
  // Core content
  content: string
  
  // Optional metadata
  itemCount?: number
  duration?: number
  success?: boolean
  
  // Error handling
  error?: string
}

// ============================================================================
// Step 2: Implement Parser
// ============================================================================

/**
 * Parse raw tool result into structured data.
 * 
 * Handle both:
 * - JSON responses (from SDK)
 * - Plain text responses (fallback)
 * 
 * @param rawContent - The raw tool result string
 * @returns Parsed result with extracted fields
 */
export function parseCustomToolResult(rawContent: string): CustomToolResult {
  // Try JSON parsing first (most SDK tools return JSON)
  try {
    const parsed = JSON.parse(rawContent)
    
    // Handle your tool's specific JSON structure
    // Example structures:
    
    // Structure 1: { result: string, metadata: {...} }
    if (parsed.result !== undefined) {
      return {
        content: parsed.result,
        itemCount: parsed.metadata?.count,
        duration: parsed.metadata?.durationMs,
        success: parsed.success ?? true,
      }
    }
    
    // Structure 2: { data: [...], total: number }
    if (parsed.data && Array.isArray(parsed.data)) {
      return {
        content: JSON.stringify(parsed.data, null, 2),
        itemCount: parsed.total ?? parsed.data.length,
        success: true,
      }
    }
    
    // Structure 3: { content: string }
    if (parsed.content !== undefined) {
      return {
        content: parsed.content,
        success: true,
      }
    }
    
    // Structure 4: { error: string }
    if (parsed.error) {
      return {
        content: '',
        error: parsed.error,
        success: false,
      }
    }
    
    // Unknown JSON structure - stringify it
    return {
      content: JSON.stringify(parsed, null, 2),
      success: true,
    }
    
  } catch {
    // Not JSON - use as plain text
  }
  
  // Plain text fallback
  
  // Check for error patterns in text
  if (rawContent.toLowerCase().includes('error:')) {
    const errorMatch = rawContent.match(/error:\s*(.+)/i)
    return {
      content: rawContent,
      error: errorMatch?.[1] || 'Unknown error',
      success: false,
    }
  }
  
  // Extract metrics from text if present
  const countMatch = rawContent.match(/(\d+)\s+(?:items?|results?|files?)/i)
  const durationMatch = rawContent.match(/(\d+(?:\.\d+)?)\s*(?:ms|seconds?)/i)
  
  return {
    content: rawContent,
    itemCount: countMatch ? parseInt(countMatch[1], 10) : undefined,
    duration: durationMatch ? parseFloat(durationMatch[1]) : undefined,
    success: true,
  }
}

// ============================================================================
// Step 3: Integration with extractOverlayData()
// ============================================================================

/*
Add this case to extractOverlayData() in lib/tool-parsers.ts:

// Custom tool → Your overlay type
if (toolName === 'customtool' || toolName === 'mcp__myserver__customtool') {
  const parsed = parseCustomToolResult(rawContent)
  return {
    type: 'custom',  // or reuse existing type like 'terminal', 'json', etc.
    title: activity.displayName || 'Custom Tool',
    content: parsed.content,
    metadata: {
      itemCount: parsed.itemCount,
      duration: parsed.duration,
    },
    error: parsed.error,
  }
}
*/

// ============================================================================
// Example: Real-world parsers
// ============================================================================

/**
 * Example: Web search tool parser
 */
export interface WebSearchResult {
  query: string
  results: Array<{
    title: string
    url: string
    snippet: string
  }>
  totalResults: number
}

export function parseWebSearchResult(rawContent: string): WebSearchResult {
  try {
    const parsed = JSON.parse(rawContent)
    return {
      query: parsed.query || '',
      results: parsed.results || parsed.items || [],
      totalResults: parsed.totalResults || parsed.results?.length || 0,
    }
  } catch {
    return {
      query: '',
      results: [],
      totalResults: 0,
    }
  }
}

/**
 * Example: Database query tool parser
 */
export interface DatabaseQueryResult {
  rows: unknown[]
  columns: string[]
  rowCount: number
  queryTime: number
}

export function parseDatabaseQueryResult(rawContent: string): DatabaseQueryResult {
  try {
    const parsed = JSON.parse(rawContent)
    
    // Handle different DB result formats
    const rows = parsed.rows || parsed.data || parsed.results || []
    const columns = parsed.columns || 
                    parsed.fields?.map((f: { name: string }) => f.name) ||
                    (rows[0] ? Object.keys(rows[0]) : [])
    
    return {
      rows,
      columns,
      rowCount: parsed.rowCount ?? rows.length,
      queryTime: parsed.queryTime ?? parsed.duration ?? 0,
    }
  } catch {
    return {
      rows: [],
      columns: [],
      rowCount: 0,
      queryTime: 0,
    }
  }
}
