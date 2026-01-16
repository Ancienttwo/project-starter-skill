# Recommended Claude Code Plugins

Plugin sources, descriptions, and installation guide for project initialization.

---

## Essential Plugins (Must-Have)

These plugins are critical for professional development workflows:

| Plugin | Source | Repository | Description |
|--------|--------|------------|-------------|
| `feature-dev` | Official | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev) | Guided feature development with codebase understanding and architecture focus |
| `frontend-design` | Official | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design) | Create distinctive, production-grade frontend interfaces with high design quality |
| `code-simplifier` | Official | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier) | Simplifies and refines code for clarity, consistency, and maintainability |
| `code-review` | Official | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-review) | Reviews code for bugs, logic errors, security vulnerabilities, and quality issues |
| `ast-grep` | Community | [ast-grep/claude-skill](https://github.com/ast-grep/claude-skill) | AST-based code search - "Find all async functions without error handling" |

---

## Official Anthropic Plugins

From [claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins):

### Development Tools

| Plugin | Description |
|--------|-------------|
| `agent-sdk-dev` | Development tools for the Agent SDK |
| `plugin-dev` | Plugin development tools |
| `commit-commands` | Git commit command utilities |
| `pr-review-toolkit` | Pull request review toolkit |
| `security-guidance` | Security best practices guidance |
| `hookify` | **⭐推荐** 自动创建hooks，无需手动编辑JSON |

### Automation & Style Plugins

| Plugin | Description |
|--------|-------------|
| `ralph-loop` | Iterative auto-loop until task complete - TDD workflow automation |
| `explanatory-output-style` | 让 Claude 在写代码时提供教育性解释 |
| `learning-output-style` | 学习模式输出风格 |

### hookify - 智能 Hook 管理器 ⭐

**Repository:** [anthropics/claude-plugins-official/plugins/hookify](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/hookify)

自动化创建 hooks 的神器，无需手动编辑 JSON 配置：

**核心功能:**
- 分析对话自动发现不良行为并生成规则
- 简单的 markdown 配置格式 (YAML frontmatter)
- 支持 `warn` (警告) / `block` (阻止) 两种模式
- 即时生效，无需重启

**使用示例:**
```bash
/hookify "阻止rm -rf命令"           # 从描述创建规则
/hookify                            # 分析最近对话，自动发现问题行为
/hookify:list                       # 查看所有规则
/hookify:configure                  # 启用/禁用规则
```

**规则示例 (.claude/block-dangerous-rm.local.md):**
```yaml
---
name: block-dangerous-rm
enabled: true
event: bash
pattern: rm\s+-rf
action: block
---

⚠️ **Dangerous rm command detected!**
This command could delete important files.
```

**支持的事件类型:**
- `bash` - Bash 命令触发
- `file` - Edit/Write 文件操作触发
- `stop` - Claude 想要停止时触发
- `prompt` - 用户提交 prompt 时触发
- `all` - 所有事件

**典型用例:**
- 阻止危险命令 (`rm -rf`, `DROP TABLE`)
- 强制测试 (停止前必须运行测试)
- 保护敏感文件 (`.env`, credentials)
- 代码质量检查 (警告 `console.log`, hardcoded secrets)

**ralph-loop** implements an iterative, self-referential AI loop. It automatically re-feeds prompts until a completion promise is detected.

**Usage:**
```bash
/ralph-loop "Build a REST API for todos. Requirements: CRUD, validation, tests. Output <promise>COMPLETE</promise> when done." --completion-promise "COMPLETE" --max-iterations 50
```

**Best for:**
- Well-defined tasks with clear success criteria
- TDD workflows (write tests → implement → run tests → fix → repeat)
- Greenfield projects with automatic verification
- Tasks you can walk away from

**Not good for:**
- Tasks requiring human judgment
- Unclear success criteria
- Production debugging

### Language Server Plugins

Choose based on your tech stack:

| Plugin | Language | Use When |
|--------|----------|----------|
| `typescript-lsp` | TypeScript/JavaScript | React, Node.js, Vite projects |
| `pyright-lsp` | Python | FastAPI, Django, ML projects |
| `rust-analyzer-lsp` | Rust | Rust backend, WASM projects |
| `gopls-lsp` | Go | Go microservices |
| `clangd-lsp` | C/C++ | Native applications |
| `jdtls-lsp` | Java | Enterprise Java, Spring |
| `kotlin-lsp` | Kotlin | Android, JVM projects |
| `swift-lsp` | Swift | iOS/macOS development |
| `php-lsp` | PHP | Laravel, WordPress |
| `lua-lsp` | Lua | Game development, Neovim |
| `csharp-lsp` | C# | .NET, Unity |

#### LSP Auto-Selection by Project Type

When using `/project-init`, LSP plugins are automatically selected based on project type:

| Project Type | Plan | Auto-Selected LSP |
|--------------|------|-------------------|
| B2B SaaS / Internal Tools | Plan C | `typescript-lsp` |
| Traditional Enterprise | Plan B | `jdtls-lsp` |
| C-Side with SEO (Remix) | Plan A | `typescript-lsp` |
| AI Chat / Assistant | Plan C | `typescript-lsp` |
| Mobile App (Expo) | Plan F | `typescript-lsp` |
| Monorepo | Plan D | `typescript-lsp` |
| AI Quantitative Trading | Plan G | `pyright-lsp` |
| Financial Trading (FIX/Rust) | Plan H | `rust-analyzer-lsp` |
| AI Coding Agent / TUI | Plan J | `typescript-lsp` |

---

## External Plugins (第三方集成)

From [claude-plugins-official/external_plugins](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins):

### 项目管理 & 协作

| Plugin | Description |
|--------|-------------|
| `linear` | Linear 项目管理集成 - 查看/创建 issues, 管理 sprints |
| `asana` | Asana 任务管理集成 |
| `github` | GitHub API 深度集成 - Issues, PRs, Actions |
| `gitlab` | GitLab API 集成 - MRs, Pipelines |
| `slack` | Slack 消息/通知集成 |

### 代码审查 & 质量

| Plugin | Description |
|--------|-------------|
| `greptile` | **⭐推荐** AI 代码审查 - 自动审PR，解析评论 |

**greptile** 是一个 AI 代码审查 Agent，自动审查 GitHub/GitLab PR：

```bash
# 查看 Greptile 在当前 PR 上的评论
"Show me Greptile's comments on my current PR"

# 触发新的代码审查
"Trigger a Greptile review on this branch"
```

设置: 在 [greptile.com](https://greptile.com) 注册，设置 `GREPTILE_API_KEY` 环境变量。

### 后端服务集成

| Plugin | Description |
|--------|-------------|
| `supabase` | Supabase 数据库/Auth/Storage 集成 |
| `firebase` | Firebase 服务集成 - Firestore, Auth, Functions |
| `stripe` | Stripe 支付集成 - 订阅, 账单, Webhooks |

### 测试 & 自动化

| Plugin | Description |
|--------|-------------|
| `playwright` | Playwright 浏览器自动化测试 |

### 其他工具

| Plugin | Description |
|--------|-------------|
| `context7` | 获取最新库文档 (已集成为 MCP Server) |
| `laravel-boost` | Laravel PHP 框架增强 |
| `serena` | 代码质量分析 |

---

## Community Plugins

### ast-grep Skill

**Repository:** [ast-grep/claude-skill](https://github.com/ast-grep/claude-skill)

**Capabilities:**

- Structure-aware code searching across JS, Python, Rust, Go, Java, C/C++, Ruby, PHP
- Pattern matching with metavariables (`$VAR`)
- Contextual queries (e.g., find setState inside useEffect)
- Code quality checks (unused vars, missing null checks)

**Prerequisites:** Install ast-grep CLI first:

```bash
# macOS
brew install ast-grep

# npm
npm install -g @ast-grep/cli

# cargo
cargo install ast-grep
```

### Obsidian Skills

From [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills):

| Plugin | Description |
|--------|-------------|
| `obsidian-markdown` | Create and edit Obsidian Flavored Markdown with wikilinks, embeds, callouts |
| `obsidian-bases` | Support for Obsidian Bases syntax for structured data |
| `json-canvas` | Work with JSON Canvas format for visual note organization |

---

## Hook Configuration Templates

### Standard Hooks (Recommended)

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "echo '\u001b[1;33m🛡️ Quality guard active...\u001b[0m'"
      }
    ],
    "PreToolCall": [
      {
        "matcher": "Edit|Write",
        "command": "echo '\u001b[0;34m📝 Code modification detected\u001b[0m'"
      }
    ],
    "PostToolCall": [
      {
        "matcher": "Bash\\(.*test.*\\)",
        "command": "echo '\u001b[0;32m✅ Tests completed\u001b[0m'"
      }
    ]
  }
}
```

### Minimal Hooks

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "echo '\u001b[1;33m🛡️ Quality guard active...\u001b[0m'"
      }
    ]
  }
}
```

### Custom Hook Examples

**Anti-simplification guard:**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "python3 ~/.claude/hooks/anti-simplification-guard.py"
      }
    ]
  }
}
```

**Build validation:**
```json
{
  "hooks": {
    "PostToolCall": [
      {
        "matcher": "Write\\(.*\\.tsx?\\)",
        "command": "npx tsc --noEmit 2>&1 | head -20"
      }
    ]
  }
}
```

**Biome lint/format on save (推荐):**
```json
{
  "hooks": {
    "PostToolCall": [
      {
        "matcher": "Write\\(.*\\.(ts|tsx|js|jsx|json)\\)",
        "command": "bunx biome check --write \"$CLAUDE_FILE_PATH\" 2>&1 | head -10"
      }
    ]
  }
}
```

**Biome CI check (严格模式):**
```json
{
  "hooks": {
    "PostToolCall": [
      {
        "matcher": "Write\\(.*\\.(ts|tsx|js|jsx)\\)",
        "command": "bunx biome ci \"$CLAUDE_FILE_PATH\" 2>&1 | head -20"
      }
    ]
  }
}
```

---

## Installation Commands

### Quick Install (Essential Plugins)

```bash
# Run the setup script
~/.claude/skills/project-initializer/scripts/setup-plugins.sh
```

### Manual Installation

```bash
CLAUDE_DIR="$HOME/.claude"
SKILLS_DIR="$CLAUDE_DIR/skills"

# Clone official plugins
git clone https://github.com/anthropics/claude-plugins-official.git "$CLAUDE_DIR/plugins-official"

# Install essential plugins
cp -r "$CLAUDE_DIR/plugins-official/plugins/feature-dev" "$SKILLS_DIR/"
cp -r "$CLAUDE_DIR/plugins-official/plugins/frontend-design" "$SKILLS_DIR/"
cp -r "$CLAUDE_DIR/plugins-official/plugins/code-simplifier" "$SKILLS_DIR/"
cp -r "$CLAUDE_DIR/plugins-official/plugins/code-review" "$SKILLS_DIR/"

# Install ast-grep skill
git clone https://github.com/ast-grep/claude-skill.git "$CLAUDE_DIR/ast-grep-skill"
cp -r "$CLAUDE_DIR/ast-grep-skill"/*.md "$SKILLS_DIR/ast-grep/" 2>/dev/null || \
  mkdir -p "$SKILLS_DIR/ast-grep" && cp "$CLAUDE_DIR/ast-grep-skill"/*.md "$SKILLS_DIR/ast-grep/"
```

---

## Plugin Categories by Project Type

### B2B SaaS / Internal Tools (Plan C)

**Essential:**
- `feature-dev` - Feature development workflow
- `frontend-design` - UI/UX implementation
- `code-simplifier` - Code maintainability
- `code-review` - Quality assurance

**Recommended:**
- `typescript-lsp` - TypeScript support
- `commit-commands` - Git workflow

### AI/ML Projects (Plan G)

**Essential:**
- `feature-dev`
- `code-review`
- `ast-grep` - Complex pattern matching

**Recommended:**
- `pyright-lsp` - Python support
- `security-guidance` - API security

### Mobile Development (Plan F)

**Essential:**
- `feature-dev`
- `frontend-design`
- `code-simplifier`

**Recommended:**
- `typescript-lsp` - React Native/Expo
- `kotlin-lsp` - Android Native/KMP
- `swift-lsp` - iOS Native/SwiftUI

### TUI Terminal / AI Coding Agent (Plan J)

**Essential:**
- `feature-dev`
- `code-simplifier`
- `agent-sdk-dev` - Claude Agent SDK 集成

**Recommended:**
- `typescript-lsp` - OpenTUI/Ink项目
- `rust-analyzer-lsp` - Ratatui/Tauri项目

### Documentation-Heavy Projects

**Essential:**
- `code-simplifier`

**Recommended:**
- `obsidian-markdown`
- `obsidian-bases`
- `json-canvas`

---

## Permissions Configuration

Add to `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Skill(feature-dev)",
      "Skill(feature-dev:*)",
      "Skill(frontend-design)",
      "Skill(frontend-design:*)",
      "Skill(code-simplifier)",
      "Skill(code-simplifier:*)",
      "Skill(code-review)",
      "Skill(code-review:*)",
      "Skill(ast-grep)",
      "Skill(ast-grep:*)"
    ]
  }
}
```

---

## Usage After Installation

```
/feature-dev      - Start guided feature development
/frontend-design  - Create production-grade UI
/code-simplifier  - Simplify and refine code
/code-review      - Review code for issues
/ast-grep         - AST-based code search (prefix with "Use ast-grep to...")
```

---

## Hookify Advanced: 在 Hooks 中激活 Skills ⭐

Hookify 不仅可以发出警告或阻止操作，还可以通过 hooks 自动调用其他 skills，实现智能化的开发工作流。

### 工作原理

当 hook 触发时，你可以在规则消息中引导 Claude 调用特定 skill：

```markdown
---
name: auto-review-on-commit
enabled: true
event: bash
pattern: git\s+commit
action: warn
---

📋 **即将提交代码**

在提交前，请先运行代码审查确保质量：

**建议执行：** `/code-review` 检查当前更改
```

### 实际场景示例

#### 1. 写完代码自动触发代码简化

`.claude/hookify.auto-simplify.local.md`:
```markdown
---
name: auto-simplify-on-write
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(ts|tsx)$
action: warn
---

✨ **TypeScript 文件已修改**

为确保代码质量，建议执行代码简化：

**执行命令：** `/code-simplifier`

这将：
- 检查函数复杂度
- 优化代码可读性
- 移除重复代码
```

#### 2. 创建新组件时自动调用设计 skill

`.claude/hookify.component-design.local.md`:
```markdown
---
name: auto-design-component
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: /components/.*\.(tsx|jsx)$
  - field: new_text
    operator: contains
    pattern: export function
action: warn
---

🎨 **新组件创建中**

检测到新 React 组件，建议使用前端设计技能确保 UI 质量：

**执行命令：** `/frontend-design`

这将确保：
- 遵循设计系统规范
- 使用正确的 shadcn/ui 组件
- 实现高质量的交互效果
```

#### 3. 修改敏感文件时自动安全审查

`.claude/hookify.security-review.local.md`:
```markdown
---
name: auto-security-review
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: (auth|security|password|token|credential)
action: warn
---

🔐 **敏感文件修改检测**

此文件涉及安全相关功能，建议执行安全审查：

**执行命令：** `/code-review --focus security`

检查项：
- 是否有硬编码的密钥/令牌
- 输入验证是否完善
- 权限检查是否正确
```

#### 4. 完成任务前强制代码审查

`.claude/hookify.require-review.local.md`:
```markdown
---
name: require-review-before-stop
enabled: true
event: stop
action: block
conditions:
  - field: transcript
    operator: not_contains
    pattern: /code-review
---

⚠️ **停止前需要代码审查**

在完成任务前，请先运行代码审查：

**必须执行：** `/code-review`

这是项目规范的强制要求，确保所有代码更改都经过质量检查。
```

#### 5. AST 模式检测触发重构建议

`.claude/hookify.ast-refactor.local.md`:
```markdown
---
name: detect-complex-patterns
enabled: true
event: file
conditions:
  - field: new_text
    operator: regex_match
    pattern: (if.*if.*if|\.then\(.*\.then\(.*\.then\()
action: warn
---

🔍 **检测到复杂代码模式**

发现深层嵌套或过长的 Promise 链，建议使用 AST 工具分析：

**执行命令：** "Use ast-grep to find all nested conditionals in this file"

然后运行 `/code-simplifier` 进行重构
```

### 组合工作流示例

创建一个完整的质量保证工作流：

#### 开发时 Hook 链

```
┌─────────────────────────────────────────────────────────────┐
│  1. 写代码 (Edit/Write)                                      │
│     ↓ hookify.auto-simplify.local.md 触发                   │
│  2. 建议运行 /code-simplifier                                │
│     ↓                                                        │
│  3. 提交前 (git commit)                                      │
│     ↓ hookify.auto-review.local.md 触发                     │
│  4. 建议运行 /code-review                                    │
│     ↓                                                        │
│  5. 完成任务 (Stop)                                          │
│     ↓ hookify.require-tests.local.md 触发                   │
│  6. 强制检查测试是否运行                                      │
└─────────────────────────────────────────────────────────────┘
```

### 最佳实践

| 策略 | 说明 |
|------|------|
| **警告优先** | 大多数场景使用 `action: warn`，让开发者决定是否执行 |
| **精准触发** | 使用多条件 `conditions` 减少误触发 |
| **清晰指令** | 在消息中明确写出要执行的 skill 命令 |
| **按需启用** | 生产紧急修复时可临时 `enabled: false` |
| **组合使用** | 不同事件触发不同 skills，形成完整工作流 |

### 快速开始

```bash
# 创建一个简单的自动审查规则
cat << 'EOF' > .claude/hookify.auto-review.local.md
---
name: auto-review-reminder
enabled: true
event: bash
pattern: git\s+(commit|push)
action: warn
---

📋 **提交前提醒**

建议先运行：`/code-review`
EOF
```

规则立即生效，无需重启！

---
