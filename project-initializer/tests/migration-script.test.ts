import { describe, test, expect } from "bun:test";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";

const ROOT = join(import.meta.dir, "..");

function read(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf-8");
}

describe("Migration script contract", () => {
  test("should provide dry-run and apply modes", () => {
    const script = read("scripts/migrate-project-template.sh");
    expect(script).toContain("--dry-run");
    expect(script).toContain("--apply");
    expect(script).toContain("--repo");
  });

  test("should migrate team hooks to settings.json", () => {
    const script = read("scripts/migrate-project-template.sh");
    expect(script).toContain(".claude/settings.json");
    expect(script).toContain("settings.local.json");
    expect(script).toContain("migrate_workflow");
  });

  test("should remove legacy docs/TODO.md", () => {
    const script = read("scripts/migrate-project-template.sh");
    expect(script).toContain("docs/TODO.md");
    expect(script).toContain("rm -f");
  });

  test("should migrate workflow files and runtime ignore block", () => {
    const script = read("scripts/migrate-project-template.sh");
    expect(script).toContain("plans/archive");
    expect(script).toContain("tasks/archive");
    expect(script).toContain("tasks/research.md");
    expect(script).toContain("new-plan.sh");
    expect(script).toContain("plan-to-todo.sh");
    expect(script).toContain("archive-workflow.sh");
    expect(script).toContain("claude-runtime-temp");
  });

  test("should apply migration and create workflow artifacts with latest plan pointer", () => {
    const repo = mkdtempSync(join(tmpdir(), "migration-apply-"));
    try {
      mkdirSync(join(repo, "docs"), { recursive: true });
      mkdirSync(join(repo, "plans"), { recursive: true });
      mkdirSync(join(repo, ".claude"), { recursive: true });

      writeFileSync(join(repo, "docs/TODO.md"), "legacy todo\n");
      writeFileSync(join(repo, ".gitignore"), "# base\n");
      writeFileSync(
        join(repo, ".claude/settings.local.json"),
        JSON.stringify({ hooks: { PostToolUse: [{ matcher: "Bash", hooks: [] }] } }, null, 2)
      );

      writeFileSync(join(repo, "plans/plan-20260304-0900-alpha.md"), "# Plan alpha\n");
      writeFileSync(join(repo, "plans/plan-20260304-1000-beta.md"), "# Plan beta\n");

      const res = spawnSync(
        "bash",
        ["scripts/migrate-project-template.sh", "--repo", repo, "--apply"],
        { cwd: ROOT, encoding: "utf-8" }
      );

      expect(res.status).toBe(0);
      expect(existsSync(join(repo, "plans/archive"))).toBe(true);
      expect(existsSync(join(repo, "tasks/archive"))).toBe(true);
      expect(existsSync(join(repo, ".claude/templates/research.template.md"))).toBe(true);
      expect(existsSync(join(repo, ".claude/templates/plan.template.md"))).toBe(true);
      expect(existsSync(join(repo, "scripts/new-plan.sh"))).toBe(true);
      expect(existsSync(join(repo, "scripts/plan-to-todo.sh"))).toBe(true);
      expect(existsSync(join(repo, "scripts/archive-workflow.sh"))).toBe(true);
      expect(existsSync(join(repo, "tasks/research.md"))).toBe(true);

      const pointer = readFileSync(join(repo, "docs/plan.md"), "utf-8");
      expect(pointer).toContain("Current Active Plan: plans/plan-20260304-1000-beta.md");
      expect(existsSync(join(repo, "docs/TODO.md"))).toBe(false);

      const gitignore = readFileSync(join(repo, ".gitignore"), "utf-8");
      expect(gitignore).toContain("# BEGIN: claude-runtime-temp (managed by project-initializer)");
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});
