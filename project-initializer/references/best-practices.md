# Best Practices Reference

## 9. Observability

**Principle**: Never deploy without monitoring. Use open-source/free tiers for complete observability.

### Error Tracking
- **Sentry**: Industry standard. Developer-first with generous Free Plan
- **GlitchTip**: Open-source Sentry alternative (self-hosted)

### Product Analytics & Replay
- **PostHog**: Geek's choice. Open-source, all-in-one (analytics + session replay + feature flags)
  - Cloud version has generous free tier
  - Supports Docker self-hosted deployment

### Infrastructure Monitoring
- **Cloudflare Analytics**: Free monitoring for Workers and Pages
- **Vercel Analytics**: Built-in for Vercel deployments

---

## 10. Testing Strategy

**Principle**: Follow the **"Testing Trophy"** model. Prioritize integration tests over unit tests.

### Layered Strategy

| Layer | Purpose | Tools | Priority |
|-------|---------|-------|----------|
| Static Analysis | Catch 80% errors before runtime | TypeScript + Biome | Highest |
| Unit Tests | Test pure logic functions (utils/helpers) | Vitest | Medium |
| Integration Tests | Test component + hook interactions | Vitest + React Testing Library | **Highest** |
| E2E Tests | Test critical business flows (login, checkout) | Playwright | High |

### Tool Recommendations

```bash
# Testing setup
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

### AI Collaboration Prompt
> "Write Vitest test cases for this Hook covering Happy Path and Edge Cases"

---

## 11. State Management Philosophy

**Principle**: State must be strictly classified by lifecycle and scope.

### Priority Order

1. **URL State (First Priority)**
   - **Definition**: Shareable state via links (Search, Filter, Tab, Pagination)
   - **Tools**: nuqs (next-use-query-state) or TanStack Router Search Params
   - **Benefits**: Survives refresh, shareable, SEO-friendly

2. **Server State (Second Priority)**
   - **Definition**: Data from database
   - **Tools**: TanStack Query (React Query)
   - **Benefits**: Auto caching, deduping, revalidation
   - **Anti-pattern**: Never use `useEffect` to fetch data into global store

3. **Client/Global State (Third Priority)**
   - **Definition**: Pure frontend interaction state (sidebar open/close, theme, user session)
   - **Tools**: Zustand (minimal, Hooks-style) or Jotai (atomic, for complex dependencies)

### State Decision Tree

```
Is it shareable via URL?
├─ Yes → URL State (nuqs / TanStack Router)
└─ No → Is it from the server?
         ├─ Yes → Server State (TanStack Query)
         └─ No → Client State (Zustand / Jotai)
```

---

## 12. Engineering Standards

**Principle**: Faster toolchain, less configuration.

### Linting & Formatting

**Biome (Strongly Recommended)**
- Rust-based next-gen toolchain
- Replaces Prettier + ESLint
- Zero config, 30x faster

```bash
# Install Biome
npm install -D @biomejs/biome

# Initialize config
npx @biomejs/biome init
```

### Git Conventions

- Follow **Conventional Commits**:
  ```
  feat: add login page
  fix: button style issue
  docs: update README
  refactor: extract utils
  test: add unit tests
  chore: update dependencies
  ```

- Use `simple-git-hooks` for pre-commit checks:
  ```bash
  npm install -D simple-git-hooks
  ```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1  # or setup-node
      - run: bun install
      - run: bun run biome check .
      - run: bun run tsc --noEmit
      - run: bun run vitest run
```

---

## 13. Security Checklist

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Validate required vars at startup

### API Security
- Use Row Level Security (RLS) with Supabase
- Validate inputs with Zod
- Rate limit public endpoints

### Dependencies
- Regular `npm audit` / `bun audit`
- Use Dependabot or Renovate for updates

---

## 14. Performance Checklist

### Bundle Size
- Analyze with `vite-bundle-visualizer`
- Dynamic imports for heavy components
- Tree-shake unused code

### Runtime Performance
- Virtualize long lists (virtua, react-virtual)
- Memoize expensive computations
- Lazy load images below fold

### Core Web Vitals
- LCP < 2.5s (Largest Contentful Paint)
- FID < 100ms (First Input Delay)
- CLS < 0.1 (Cumulative Layout Shift)

---

## 15. Documentation Standards

### Required Files
- `README.md` - Project overview, quick start
- `CLAUDE.md` - AI development guide
- `docs/brief.md` - Product brief
- `docs/tech-stack.md` - Tech stack decisions
- `docs/PROGRESS.md` - Development progress
- `docs/CHANGELOG.md` - Version history

### Code Comments
- Comment "WHY", not "WHAT"
- English for code comments
- JSDoc for public APIs

### Architecture Decision Records (ADR)
Store in `docs/architecture/decisions/`:
```
docs/architecture/decisions/
├── 001-choose-vite-over-webpack.md
├── 002-supabase-as-backend.md
└── 003-tanstack-router-adoption.md
```

---

## 16. Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Type check passing
- [ ] Biome check passing
- [ ] Environment variables configured
- [ ] Database migrations applied

### Post-deployment
- [ ] Smoke test critical paths
- [ ] Monitor error rates (Sentry)
- [ ] Check performance metrics
- [ ] Verify analytics events

### Rollback Plan
- Document rollback procedure
- Keep previous 3 versions accessible
- Test rollback process regularly
