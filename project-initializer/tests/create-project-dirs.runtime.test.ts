import { describe, test, expect } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";

const ROOT = join(import.meta.dir, "..");

describe("create-project-dirs runtime smoke", () => {
  test("should scaffold contracts/template/spa-day artifacts", () => {
    const cwd = mkdtempSync(join(tmpdir(), "create-project-dirs-"));
    try {
      const res = spawnSync("bash", [join(ROOT, "scripts/create-project-dirs.sh")], {
        cwd,
        encoding: "utf-8",
      });
      expect(res.status).toBe(0);

      expect(existsSync(join(cwd, "tasks/contracts"))).toBe(true);
      expect(existsSync(join(cwd, ".claude/templates/contract.template.md"))).toBe(true);
      expect(existsSync(join(cwd, "docs/reference-configs/spa-day-protocol.md"))).toBe(true);
      expect(existsSync(join(cwd, "scripts/verify-contract.sh"))).toBe(true);

      const settings = readFileSync(join(cwd, ".claude/settings.json"), "utf-8");
      expect(settings).toContain("task-handoff.sh");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});

