# Partial Assembly Order

This document defines the order in which partials are concatenated to form the final `CLAUDE.md` output.

## Assembly Sequence

```
1. 01-header.partial.md
2. 02-iron-rules.partial.md
3. 03-philosophy.partial.md      ⭐ DO NOT SPLIT
4. 04-project-structure.partial.md
5. 05-workflow.partial.md
6. {{#IF CLOUDFLARE_NATIVE}}06-cloudflare.partial.md{{/IF}}
7. 07-footer.partial.md
```

## Conditional Logic

### 06-cloudflare.partial.md

Include based on Plan Type:

| Plan | Include Cloudflare Section? |
|------|----------------------------|
| Plan A (Remix) | ✅ Yes |
| Plan B (UmiJS) | ❌ No |
| Plan C (Vite + TanStack) | ✅ Yes |
| Plan C+ (AI Chat) | ✅ Yes |
| Plan D (Monorepo) | ✅ Yes |
| Plan F (Mobile/Expo) | ❌ No |
| Plan G (Python Quant) | ⚠️ Partial (Containers only) |
| Plan H (Trading) | ⚠️ Partial (Workers only) |
| Plan J (TUI) | ❌ No |

## Variable Substitution

Variables are substituted AFTER partial concatenation:

1. Concatenate partials in order
2. Replace `{{VARIABLE_NAME}}` with values
3. Process conditional blocks `{{#IF CONDITION}}...{{/IF}}`
4. Output final CLAUDE.md

## Rules

- Partials MUST NOT reference other partials
- Partials are flat, single-level only
- No nested includes allowed
- Maximum 2 rounds of variable substitution (prevents circular references)

---

*Assembly order defined for skill-refactor plan*
