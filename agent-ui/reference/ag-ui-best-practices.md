# AG-UI & assistant-ui Best Practices

When to use AG-UI protocol and assistant-ui library based on product type and use case.

## Industry Adoption

| Partner | Status | Integration |
|---------|--------|-------------|
| **Microsoft Agent Framework** | Official | Native AG-UI |
| **Google ADK** | Official | CopilotKit co-launch |
| **LangChain / LangGraph** | Official | Middleware |
| **Vercel AI SDK** | Official | Runtime adapter |
| **LlamaIndex** | Official | Frontend integration |
| **CrewAI** | Official | Multi-agent frontend |
| **Mastra** | Official | Full-stack agent |
| **AWS Strands** | Partner | Cloud integration |

## Product Type Recommendations

### Strongly Recommended

| Product Type | Typical Use Case | Why AG-UI |
|--------------|------------------|-----------|
| **In-App AI Copilot** | Embedded AI assistant in product | Standard state sync, Frontend Tool Calls |
| **Backoffice Admin** | Internal tools + AI assistant | Via case study: rider management |
| **SaaS AI Features** | B2B software adding AI | 10% Fortune 500 using CopilotKit |
| **Data Dashboard** | AI-driven charts/reports | Generative UI for dynamic interfaces |
| **Form Auto-fill** | Complex forms + conversational | Official CopilotKit example |
| **Project Management** | AI project manager | Task planning, status tracking |
| **Research Tools** | Research Canvas | Multi-source information synthesis |
| **Financial Agent** | Stock portfolio display | Mastra + AG-UI case study |

### Evaluate First

| Product Type | Consideration |
|--------------|---------------|
| **Customer Support Bot** | If simple Q&A only, Vercel AI SDK may be lighter |
| **Pure Text Chat** | If no tool calls needed, assistant-ui may be overkill |
| **Mobile App** | React Native support limited, needs validation |

### Not Recommended

| Product Type | Better Alternative |
|--------------|-------------------|
| **Game-level Real-time** | Custom binary WebSocket |
| **Ultra-low Latency** | Custom protocol |
| **Non-React Stack** | Native AG-UI SDK or custom |

## Real-World Case Studies

### Via (Transportation Company) - January 2026

> "We built a chatbot assistant for our backoffice rider management system using AG-UI, leveraging Frontend Tool Calls for fast web app navigation and Streaming Chat for real-time data delivery."

**Features Used**:
- Frontend Tool Calls (navigation, popups)
- Streaming Chat
- Unified WebSocket channel

### Stock Portfolio Agent (CopilotKit Official)

- Mastra AI agent backend
- AG-UI protocol bridge
- CopilotKit frontend components

### Generative UI Chatbot

- User request → LLM generates UI templates
- Dynamically creates dashboards, tables, charts, cards

## assistant-ui Statistics

| Metric | Value |
|--------|-------|
| **Monthly Downloads** | 450K+ |
| **GitHub Stars** | 8.1K |
| **Dependents** | 42 projects |
| **Y Combinator** | Backed |
| **License** | MIT (free) |

## Decision Matrix

```
What type of project?

├─ SaaS product needs AI features
│   └─► AG-UI + assistant-ui ✅
│
├─ Internal admin tool + AI assistant
│   └─► AG-UI + assistant-ui ✅ (Via case validated)
│
├─ Need Agent to control frontend (navigate, popup, form fill)
│   └─► AG-UI + CopilotKit ✅ (Frontend Tool Calls)
│
├─ Existing WebSocket + need unified chat
│   └─► AG-UI over WebSocket ✅
│
├─ Multi-agent collaboration system
│   └─► AG-UI + LangGraph/CrewAI ✅
│
├─ Simple AI chat (no tool calls)
│   └─► Vercel AI SDK may be lighter
│
└─ Non-React tech stack
    └─► Evaluate native AG-UI SDK or custom
```

## Suitability Rating

| Domain | AG-UI + assistant-ui |
|--------|---------------------|
| **B2B SaaS** | ★★★★★ Best |
| **Internal Tools** | ★★★★★ Best |
| **Data Dashboard** | ★★★★★ Best |
| **Enterprise AI Copilot** | ★★★★★ Best |
| **B2C Consumer Chat** | ★★★ Medium |
| **Mobile** | ★★ Needs validation |
| **Gaming/Ultra-low latency** | ★ Not recommended |

## Key Takeaways

1. **AG-UI is the emerging standard** - Backed by Microsoft, Google, LangChain
2. **assistant-ui provides ChatGPT-quality UX** - 450K+ monthly downloads
3. **Best for B2B/Enterprise** - Internal tools, SaaS, dashboards
4. **Frontend Tool Calls** - Unique capability for agent-driven UI manipulation
5. **WebSocket support** - Can unify chat with other real-time features
