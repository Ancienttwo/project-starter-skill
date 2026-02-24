# Template Partials

This directory contains composable partial files used to build `CLAUDE.md`.

## Directory Structure

```
partials/
├── _assembly-order.md
├── SPLIT_PLAN.md
├── README.md
├── 01-header.partial.md
├── 02-iron-rules.partial.md
├── 03-philosophy.partial.md      # DO NOT SPLIT
├── 04-project-structure.partial.md
├── 05-workflow.partial.md
├── 06-cloudflare.partial.md      # Conditional
├── 07-footer.partial.md
└── 08-orchestration.partial.md   # Workflow orchestration protocol
```

## Partial Descriptions

| Partial | Purpose | Conditional |
|---------|---------|-------------|
| 01-header | Project metadata variables | No |
| 02-iron-rules | Core engineering constraints | No |
| 03-philosophy | Development protocol philosophy | No |
| 04-project-structure | Repo structure and stack overview | No |
| 05-workflow | Plan loop, task tracking, progress protocol | No |
| 06-cloudflare | Cloudflare deployment guidance | Yes |
| 07-footer | Docs index and first principles | No |
| 08-orchestration | Plan/subagent/verification orchestration | No |

## Variable Reference

### User Variables
- `{{PROJECT_NAME}}`
- `{{USER_NAME}}`
- `{{SERVICE_TARGET}}`
- `{{INTERACTION_STYLE}}`
- `{{PROJECT_STRUCTURE}}`
- `{{TECH_STACK_TABLE}}`
- `{{PROHIBITIONS}}`

### Version Variables
- Generated from `assets/versions.json` as `VERSION_*` keys

### Conditional Markers
- `{{#IF CLOUDFLARE_NATIVE}}...{{/IF}}`

## Rules

1. Keep each partial narrowly focused
2. Keep `03-philosophy.partial.md` unsplit
3. Run tests after edits: `bun test`
4. Move verbose configs into reference files when possible
