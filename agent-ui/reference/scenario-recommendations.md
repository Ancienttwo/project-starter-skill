# Agent UI Scenario Recommendations

Detailed architecture and code patterns for common AI agent scenarios.

## Quick Reference

| Scenario | Transport | Protocol/SDK | UI | Complexity |
|----------|-----------|--------------|-----|------------|
| **Structured Report UI** | SSE | Vercel AI SDK | Custom | ⭐⭐ |
| **Office AI Agent** | SSE/WS | AG-UI or craft-agents | assistant-ui | ⭐⭐⭐⭐ |
| **Messenger Agent** | HTTP | Official SDK | Headless | ⭐⭐⭐ |
| **Spreadsheet Agent** | WebSocket | AG-UI | CopilotKit | ⭐⭐⭐⭐⭐ |

---

## Scenario 1: Structured Report UI

**Examples**: Fortune analysis, Medical reports, Financial reports, Data analysis dashboards

### Characteristics

- One-way streaming ✅
- Structured output (tables, charts, sections)
- No real-time collaboration
- No complex tool calls

### Recommended Stack

```
Transport: SSE
SDK: Vercel AI SDK
UI: Custom React components
Protocol: Not needed (simple streaming)
```

### Architecture

```
User Input → API Route (SSE) → AI generates structured JSON → Render tables/charts
```

### Code Template

```typescript
// app/api/analyze/route.ts
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define structured output schema
const reportSchema = z.object({
  summary: z.string(),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    data: z.array(z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      status: z.enum(['positive', 'neutral', 'negative']).optional(),
    })).optional(),
  })),
  recommendations: z.array(z.string()),
  charts: z.array(z.object({
    type: z.enum(['bar', 'line', 'pie', 'radar']),
    title: z.string(),
    data: z.array(z.object({
      name: z.string(),
      value: z.number(),
    })),
  })).optional(),
});

export async function POST(req: Request) {
  const { input } = await req.json();

  const result = await streamObject({
    model: openai('gpt-4'),
    schema: reportSchema,
    prompt: `Analyze and generate structured report for: ${input}`,
  });

  return result.toTextStreamResponse();
}
```

```tsx
// components/ReportViewer.tsx
'use client';
import { experimental_useObject as useObject } from 'ai/react';

export function ReportViewer() {
  const { object, submit, isLoading } = useObject({
    api: '/api/analyze',
    schema: reportSchema,
  });

  return (
    <div>
      {object?.sections?.map((section, i) => (
        <div key={i} className="mb-8">
          <h2 className="text-xl font-bold">{section.title}</h2>
          <p>{section.content}</p>
          {section.data && (
            <table className="w-full mt-4">
              <tbody>
                {section.data.map((row, j) => (
                  <tr key={j}>
                    <td>{row.label}</td>
                    <td className={row.status === 'positive' ? 'text-green-500' : ''}>
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
```

### When to Use

- Reports with predictable structure
- Data visualization dashboards
- Analysis tools with tabular output
- No need for agent to control UI

---

## Scenario 2: Office AI Agent (Coding Agent Style)

**Examples**: Code assistants, Document editors, Local productivity tools

### Characteristics

- Tool calls (file operations, code execution)
- Streaming responses
- Local version (Electron) + Web version
- Pop-up authorization

### Recommended Stack

```
Transport: SSE (simple) or WebSocket (if other real-time features)
Protocol: AG-UI (standard) or craft-agents (full control)
UI: assistant-ui or custom TurnCard
Deployment: Electron (local) + Cloudflare Sandbox (web)
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Office AI Agent                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────────────┐   │
│  │  Local Version  │         │     Web Version         │   │
│  │  (Electron)     │         │  (Cloudflare Sandbox)   │   │
│  └────────┬────────┘         └────────────┬────────────┘   │
│           │                               │                 │
│           ▼                               ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Shared Event Processor                  │   │
│  │  (Pure functions, same code for both versions)       │   │
│  └─────────────────────────────────────────────────────┘   │
│           │                               │                 │
│           ▼                               ▼                 │
│  ┌─────────────────┐         ┌─────────────────────────┐   │
│  │  Native Tools   │         │   Sandboxed Tools       │   │
│  │  - File system  │         │   - Isolated FS         │   │
│  │  - Shell exec   │         │   - Container exec      │   │
│  │  - Full access  │         │   - Limited access      │   │
│  └─────────────────┘         └─────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Template (AG-UI approach)

```typescript
// Server: AG-UI event emitter
import { AGUIServer } from '@ag-ui/server';

const server = new AGUIServer();

server.onMessage(async (message, emit) => {
  emit({ type: 'RUN_STARTED', runId: 'run_1' });
  
  // Stream text
  for await (const chunk of llm.stream(message)) {
    emit({ 
      type: 'TEXT_MESSAGE_CONTENT', 
      messageId: 'msg_1',
      content: chunk 
    });
  }
  
  // Tool call
  emit({ type: 'TOOL_CALL_START', callId: 'tc_1', name: 'read_file' });
  emit({ type: 'TOOL_CALL_ARGS', callId: 'tc_1', args: { path: './src/index.ts' } });
  
  const content = await readFile('./src/index.ts');
  emit({ type: 'TOOL_CALL_RESULT', callId: 'tc_1', result: content });
  
  emit({ type: 'RUN_FINISHED', runId: 'run_1' });
});
```

```tsx
// Client: assistant-ui integration
import { AssistantRuntimeProvider, Thread } from '@assistant-ui/react';
import { useAGUIRuntime } from '@assistant-ui/react-ag-ui';

function OfficeAgent() {
  const runtime = useAGUIRuntime({
    endpoint: '/api/agent',
    // Or WebSocket
    // transport: 'websocket',
    // url: 'ws://localhost:3001',
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1">
          <Thread />
        </main>
        <ToolResultPanel />
      </div>
    </AssistantRuntimeProvider>
  );
}
```

### When to Use

- Code editors with AI assistance
- Document processing tools
- Local-first applications with web fallback
- Tools requiring file system access

---

## Scenario 3: Messenger Agent (WhatsApp/Telegram/Slack)

**Examples**: WhatsApp bots, Telegram bots, Slack assistants, SMS agents

### Characteristics

- **Headless** - No UI rendering
- Text/voice only
- No pop-up authorization possible
- Conversational confirmation required

### Recommended Stack

```
Transport: Platform webhook (HTTP)
SDK: Official AI SDK (lightest)
UI: None (headless)
Authorization: Conversational ("Reply YES to confirm")
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Messenger Agent                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WhatsApp/Telegram/Slack                                    │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │    Webhook      │  (HTTP POST from platform)             │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Message Router                          │   │
│  │  - Parse incoming message                            │   │
│  │  - Check pending confirmations                       │   │
│  │  - Route to appropriate handler                      │   │
│  └────────┬────────────────────────────────────────────┘   │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Event Processor (Headless)              │   │
│  │  - No UI components                                  │   │
│  │  - Text-only tool results                            │   │
│  │  - Conversational authorization                      │   │
│  └────────┬────────────────────────────────────────────┘   │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │  Platform API   │  (Send response back)                  │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Template

```typescript
// Headless event processor for messenger
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface PendingConfirmation {
  action: string;
  description: string;
  args: Record<string, unknown>;
  expiresAt: number;
}

const pendingConfirmations = new Map<string, PendingConfirmation>();

export async function handleMessengerMessage(
  chatId: string,
  message: string,
  sendMessage: (chatId: string, text: string) => Promise<void>
) {
  // Check if this is a confirmation response
  if (message.toUpperCase() === 'YES') {
    const pending = pendingConfirmations.get(chatId);
    if (pending && Date.now() < pending.expiresAt) {
      pendingConfirmations.delete(chatId);
      // Execute the confirmed action
      const result = await executeAction(pending.action, pending.args);
      await sendMessage(chatId, `✅ Done: ${result}`);
      return;
    }
  }

  if (message.toUpperCase() === 'NO') {
    pendingConfirmations.delete(chatId);
    await sendMessage(chatId, '❌ Action cancelled.');
    return;
  }

  // Process with AI
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    tools: [
      {
        name: 'send_email',
        description: 'Send an email',
        input_schema: {
          type: 'object',
          properties: {
            to: { type: 'string' },
            subject: { type: 'string' },
            body: { type: 'string' },
          },
          required: ['to', 'subject', 'body'],
        },
      },
    ],
    messages: [{ role: 'user', content: message }],
  });

  for (const block of response.content) {
    if (block.type === 'text') {
      await sendMessage(chatId, block.text);
    }
    
    if (block.type === 'tool_use') {
      // Request conversational confirmation (NO pop-up!)
      pendingConfirmations.set(chatId, {
        action: block.name,
        description: `${block.name}: ${JSON.stringify(block.input)}`,
        args: block.input as Record<string, unknown>,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      });
      
      await sendMessage(chatId, 
        `🤖 I need to perform an action:\n\n` +
        `**${block.name}**\n` +
        `${JSON.stringify(block.input, null, 2)}\n\n` +
        `Reply YES to confirm or NO to cancel.`
      );
      return; // Wait for confirmation
    }
  }
}
```

```typescript
// WhatsApp webhook handler (using official API)
export async function POST(req: Request) {
  const body = await req.json();
  
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return new Response('OK');
  
  const chatId = message.from;
  const text = message.text?.body || '';
  
  await handleMessengerMessage(chatId, text, sendWhatsAppMessage);
  
  return new Response('OK');
}

async function sendWhatsAppMessage(chatId: string, text: string) {
  await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: chatId,
      text: { body: text },
    }),
  });
}
```

### When to Use

- Bots on messaging platforms
- Voice assistants
- SMS-based agents
- Any scenario without visual UI

---

## Scenario 4: Spreadsheet Agent (Web Excel Control)

**Examples**: Financial modeling, Data analysis with SpreadJS, Budget planning, Forecasting

### Characteristics

- **MUST use WebSocket** (real-time cell sync)
- **MUST use AG-UI** (Frontend Tool Calls)
- Agent controls spreadsheet (navigate, edit, formula)
- Unified channel for chat + spreadsheet events

### Recommended Stack

```
Transport: WebSocket (required!)
Protocol: AG-UI (required - Frontend Tool Calls)
UI: CopilotKit + assistant-ui
Spreadsheet: SpreadJS / Handsontable / AG Grid
```

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Spreadsheet Agent                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Frontend (React)                                              │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   ┌─────────────┐         ┌─────────────────────────┐   │   │
│   │   │  Chat Panel │         │     SpreadJS            │   │   │
│   │   │  (CopilotKit)│         │     (Web Excel)         │   │   │
│   │   └──────┬──────┘         └────────────┬────────────┘   │   │
│   │          │                             │                │   │
│   │          └──────────┬──────────────────┘                │   │
│   │                     │                                   │   │
│   │                     ▼                                   │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │           AG-UI Client                          │   │   │
│   │   │   (Unified event handling)                      │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   │                     │                                   │   │
│   │                     ▼                                   │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │           WebSocket (Unified Channel)           │   │   │
│   │   │                                                 │   │   │
│   │   │   Chat Events:                                  │   │   │
│   │   │   - TEXT_MESSAGE_CONTENT                        │   │   │
│   │   │   - TOOL_CALL_START/RESULT                      │   │   │
│   │   │                                                 │   │   │
│   │   │   Spreadsheet Events:                           │   │   │
│   │   │   - CELL_UPDATED                                │   │   │
│   │   │   - FORMULA_CALCULATED                          │   │   │
│   │   │   - SELECTION_CHANGED                           │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   Agent Server                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │           AG-UI Server                          │   │   │
│   │   │   (Event routing + encoding)                    │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   │                     │                                   │   │
│   │                     ▼                                   │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │           Financial Agent                       │   │   │
│   │   │                                                 │   │   │
│   │   │   Tools:                                        │   │   │
│   │   │   - analyze_data(range)                         │   │   │
│   │   │   - create_formula(cell, formula)               │   │   │
│   │   │   - build_model(type, params)                   │   │   │
│   │   │                                                 │   │   │
│   │   │   Frontend Tools (AG-UI special):               │   │   │
│   │   │   - navigate_to_cell(sheet, cell)               │   │   │
│   │   │   - highlight_range(range, color)               │   │   │
│   │   │   - create_chart(type, data_range)              │   │   │
│   │   │   - show_tooltip(cell, message)                 │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Code Template

```typescript
// Server: AG-UI with Frontend Tool Calls
import { AGUIServer, EventEmitter } from '@ag-ui/server';

const frontendTools = [
  {
    name: 'navigate_to_cell',
    description: 'Navigate spreadsheet to a specific cell',
    parameters: {
      type: 'object',
      properties: {
        sheet: { type: 'string', description: 'Sheet name' },
        cell: { type: 'string', description: 'Cell reference like A1, B5' },
      },
      required: ['cell'],
    },
    // Mark as frontend tool - executed by client, not server
    frontend: true,
  },
  {
    name: 'set_cell_value',
    description: 'Set a value or formula in a cell',
    parameters: {
      type: 'object',
      properties: {
        cell: { type: 'string' },
        value: { type: 'string' },
        isFormula: { type: 'boolean' },
      },
      required: ['cell', 'value'],
    },
    frontend: true,
  },
  {
    name: 'highlight_range',
    description: 'Highlight a range of cells',
    parameters: {
      type: 'object',
      properties: {
        range: { type: 'string', description: 'Range like A1:D10' },
        color: { type: 'string', description: 'Highlight color' },
      },
      required: ['range'],
    },
    frontend: true,
  },
  {
    name: 'create_chart',
    description: 'Create a chart from data range',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['bar', 'line', 'pie', 'area'] },
        dataRange: { type: 'string' },
        title: { type: 'string' },
      },
      required: ['type', 'dataRange'],
    },
    frontend: true,
  },
];

server.onMessage(async (message, emit, context) => {
  emit({ type: 'RUN_STARTED', runId: context.runId });

  const response = await llm.chat({
    messages: [{ role: 'user', content: message }],
    tools: frontendTools,
  });

  for (const block of response.content) {
    if (block.type === 'text') {
      emit({
        type: 'TEXT_MESSAGE_CONTENT',
        messageId: context.messageId,
        content: block.text,
      });
    }

    if (block.type === 'tool_use') {
      // Emit tool call - frontend will execute it
      emit({
        type: 'TOOL_CALL_START',
        callId: block.id,
        name: block.name,
      });
      emit({
        type: 'TOOL_CALL_ARGS',
        callId: block.id,
        args: block.input,
      });
      // Frontend will send TOOL_CALL_RESULT back
    }
  }
});
```

```tsx
// Client: CopilotKit + SpreadJS integration
import { CopilotKit, useCopilotAction } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import { useSpreadJS } from './useSpreadJS';

function FinancialModelAgent() {
  const spreadjs = useSpreadJS();

  // Register frontend tools that AG-UI can call
  useCopilotAction({
    name: 'navigate_to_cell',
    description: 'Navigate to a cell',
    parameters: [
      { name: 'sheet', type: 'string' },
      { name: 'cell', type: 'string', required: true },
    ],
    handler: async ({ sheet, cell }) => {
      if (sheet) spreadjs.setActiveSheet(sheet);
      spreadjs.setActiveCell(cell);
      spreadjs.scrollToCell(cell);
      return { success: true, navigatedTo: cell };
    },
  });

  useCopilotAction({
    name: 'set_cell_value',
    description: 'Set cell value or formula',
    parameters: [
      { name: 'cell', type: 'string', required: true },
      { name: 'value', type: 'string', required: true },
      { name: 'isFormula', type: 'boolean' },
    ],
    handler: async ({ cell, value, isFormula }) => {
      if (isFormula) {
        spreadjs.setFormula(cell, value);
      } else {
        spreadjs.setValue(cell, value);
      }
      return { success: true, cell, value };
    },
  });

  useCopilotAction({
    name: 'highlight_range',
    description: 'Highlight cells',
    parameters: [
      { name: 'range', type: 'string', required: true },
      { name: 'color', type: 'string' },
    ],
    handler: async ({ range, color }) => {
      spreadjs.setRangeStyle(range, {
        backgroundColor: color || '#FFEB3B',
      });
      return { success: true };
    },
  });

  useCopilotAction({
    name: 'create_chart',
    description: 'Create a chart',
    parameters: [
      { name: 'type', type: 'string', required: true },
      { name: 'dataRange', type: 'string', required: true },
      { name: 'title', type: 'string' },
    ],
    handler: async ({ type, dataRange, title }) => {
      spreadjs.insertChart(type, dataRange, { title });
      return { success: true, chartType: type };
    },
  });

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex h-screen">
        <div className="w-1/3 border-r">
          <CopilotChat
            labels={{
              title: 'Financial Model Assistant',
              initial: 'How can I help with your financial model?',
            }}
          />
        </div>
        <div className="w-2/3">
          <SpreadJSComponent ref={spreadjs.ref} />
        </div>
      </div>
    </CopilotKit>
  );
}
```

### Example Interaction Flow

```
User: "Calculate NPV for the cash flows in column D with 10% discount rate"

Agent thinking...
  1. Navigate to data range
  2. Analyze cash flow structure  
  3. Insert NPV formula
  4. Highlight result

AG-UI Events:
→ TOOL_CALL_START: navigate_to_cell
→ TOOL_CALL_ARGS: { sheet: "财务模型", cell: "D1" }
← TOOL_CALL_RESULT: { success: true }

→ TEXT_MESSAGE_CONTENT: "我看到 D 列包含 D2:D11 的现金流数据..."

→ TOOL_CALL_START: set_cell_value
→ TOOL_CALL_ARGS: { cell: "D12", value: "=NPV(0.1,D2:D11)", isFormula: true }
← TOOL_CALL_RESULT: { success: true, cell: "D12" }

→ TOOL_CALL_START: highlight_range
→ TOOL_CALL_ARGS: { range: "D12", color: "#4CAF50" }
← TOOL_CALL_RESULT: { success: true }

→ TEXT_MESSAGE_CONTENT: "NPV 计算完成，结果在 D12 单元格，已用绿色标注。"
→ RUN_FINISHED
```

### When to Use

- Financial modeling tools
- Data analysis with spreadsheets
- Budget planning applications
- Any scenario where AI needs to manipulate spreadsheet UI

---

## Summary: Decision Tree

```
What are you building?

├─ Structured reports/analysis (tables, charts)
│   └─► SSE + Vercel AI SDK + Custom UI
│
├─ Coding agent / Office assistant
│   ├─ Local only
│   │   └─► craft-agents patterns (full control)
│   ├─ Web only
│   │   └─► AG-UI + assistant-ui
│   └─ Both local + web
│       └─► Shared event processor + platform adapters
│
├─ Messaging platform bot (WhatsApp/Telegram/Slack)
│   └─► Official SDK + Headless + Conversational auth
│
└─ Spreadsheet/data manipulation
    └─► WebSocket + AG-UI + CopilotKit (MUST use Frontend Tool Calls)
```
