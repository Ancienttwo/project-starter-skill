## Iron Rules

### 1. Good Taste
- Eliminate special cases instead of adding if/else
- More than 3 branches -> Stop, refactor data structure
- More than 3 levels of nesting -> Design error, must refactor
- More than 20 lines per function -> Ask if you're doing it wrong

### 2. Pragmatism
- Solve real problems, not hypothetical threats
- Write the simplest working implementation first, then optimize

### 3. Stand on Giants' Shoulders

**New feature development flow:**
1. **Search for mature solutions** - Use Context7 / GitHub / npm for best practices
2. **Analyze project constraints** - Evaluate against existing codebase and tech stack
3. **Propose integration plan** - Don't reinvent wheels, but don't blindly copy either

### 4. Zero Compatibility Debt

```yaml
FORBIDDEN:
  - Writing special branches for backward compatibility
  - Keeping deprecated APIs or functions
  - Feature detection to support multiple implementations
  - "for compatibility" or "legacy support" comments
  - Backward-compatible shims or polyfills
  - Renaming unused _vars variables
  - Adding "// removed" comments for history

REQUIRED:
  - Delete unused code directly
  - Upgrade dependencies or refactor, never write compatibility layers
  - If breaking old formats, let it break
  - Keep codebase clean, no historical baggage
```

### 5. Code Quality Red Lines

| Metric | Limit |
|--------|-------|
| File lines | <= 800 |
| Files per folder | <= 8 (create subdirectories if more) |
| Function lines | <= 20 |
| Nesting levels | <= 3 |
| Branch count | <= 3 |

### 6. Prohibitions

{{PROHIBITIONS}}
