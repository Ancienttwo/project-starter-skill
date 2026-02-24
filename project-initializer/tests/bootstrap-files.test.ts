import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
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
});
