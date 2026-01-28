# Template Partials

This directory contains the composable partial files that are assembled to create the final `CLAUDE.md` output.

## Directory Structure

```
partials/
├── _assembly-order.md      # Assembly sequence documentation
├── SPLIT_PLAN.md           # Original split analysis
├── README.md               # This file
├── 01-header.partial.md
├── 02-iron-rules.partial.md
├── 03-philosophy.partial.md    # DO NOT SPLIT
├── 04-project-structure.partial.md
├── 05-workflow.partial.md
├── 06-cloudflare.partial.md    # Conditional
└── 07-footer.partial.md
```

## Partial Descriptions

| Partial | Purpose | Lines | Conditional |
|---------|---------|-------|-------------|
| 01-header | Project title, metadata variables | ~10 | No |
| 02-iron-rules | Iron Rules 1-6 | ~50 | No |
| 03-philosophy | Core development philosophy | ~90 | No |
| 04-project-structure | Directory structure, tech stack | ~95 | No |
| 05-workflow | Progress tracking, versioning, git | ~240 | No |
| 06-cloudflare | Cloudflare deployment options | ~300 | Yes |
| 07-footer | AI workflows, documentation index | ~265 | No |

## Adding a New Partial

1. Create file with naming convention: `XX-name.partial.md` where XX is the order number
2. Add header comment documenting purpose and variables
3. Update `_assembly-order.md` with the new partial
4. Update assembly logic in `scripts/assemble-template.ts` if conditional
5. Add tests in `tests/assembly.test.ts`

## Variable Reference

### User-Provided Variables
- `{{PROJECT_NAME}}` - Project name
- `{{USER_NAME}}` - Developer name/nickname
- `{{SERVICE_TARGET}}` - Target user description
- `{{INTERACTION_STYLE}}` - Communication style preference
- `{{PROJECT_STRUCTURE}}` - Directory tree
- `{{TECH_STACK_TABLE}}` - Tech stack markdown table
- `{{PROHIBITIONS}}` - Project-specific prohibitions

### Version Variables (from versions.json)
- `{{VERSION_VITE}}` - Vite version
- `{{VERSION_REACT}}` - React version
- `{{VERSION_TYPESCRIPT}}` - TypeScript version
- See `assets/versions.json` for complete list

### Conditional Markers
- `{{#IF CLOUDFLARE_NATIVE}}...{{/IF}}` - Include block for Cloudflare projects

## Rules

1. **Partials are flat** - No partial may reference another partial
2. **One purpose per partial** - Each partial handles one conceptual unit
3. **03-philosophy is sacred** - Never split the core philosophy section
4. **Variables are substituted after assembly** - Write variables as-is in partials
5. **Test before commit** - Run `bun test` to verify assembly works

## Assembly Command

```bash
# Preview output
bun scripts/assemble-template.ts --plan C --name MyProject

# With all options
bun scripts/assemble-template.ts \
  --plan C \
  --name MyProject \
  --var USER_NAME=Dev \
  --var SERVICE_TARGET="B2B Users"
```

---

*Part of project-initializer skill refactor*
