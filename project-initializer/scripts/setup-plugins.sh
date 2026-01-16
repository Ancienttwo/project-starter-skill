#!/bin/bash
# Claude Code Plugin Auto-Setup Script
# Part of project-initializer skill
# Automatically installs essential plugins and configures hooks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CLAUDE_DIR="$HOME/.claude"
SKILLS_DIR="$CLAUDE_DIR/skills"
HOOKS_DIR="$CLAUDE_DIR/hooks"
PLUGINS_REPO="https://github.com/anthropics/claude-plugins-official.git"
AST_GREP_REPO="https://github.com/ast-grep/claude-skill.git"
OBSIDIAN_REPO="https://github.com/kepano/obsidian-skills.git"

# Essential plugins that must be installed
ESSENTIAL_PLUGINS=(
    "feature-dev"
    "frontend-design"
    "code-simplifier"
    "code-review"
    "hookify"
)

# Recommended optional plugins
OPTIONAL_PLUGINS=(
    "commit-commands"
    "pr-review-toolkit"
    "security-guidance"
    "agent-sdk-dev"
    "ralph-loop"
)

# LSP plugins mapped by project type
declare -A LSP_BY_PROJECT=(
    ["plan-a"]="typescript-lsp"    # Remix
    ["plan-b"]="jdtls-lsp"         # UmiJS/Java
    ["plan-c"]="typescript-lsp"    # Vite + TanStack
    ["plan-d"]="typescript-lsp"    # Monorepo
    ["plan-f"]="typescript-lsp"    # Expo Mobile (cross-platform)
    ["plan-f-swift"]="swift-lsp"   # iOS Native SwiftUI
    ["plan-f-kotlin"]="kotlin-lsp" # Android Native Compose
    ["plan-g"]="pyright-lsp"       # FastAPI Python
    ["plan-h"]="rust-analyzer-lsp" # Rust Trading
    ["plan-j"]="typescript-lsp"    # TUI Tool (OpenTUI/Ink)
    ["plan-j-rust"]="rust-analyzer-lsp" # TUI Tool (Ratatui)
    ["plan-k"]="typescript-lsp"    # AI Agent Backend (Bun+Hono)
)

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║     Claude Code Plugin Auto-Setup                        ║"
    echo "║     Essential plugins + hooks configuration              ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_ast_grep() {
    if command -v ast-grep &> /dev/null || command -v sg &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} ast-grep CLI is installed"
        return 0
    else
        echo -e "  ${YELLOW}!${NC} ast-grep CLI not found"
        echo -e "    Install with: ${CYAN}brew install ast-grep${NC} or ${CYAN}npm install -g @ast-grep/cli${NC}"
        return 1
    fi
}

install_ast_grep_skill() {
    echo -e "${BLUE}Setting up ast-grep skill...${NC}"
    if [ -d "$CLAUDE_DIR/ast-grep-skill" ]; then
        echo -e "  Updating existing ast-grep skill..."
        cd "$CLAUDE_DIR/ast-grep-skill" && git pull --quiet 2>/dev/null || true
        cd - > /dev/null
    else
        echo -e "  Cloning ast-grep skill..."
        git clone --quiet "$AST_GREP_REPO" "$CLAUDE_DIR/ast-grep-skill" 2>/dev/null || {
            echo -e "  ${YELLOW}!${NC} Could not clone ast-grep skill"
            return 1
        }
    fi

    # Create skill directory and copy files
    mkdir -p "$SKILLS_DIR/ast-grep"

    # Copy skill file
    if [ -f "$CLAUDE_DIR/ast-grep-skill/ast-grep.md" ]; then
        cp "$CLAUDE_DIR/ast-grep-skill/ast-grep.md" "$SKILLS_DIR/ast-grep/SKILL.md"
        echo -e "  ${GREEN}✓${NC} ast-grep skill installed"
    elif [ -f "$CLAUDE_DIR/ast-grep-skill/skill.md" ]; then
        cp "$CLAUDE_DIR/ast-grep-skill/skill.md" "$SKILLS_DIR/ast-grep/SKILL.md"
        echo -e "  ${GREEN}✓${NC} ast-grep skill installed"
    elif [ -f "$CLAUDE_DIR/ast-grep-skill/SKILL.md" ]; then
        cp "$CLAUDE_DIR/ast-grep-skill/SKILL.md" "$SKILLS_DIR/ast-grep/"
        echo -e "  ${GREEN}✓${NC} ast-grep skill installed"
    else
        # Find any .md file in the repo (except README)
        for md_file in "$CLAUDE_DIR/ast-grep-skill"/*.md; do
            if [ -f "$md_file" ] && [ "$(basename "$md_file")" != "README.md" ]; then
                cp "$md_file" "$SKILLS_DIR/ast-grep/SKILL.md"
                echo -e "  ${GREEN}✓${NC} ast-grep skill installed"
                break
            fi
        done
    fi
}

configure_hooks() {
    local hook_type="$1"
    echo -e "${BLUE}Configuring hooks ($hook_type)...${NC}"

    # Backup existing settings
    if [ -f "$CLAUDE_DIR/settings.json" ]; then
        cp "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.backup-$(date +%Y%m%d_%H%M%S)"
    fi

    case "$hook_type" in
        "standard")
            cat > "$CLAUDE_DIR/settings.json.hooks" << 'HOOKS_EOF'
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
HOOKS_EOF
            ;;
        "minimal")
            cat > "$CLAUDE_DIR/settings.json.hooks" << 'HOOKS_EOF'
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "echo '\u001b[1;33m🛡️ Quality guard active...\u001b[0m'"
      }
    ]
  }
}
HOOKS_EOF
            ;;
        "biome")
            cat > "$CLAUDE_DIR/settings.json.hooks" << 'HOOKS_EOF'
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "echo '\u001b[1;33m🛡️ Quality guard + Biome active...\u001b[0m'"
      }
    ],
    "PostToolCall": [
      {
        "matcher": "Write\\(.*\\.(ts|tsx|js|jsx|json)\\)",
        "command": "bunx biome check --write \"$CLAUDE_FILE_PATH\" 2>&1 | head -10"
      }
    ]
  }
}
HOOKS_EOF
            ;;
        "biome-strict")
            cat > "$CLAUDE_DIR/settings.json.hooks" << 'HOOKS_EOF'
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "echo '\u001b[1;33m🛡️ Quality guard + Biome CI active...\u001b[0m'"
      }
    ],
    "PostToolCall": [
      {
        "matcher": "Write\\(.*\\.(ts|tsx|js|jsx)\\)",
        "command": "bunx biome ci \"$CLAUDE_FILE_PATH\" 2>&1 | head -20"
      }
    ]
  }
}
HOOKS_EOF
            ;;
        *)
            echo -e "  ${YELLOW}Skipping hook configuration${NC}"
            return
            ;;
    esac

    # Merge hooks into settings.json
    if [ -f "$CLAUDE_DIR/settings.json" ]; then
        # Use jq if available, otherwise simple merge
        if command -v jq &> /dev/null; then
            jq -s '.[0] * .[1]' "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.hooks" > "$CLAUDE_DIR/settings.json.new"
            mv "$CLAUDE_DIR/settings.json.new" "$CLAUDE_DIR/settings.json"
        else
            echo -e "  ${YELLOW}jq not found, creating new settings.json${NC}"
            cat "$CLAUDE_DIR/settings.json.hooks" > "$CLAUDE_DIR/settings.json"
        fi
    else
        cat "$CLAUDE_DIR/settings.json.hooks" > "$CLAUDE_DIR/settings.json"
    fi

    rm -f "$CLAUDE_DIR/settings.json.hooks"
    echo -e "  ${GREEN}✓${NC} Hooks configured"
}

add_permissions() {
    echo -e "${BLUE}Adding plugin permissions...${NC}"

    # Create permissions array
    local permissions='[
      "Skill(feature-dev)",
      "Skill(feature-dev:*)",
      "Skill(frontend-design)",
      "Skill(frontend-design:*)",
      "Skill(code-simplifier)",
      "Skill(code-simplifier:*)",
      "Skill(code-review)",
      "Skill(code-review:*)",
      "Skill(ast-grep)",
      "Skill(ast-grep:*)",
      "Skill(commit-commands)",
      "Skill(commit-commands:*)",
      "Skill(pr-review-toolkit)",
      "Skill(pr-review-toolkit:*)"
    ]'

    if command -v jq &> /dev/null && [ -f "$CLAUDE_DIR/settings.json" ]; then
        # Merge permissions using jq
        jq --argjson perms "$permissions" '.permissions.allow = (.permissions.allow // []) + $perms | .permissions.allow |= unique' \
            "$CLAUDE_DIR/settings.json" > "$CLAUDE_DIR/settings.json.new"
        mv "$CLAUDE_DIR/settings.json.new" "$CLAUDE_DIR/settings.json"
        echo -e "  ${GREEN}✓${NC} Permissions added"
    else
        echo -e "  ${YELLOW}!${NC} Could not add permissions (jq required for merge)"
    fi
}

print_summary() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Setup Complete!                                         ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Installed plugins:${NC}"
    for plugin in "${ESSENTIAL_PLUGINS[@]}"; do
        if [ -d "$SKILLS_DIR/$plugin" ]; then
            echo -e "  ${GREEN}✓${NC} $plugin"
        fi
    done
    if [ -d "$SKILLS_DIR/ast-grep" ]; then
        echo -e "  ${GREEN}✓${NC} ast-grep"
    fi

    # Show LSP plugin if installed
    for lsp in typescript-lsp pyright-lsp rust-analyzer-lsp jdtls-lsp; do
        if [ -d "$SKILLS_DIR/$lsp" ]; then
            echo -e "  ${GREEN}✓${NC} $lsp (LSP)"
        fi
    done

    # Show optional plugins if installed
    for plugin in "${OPTIONAL_PLUGINS[@]}"; do
        if [ -d "$SKILLS_DIR/$plugin" ]; then
            echo -e "  ${GREEN}✓${NC} $plugin (optional)"
        fi
    done

    echo ""
    echo -e "${BLUE}Available commands:${NC}"
    echo -e "  /feature-dev      - Guided feature development"
    echo -e "  /frontend-design  - Production-grade UI creation"
    echo -e "  /code-simplifier  - Code simplification"
    echo -e "  /code-review      - Code quality review"
    echo -e "  /ast-grep         - AST-based code search"
    if [ -d "$SKILLS_DIR/hookify" ]; then
        echo -e "  /hookify          - Smart hook creation (auto-detect bad behaviors)"
    fi
    if [ -d "$SKILLS_DIR/ralph-loop" ]; then
        echo -e "  /ralph-loop       - Iterative TDD workflow automation"
    fi
    echo ""
    echo -e "${YELLOW}Restart Claude Code to apply changes.${NC}"
}

# Main execution
main() {
    local install_optional=false
    local install_obsidian=false
    local hook_type="standard"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --with-optional)
                install_optional=true
                shift
                ;;
            --with-obsidian)
                install_obsidian=true
                shift
                ;;
            --hooks)
                hook_type="$2"
                shift 2
                ;;
            --no-hooks)
                hook_type="none"
                shift
                ;;
            --lsp)
                lsp_plugin="$2"
                shift 2
                ;;
            --project-type)
                project_type="$2"
                shift 2
                ;;
            --help)
                echo "Usage: setup-plugins.sh [options]"
                echo ""
                echo "Options:"
                echo "  --with-optional    Install optional plugins (commit-commands, pr-review-toolkit, ralph-loop, etc.)"
                echo "  --with-obsidian    Install Obsidian skills"
                echo "  --hooks TYPE       Hook type: standard (default), minimal, biome, biome-strict, none"
                echo "  --no-hooks         Skip hook configuration"
                echo "  --lsp PLUGIN       Install specific LSP plugin (e.g., typescript-lsp, pyright-lsp)"
                echo "  --project-type TYPE  Auto-select LSP by project type"
                echo "  --help             Show this help"
                echo ""
                echo "Hook types:"
                echo "  standard      - Basic quality guard with test completion notifications"
                echo "  minimal       - Only UserPromptSubmit quality guard"
                echo "  biome         - Auto lint/format with Biome on file write (recommended)"
                echo "  biome-strict  - Biome CI mode (fails on warnings)"
                echo ""
                echo "LSP by project type:"
                echo "  plan-a (Remix)           -> typescript-lsp"
                echo "  plan-b (UmiJS/Java)      -> jdtls-lsp"
                echo "  plan-c (Vite+TanStack)   -> typescript-lsp"
                echo "  plan-d (Monorepo)        -> typescript-lsp"
                echo "  plan-f (Expo Mobile)     -> typescript-lsp"
                echo "  plan-f-swift (iOS)       -> swift-lsp"
                echo "  plan-f-kotlin (Android)  -> kotlin-lsp"
                echo "  plan-g (FastAPI Python)  -> pyright-lsp"
                echo "  plan-h (Rust Trading)    -> rust-analyzer-lsp"
                echo "  plan-j (TUI OpenTUI/Ink) -> typescript-lsp"
                echo "  plan-j-rust (Ratatui)    -> rust-analyzer-lsp"
                echo "  plan-k (Bun+Hono Agent)  -> typescript-lsp"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Auto-select LSP based on project type if specified
    if [ -n "$project_type" ] && [ -z "$lsp_plugin" ]; then
        lsp_plugin="${LSP_BY_PROJECT[$project_type]}"
        if [ -n "$lsp_plugin" ]; then
            echo -e "${BLUE}Auto-selected LSP for $project_type: $lsp_plugin${NC}"
        fi
    fi

    print_banner

    # Create necessary directories
    echo -e "${YELLOW}Creating directories...${NC}"
    mkdir -p "$SKILLS_DIR" "$HOOKS_DIR"

    # Clone or update official plugins
    echo -e "${YELLOW}Setting up official plugins repository...${NC}"
    if [ -d "$CLAUDE_DIR/plugins-official" ]; then
        echo -e "  Updating existing plugins..."
        cd "$CLAUDE_DIR/plugins-official" && git pull --quiet 2>/dev/null || true
        cd - > /dev/null
    else
        echo -e "  Cloning official plugins..."
        git clone --quiet "$PLUGINS_REPO" "$CLAUDE_DIR/plugins-official" 2>/dev/null || {
            echo -e "  ${RED}✗${NC} Could not clone official plugins"
            exit 1
        }
    fi

    # Install essential plugins
    echo ""
    echo -e "${BLUE}Installing Essential Plugins:${NC}"
    for plugin in "${ESSENTIAL_PLUGINS[@]}"; do
        if [ -d "$CLAUDE_DIR/plugins-official/plugins/$plugin" ]; then
            cp -r "$CLAUDE_DIR/plugins-official/plugins/$plugin" "$SKILLS_DIR/"
            echo -e "  ${GREEN}✓${NC} $plugin"
        else
            echo -e "  ${RED}✗${NC} $plugin (not found in official repo)"
        fi
    done

    # Install ast-grep skill
    echo ""
    check_ast_grep || true
    install_ast_grep_skill || true

    # Install optional plugins if requested
    if [ "$install_optional" = true ]; then
        echo ""
        echo -e "${BLUE}Installing Optional Plugins:${NC}"
        for plugin in "${OPTIONAL_PLUGINS[@]}"; do
            if [ -d "$CLAUDE_DIR/plugins-official/plugins/$plugin" ]; then
                cp -r "$CLAUDE_DIR/plugins-official/plugins/$plugin" "$SKILLS_DIR/"
                echo -e "  ${GREEN}✓${NC} $plugin"
            fi
        done
    fi

    # Install Obsidian skills if requested
    if [ "$install_obsidian" = true ]; then
        echo ""
        echo -e "${BLUE}Setting up Obsidian skills...${NC}"
        if [ -d "$CLAUDE_DIR/obsidian-skills" ]; then
            cd "$CLAUDE_DIR/obsidian-skills" && git pull --quiet 2>/dev/null || true
            cd - > /dev/null
        else
            git clone --quiet "$OBSIDIAN_REPO" "$CLAUDE_DIR/obsidian-skills" 2>/dev/null || {
                echo -e "  ${YELLOW}!${NC} Could not clone Obsidian skills"
            }
        fi

        # Copy Obsidian skills
        if [ -d "$CLAUDE_DIR/obsidian-skills" ]; then
            for skill_dir in "$CLAUDE_DIR/obsidian-skills"/*/; do
                if [ -d "$skill_dir" ]; then
                    skill_name=$(basename "$skill_dir")
                    cp -r "$skill_dir" "$SKILLS_DIR/"
                    echo -e "  ${GREEN}✓${NC} $skill_name"
                fi
            done
        fi
    fi

    # Install LSP plugin if specified
    if [ -n "$lsp_plugin" ]; then
        echo ""
        echo -e "${BLUE}Installing LSP Plugin:${NC}"
        if [ -d "$CLAUDE_DIR/plugins-official/plugins/$lsp_plugin" ]; then
            cp -r "$CLAUDE_DIR/plugins-official/plugins/$lsp_plugin" "$SKILLS_DIR/"
            echo -e "  ${GREEN}✓${NC} $lsp_plugin"

            # Add LSP-specific instructions
            case "$lsp_plugin" in
                "typescript-lsp")
                    echo -e "  ${CYAN}ℹ${NC} TypeScript LSP provides type checking and diagnostics"
                    echo -e "    Ensure tsconfig.json is properly configured"
                    ;;
                "pyright-lsp")
                    echo -e "  ${CYAN}ℹ${NC} Pyright LSP provides Python type checking"
                    echo -e "    Install Pyright: ${CYAN}npm install -g pyright${NC}"
                    ;;
                "rust-analyzer-lsp")
                    echo -e "  ${CYAN}ℹ${NC} Rust Analyzer provides Rust IDE features"
                    echo -e "    Install: ${CYAN}rustup component add rust-analyzer${NC}"
                    ;;
                "jdtls-lsp")
                    echo -e "  ${CYAN}ℹ${NC} Eclipse JDT LS provides Java IDE features"
                    echo -e "    Requires Java 17+ and jdtls installation"
                    ;;
            esac
        else
            echo -e "  ${RED}✗${NC} $lsp_plugin (not found in official repo)"
            echo -e "  ${YELLOW}!${NC} Available LSP plugins: typescript-lsp, pyright-lsp, rust-analyzer-lsp, jdtls-lsp"
        fi
    fi

    # Configure hooks
    echo ""
    configure_hooks "$hook_type"

    # Add permissions
    echo ""
    add_permissions

    # Print summary
    print_summary
}

# Run main function
main "$@"