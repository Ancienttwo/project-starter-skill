**Cloudflare Deployment Options (Recommended):**

```yaml
CLOUDFLARE_DEPLOYMENT:
  # ===== Option 1: Pages (Frontend + Functions) =====
  PAGES:
    BEST_FOR: SPA, SSR (Remix/Next.js), Static sites
    FEATURES:
      - Git integration (auto-deploy)
      - Preview URLs for every PR
      - Global CDN (300+ locations)
      - Zero config SSL
    DEPLOY: |
      # Connect GitHub repo in dashboard, or:
      npx wrangler pages deploy dist

  # ===== Option 2: Workers (API Backend) =====
  WORKERS:
    BEST_FOR: REST API, WebSocket, Edge computing
    FEATURES:
      - 0ms cold start (V8 Isolates)
      - Global edge deployment
      - 100k free requests/day
    DEPLOY: |
      npx wrangler deploy

  # ===== Option 3: Containers (Beta) =====
  CONTAINERS:
    BEST_FOR: Python/Go/Rust backends, ML inference, Complex dependencies
    FEATURES:
      - Docker container support
      - Edge deployment
      - Full runtime flexibility
    DEPLOY: |
      # Dockerfile + wrangler.toml
      npx wrangler containers deploy

  # ===== Recommended Architecture =====
  STACK_RECOMMENDATIONS:
    FRONTEND_ONLY:
      -> Pages (auto-deploy from Git)

    FRONTEND_PLUS_API:
      -> Pages (frontend) + Workers (API)
      -> Or Pages with /functions directory

    FULL_STACK_EDGE:
      -> Pages + Workers + D1 + R2

    AI_APPLICATION:
      -> Pages + Workers + Workers AI + Vectorize

    PYTHON_BACKEND:
      -> Pages (frontend) + Containers (FastAPI/Flask)

    MONOREPO:
      -> Turborepo + Pages (apps/web) + Workers (apps/api)
```

**CI/CD Integration:**

```yaml
CI_CD_INTEGRATION:
  GITHUB_ACTIONS:
    release.yml: |
      on:
        push:
          tags: ['v*']
      jobs:
        release:
          - Checkout
          - Install dependencies
          - Run tests
          - Build
          - Deploy to Cloudflare Pages
          - Create GitHub Release

  CLOUDFLARE_PAGES:
    - Auto-deploy on push to main
    - Preview deploys for PRs
    - Instant rollback via dashboard
    - Build cache for faster deploys

  WRANGLER_CI: |
    # GitHub Actions example
    - name: Deploy to Cloudflare
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CF_API_TOKEN }}
        command: pages deploy dist --project-name=my-app

VERSION_IN_CODE:
  # Inject version at build time
  VITE: |
    // vite.config.ts
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }

  RUNTIME_CHECK: |
    // Display version in app
    console.log(`App version: ${__APP_VERSION__}`)
```

**Cloudflare AI Services (Dify Alternative):**

```yaml
CLOUDFLARE_AI_STACK:
  # ===== Workers AI (LLM Calls) =====
  WORKERS_AI:
    MODELS:
      - Llama 3.1 8B/70B (conversation)
      - Mistral 7B (fast inference)
      - BGE Base (Embedding)
      - Whisper (speech-to-text)
      - Flux Schnell (image generation)
    PRICING: $0.011/1k neurons (10x+ cheaper than OpenAI)
    ADVANTAGE: Edge inference, data stays in region

  # ===== AI Gateway (API Management) =====
  AI_GATEWAY:
    FEATURES:
      - Unified calls to OpenAI/Claude/Gemini
      - Request caching (save 50%+ cost)
      - Rate limiting for budget protection
      - Auto fallback
      - Complete audit logs
    USE_CASE: |
      # Call any LLM through Gateway
      fetch("https://gateway.ai.cloudflare.com/v1/{account}/my-gateway/openai/...")

  # ===== AutoRAG (Knowledge Base) =====
  AUTORAG:
    FEATURES:
      - Upload documents, auto-index
      - Automatic chunking + Embedding
      - Vector search + answer generation
    USE_CASE: Enterprise knowledge base, customer service bots

  # ===== Vectorize (Vector Storage) =====
  VECTORIZE:
    FEATURES:
      - Free 5M vectors
      - Seamless integration with Workers AI Embedding
      - Millisecond-level queries
    USE_CASE: RAG, semantic search

  # ===== vs Dify Comparison =====
  COMPARISON:
    | Feature | Dify | Cloudflare |
    |---------|------|------------|
    | LLM calls | Multi-model | Workers AI + AI Gateway |
    | Knowledge base | Built-in | AutoRAG + Vectorize |
    | Workflow | Visual | Code (Workflows) |
    | Deployment | Needs server | Serverless edge |
    | Cost | $$$ | $ (generous free tier) |
    | Latency | Centralized | Edge (global <50ms) |
    | Data privacy | Self-host needed | Edge processing, data stays local |

  # ===== Recommended Strategy =====
  STRATEGY:
    Simple AI apps:
      -> Workers AI (free tier sufficient)

    Production AI:
      -> AI Gateway -> Claude/GPT + Workers AI fallback

    RAG apps:
      -> Vectorize + Workers AI Embedding + AutoRAG

    Complex workflows:
      -> Cloudflare Workflows + Workers AI
      -> Or keep Dify for orchestration, call Workers AI
```

**Durable Objects (State Management Solution):**

```yaml
DURABLE_OBJECTS:
  # ===== Core Capabilities =====
  FEATURES:
    - Globally unique singleton (only one instance per ID)
    - Strong consistency state (no distributed locks needed)
    - Built-in persistent storage (Key-Value + SQL)
    - WebSocket connection management
    - Auto hibernate/wake (pay per use)

  # ===== Typical Use Cases =====
  USE_CASES:
    Real-time collaboration:
      SCENARIO: Multi-user document editing (like Notion/Figma)
      HOW: One DO per document, manages all editors' WebSockets
      EXAMPLE: |
        export class Document {
          connections = new Set<WebSocket>()
          async fetch(request: Request) {
            const [client, server] = Object.values(new WebSocketPair())
            this.connections.add(server)
            server.accept()
            server.addEventListener('message', (msg) => {
              // Broadcast to other editors
              for (const conn of this.connections) {
                if (conn !== server) conn.send(msg.data)
              }
            })
            return new Response(null, { status: 101, webSocket: client })
          }
        }

    Game rooms:
      SCENARIO: Multiplayer game matching/room state
      HOW: One DO per room, manages player state and game logic
      ADVANTAGE: Global low latency (geo-routed)

    Rate limiting:
      SCENARIO: API Rate Limiting
      HOW: One DO per user/API Key
      ADVANTAGE: Strong consistency counting, no Redis needed

    Shopping cart/Sessions:
      SCENARIO: E-commerce cart, user sessions
      HOW: One DO per user, persists cart state
      ADVANTAGE: No external database, auto-persistence

    Distributed locks:
      SCENARIO: Prevent duplicate operations (like payments)
      HOW: Operation ID corresponds to one DO
      ADVANTAGE: Global singleton guarantees atomicity

    Real-time counters:
      SCENARIO: Likes, online users, inventory
      HOW: Resource ID corresponds to one DO
      EXAMPLE: |
        export class Counter {
          value = 0
          async fetch(request: Request) {
            if (request.method === 'POST') this.value++
            return new Response(String(this.value))
          }
        }

  # ===== Storage Options =====
  STORAGE:
    KEY_VALUE:
      API: this.state.storage.get/put/delete
      LIMIT: 128KB per value
      USE_CASE: Simple state, config

    SQL (SQLite):
      API: this.state.storage.sql
      LIMIT: 10GB per DO
      USE_CASE: Complex queries, relational data
      EXAMPLE: |
        const result = await this.state.storage.sql
          .exec("SELECT * FROM messages WHERE room_id = ?", [roomId])

  # ===== Pricing =====
  PRICING:
    Requests: $0.15/million requests
    Duration: $12.50/million GB-s
    Storage: $0.20/GB/month
    Free tier: 100k requests/day + 1GB storage

  # ===== vs Traditional Solutions =====
  COMPARISON:
    | Scenario | Traditional | Durable Objects |
    |----------|------------|-----------------|
    | Real-time collab | Redis Pub/Sub + external DB | Single DO (simpler code) |
    | Distributed lock | Redis SETNX / DB locks | DO singleton (natural atomicity) |
    | Session state | Redis / Memcached | DO storage (built-in persistence) |
    | WebSocket | Needs dedicated server | DO built-in support |
    | Consistency | Eventually consistent | Strongly consistent |

  # ===== Best Practices =====
  BEST_PRACTICES:
    - One DO only manages one "entity" (user/document/room)
    - Avoid frequent communication between DOs (reduce dependencies in design)
    - Use Hibernation API to reduce idle costs
    - Consider SQLite for large data instead of KV
    - Use Queues for async task processing
```

**Quick Commands:**

```bash
# View unreleased changes
git log --oneline $(git describe --tags --abbrev=0)..HEAD

# Suggest next version (AI command)
# /changelog-preview

# Create release (after AI generates CHANGELOG)
npm version minor -m "chore(release): v%s"
git push origin main --tags

# Rollback production (emergency)
git revert HEAD
npm version patch -m "chore(release): rollback v%s"
git push origin main --tags
```
