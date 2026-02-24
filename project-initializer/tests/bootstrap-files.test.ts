import { describe, test, expect } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");

function read(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf-8");
}

describe("Bootstrap Script Contracts", () => {
  test("create-project-dirs should create tasks primary files", () => {
    const content = read("scripts/create-project-dirs.sh");

    expect(content).toContain("mkdir -p tasks");
    expect(content).toContain("cat > tasks/todo.md");
    expect(content).toContain("cat > tasks/lessons.md");
    expect(content).toContain("docs/TODO.md");
    expect(content).toContain("docs/plan.md");
  });

  test("init-project should scaffold tasks primary workflow", () => {
    const content = read("scripts/init-project.sh");

    expect(content).toContain("mkdir -p tasks");
    expect(content).toContain("cat > tasks/todo.md");
    expect(content).toContain("cat > tasks/lessons.md");
    expect(content).toContain("docs/TODO.md");
    expect(content).toContain("docs/plan.md");
  });

  test("prompt-guard should monitor tasks-first files", () => {
    const content = read("assets/hooks/prompt-guard.sh");

    expect(content).toContain("tasks/todo.md");
    expect(content).toContain("tasks/lessons.md");
    expect(content).toContain("docs/plan.md");
  });

  test("hook template should reference existing local hook scripts", () => {
    const settings = read("assets/hooks/settings.template.json");
    const hookCommands = [...settings.matchAll(/\.claude\/hooks\/([A-Za-z0-9.-]+\.sh)/g)].map(
      (m) => m[1]
    );

    expect(hookCommands.length).toBeGreaterThan(0);
    for (const fileName of hookCommands) {
      expect(existsSync(join(ROOT, "assets/hooks", fileName))).toBe(true);
    }
  });

  test("hook docs and scripts should use ToolUse event names", () => {
    const skill = read("SKILL.md");
    const plugins = read("references/plugins-core.md");
    const setup = read("scripts/setup-plugins.sh");
    const legacyPre = `PreTool${"Call"}`;
    const legacyPost = `PostTool${"Call"}`;

    expect(skill).not.toContain(legacyPre);
    expect(skill).not.toContain(legacyPost);
    expect(plugins).not.toContain(legacyPre);
    expect(plugins).not.toContain(legacyPost);
    expect(setup).not.toContain(legacyPre);
    expect(setup).not.toContain(legacyPost);
  });
});
