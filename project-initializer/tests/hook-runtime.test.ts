import { describe, test, expect } from "bun:test";
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";

const ROOT = join(import.meta.dir, "..");
const ASSETS_HOOKS_DIR = join(ROOT, "assets/hooks");

function tmpWorkspace(prefix: string): string {
  return mkdtempSync(join(tmpdir(), `${prefix}-`));
}

function installHooks(cwd: string): string {
  const hooksDir = join(cwd, ".claude", "hooks");
  mkdirSync(hooksDir, { recursive: true });
  for (const f of readdirSync(ASSETS_HOOKS_DIR)) {
    copyFileSync(join(ASSETS_HOOKS_DIR, f), join(hooksDir, f));
  }
  return hooksDir;
}

function run(cmd: string, args: string[], cwd: string) {
  return spawnSync(cmd, args, { cwd, encoding: "utf-8" });
}

function runHook(
  script: string,
  cwd: string,
  options?: {
    stdin?: string;
    env?: Record<string, string>;
    args?: string[];
  }
) {
  const hooksDir = join(cwd, ".claude", "hooks");
  return spawnSync("bash", [join(hooksDir, script), ...(options?.args ?? [])], {
    cwd,
    input: options?.stdin ?? "",
    encoding: "utf-8",
    env: {
      ...process.env,
      ...(options?.env ?? {}),
    },
  });
}

function initGitRepo(cwd: string) {
  expect(run("git", ["init"], cwd).status).toBe(0);
  expect(run("git", ["config", "user.name", "Hook Test"], cwd).status).toBe(0);
  expect(run("git", ["config", "user.email", "hook@test.local"], cwd).status).toBe(0);

  writeFileSync(join(cwd, "tracked.txt"), "base\n");
  expect(run("git", ["add", "tracked.txt"], cwd).status).toBe(0);
  expect(run("git", ["commit", "-m", "init"], cwd).status).toBe(0);
}

function gitCommitCount(cwd: string): number {
  const out = run("git", ["rev-list", "--count", "HEAD"], cwd);
  expect(out.status).toBe(0);
  return Number(out.stdout.trim());
}

describe("Hook runtime behavior", () => {
  test("worktree-guard: warning by default, block when marker exists", () => {
    const cwd = tmpWorkspace("worktree-guard");
    try {
      initGitRepo(cwd);
      installHooks(cwd);

      const warnRes = runHook("worktree-guard.sh", cwd);
      expect(warnRes.status).toBe(0);
      expect(warnRes.stdout).toContain("Warning: primary working tree detected");

      mkdirSync(join(cwd, ".claude"), { recursive: true });
      writeFileSync(join(cwd, ".claude/.require-worktree"), "1\n");

      const blockRes = runHook("worktree-guard.sh", cwd);
      expect(blockRes.status).toBe(1);
      expect(blockRes.stdout).toContain("Mutation blocked");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("atomic-commit: commits only after validation command", () => {
    const cwd = tmpWorkspace("atomic-commit");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, ".claude"), { recursive: true });

      appendFileSync(join(cwd, "tracked.txt"), "change-1\n");
      writeFileSync(join(cwd, ".claude/.atomic_pending"), "pending\n");
      const before = gitCommitCount(cwd);

      const passRes = runHook("atomic-commit.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { command: "bun run test" } }),
        env: { EXIT_CODE: "0" },
      });

      expect(passRes.status).toBe(0);
      expect(passRes.stdout).toContain("[AtomicCommit] Checkpoint committed");
      expect(existsSync(join(cwd, ".claude/.atomic_pending"))).toBe(false);
      expect(gitCommitCount(cwd)).toBe(before + 1);

      appendFileSync(join(cwd, "tracked.txt"), "change-2\n");
      writeFileSync(join(cwd, ".claude/.atomic_pending"), "pending\n");
      const beforeSkip = gitCommitCount(cwd);

      const skipRes = runHook("atomic-commit.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { command: "echo hello" } }),
        env: { EXIT_CODE: "0" },
      });

      expect(skipRes.status).toBe(0);
      expect(skipRes.stdout).not.toContain("Checkpoint committed");
      expect(existsSync(join(cwd, ".claude/.atomic_pending"))).toBe(true);
      expect(gitCommitCount(cwd)).toBe(beforeSkip);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("doc-drift: detects apps/*/src direct files and wrangler variants", () => {
    const cwd = tmpWorkspace("doc-drift");
    try {
      installHooks(cwd);

      const srcRes = runHook("doc-drift-guard.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { file_path: "apps/web/src/main.tsx" } }),
      });
      expect(srcRes.status).toBe(0);
      expect(srcRes.stdout).toContain("[DocDrift] App source changed");

      const routeRes = runHook("doc-drift-guard.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { file_path: "apps/web/src/routes/index.tsx" } }),
      });
      expect(routeRes.status).toBe(0);
      expect(routeRes.stdout).toContain("[DocDrift] App source changed");

      const wranglerRes = runHook("doc-drift-guard.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { file_path: "apps/api/wrangler.production.toml" } }),
      });
      expect(wranglerRes.status).toBe(0);
      expect(wranglerRes.stdout).toContain("Wrangler config changed");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("tdd-guard: extension heuristic + barrel-only skip behavior", () => {
    const cwd = tmpWorkspace("tdd-guard");
    try {
      installHooks(cwd);
      mkdirSync(join(cwd, "apps/web/src/components"), { recursive: true });
      mkdirSync(join(cwd, "apps/api/src"), { recursive: true });

      writeFileSync(join(cwd, "apps/web/src/components/Button.tsx"), "export function Button() { return <button /> }\n");
      const bddRes = runHook("tdd-guard-hook.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { file_path: "apps/web/src/components/Button.tsx" } }),
      });
      expect(bddRes.status).toBe(0);
      expect(bddRes.stdout).toContain("[BDD Guard]");

      writeFileSync(join(cwd, "apps/api/src/utils.ts"), "export const sum = (a: number, b: number) => a + b\n");
      const tddRes = runHook("tdd-guard-hook.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { file_path: "apps/api/src/utils.ts" } }),
      });
      expect(tddRes.status).toBe(0);
      expect(tddRes.stdout).toContain("[TDD Guard]");

      writeFileSync(
        join(cwd, "apps/api/src/index.ts"),
        "export * from './utils'\nexport { sum } from './utils'\n"
      );
      const barrelRes = runHook("tdd-guard-hook.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { file_path: "apps/api/src/index.ts" } }),
      });
      expect(barrelRes.status).toBe(0);
      expect(barrelRes.stdout.trim()).toBe("");

      writeFileSync(join(cwd, "apps/api/src/index.ts"), "const x = 1\nexport { x }\n");
      const logicIndexRes = runHook("tdd-guard-hook.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { file_path: "apps/api/src/index.ts" } }),
      });
      expect(logicIndexRes.status).toBe(0);
      expect(logicIndexRes.stdout).toContain("[TDD Guard]");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("context-pressure: same-session increments, cross-session resets, warning once", () => {
    const cwd = tmpWorkspace("context-pressure");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, ".claude/.context-pressure"), { recursive: true });

      const s1a = runHook("context-pressure-hook.sh", cwd, {
        env: { CLAUDE_SESSION_ID: "session-a" },
      });
      expect(s1a.status).toBe(0);

      const s1b = runHook("context-pressure-hook.sh", cwd, {
        env: { CLAUDE_SESSION_ID: "session-a" },
      });
      expect(s1b.status).toBe(0);
      expect(readFileSync(join(cwd, ".claude/.tool-call-count"), "utf-8").trim()).toBe("2");

      const s2 = runHook("context-pressure-hook.sh", cwd, {
        env: { CLAUDE_SESSION_ID: "session-b" },
      });
      expect(s2.status).toBe(0);
      expect(readFileSync(join(cwd, ".claude/.tool-call-count"), "utf-8").trim()).toBe("1");

      writeFileSync(join(cwd, ".claude/.context-pressure/warnsession_.count"), "29\n");

      const warn1 = runHook("context-pressure-hook.sh", cwd, {
        env: { CLAUDE_SESSION_ID: "warnsession" },
      });
      expect(warn1.status).toBe(0);
      expect(warn1.stdout).toContain("Yellow zone");

      const warn2 = runHook("context-pressure-hook.sh", cwd, {
        env: { CLAUDE_SESSION_ID: "warnsession" },
      });
      expect(warn2.status).toBe(0);
      expect(warn2.stdout).not.toContain("Yellow zone");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("hooks resolve repo root when cwd drifts", () => {
    const workspace = tmpWorkspace("cwd-drift");
    try {
      initGitRepo(workspace);
      installHooks(workspace);

      // Run atomic-pending from /tmp — hook should resolve to workspace via SCRIPT_DIR fallback
      const res = spawnSync(
        "bash",
        [join(workspace, ".claude/hooks/atomic-pending.sh")],
        {
          cwd: tmpdir(),
          input: "",
          encoding: "utf-8",
        }
      );
      expect(res.status).toBe(0);
      expect(existsSync(join(workspace, ".claude/.atomic_pending"))).toBe(true);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });

  test("changelog-guard: warns when unreleased section is empty on release command", () => {
    const cwd = tmpWorkspace("changelog-guard");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, "docs"), { recursive: true });

      // Create a changelog with empty [Unreleased] section
      writeFileSync(
        join(cwd, "docs/CHANGELOG.md"),
        [
          "# Changelog",
          "",
          "## [Unreleased]",
          "",
          "---",
          "*Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)*",
          "",
        ].join("\n")
      );

      // Simulate npm version command — should warn
      const warnRes = runHook("changelog-guard.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { command: "npm version patch" } }),
      });
      expect(warnRes.status).toBe(0);
      expect(warnRes.stdout).toContain("[ChangelogGuard]");
      expect(warnRes.stdout).toContain("appears empty");

      // Non-release command — should be silent
      const silentRes = runHook("changelog-guard.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { command: "bun run test" } }),
      });
      expect(silentRes.status).toBe(0);
      expect(silentRes.stdout).not.toContain("[ChangelogGuard]");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("changelog-guard: silent when unreleased section has content", () => {
    const cwd = tmpWorkspace("changelog-guard-content");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, "docs"), { recursive: true });

      writeFileSync(
        join(cwd, "docs/CHANGELOG.md"),
        [
          "# Changelog",
          "",
          "## [Unreleased]",
          "",
          "### Added",
          "- New changelog guard hook",
          "",
          "---",
        ].join("\n")
      );

      const res = runHook("changelog-guard.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { command: "npm version minor" } }),
      });
      expect(res.status).toBe(0);
      expect(res.stdout).not.toContain("[ChangelogGuard]");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("changelog-guard: detects git tag and other version commands", () => {
    const cwd = tmpWorkspace("changelog-guard-variants");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, "docs"), { recursive: true });

      writeFileSync(
        join(cwd, "docs/CHANGELOG.md"),
        ["# Changelog", "", "## [Unreleased]", "", "---"].join("\n")
      );

      for (const cmd of ["git tag v1.0.0", "bun version patch", "pnpm version major", "yarn version --minor"]) {
        const res = runHook("changelog-guard.sh", cwd, {
          stdin: JSON.stringify({ tool_input: { command: cmd } }),
        });
        expect(res.status).toBe(0);
        expect(res.stdout).toContain("[ChangelogGuard]");
      }
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("prompt-guard: research and annotation warnings on non-implement prompts", () => {
    const cwd = tmpWorkspace("prompt-guard-annotation");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, "tasks"), { recursive: true });
      mkdirSync(join(cwd, "plans"), { recursive: true });
      mkdirSync(join(cwd, "docs"), { recursive: true });

      writeFileSync(
        join(cwd, "tasks/research.md"),
        "# Research\n\nInitial notes\n"
      );
      writeFileSync(
        join(cwd, "plans/plan-20260304-1200-test.md"),
        "# Plan: test\n\n> **Status**: Draft\n"
      );

      expect(run("git", ["add", "."], cwd).status).toBe(0);
      expect(run("git", ["commit", "-m", "seed workflow files"], cwd).status).toBe(0);

      appendFileSync(join(cwd, "tasks/research.md"), "Updated insight\n");
      appendFileSync(join(cwd, "plans/plan-20260304-1200-test.md"), "- [NOTE]: update\n");

      const res = runHook("prompt-guard.sh", cwd, {
        stdin: JSON.stringify({ user_message: "我更新了注释，请先分析" }),
      });

      expect(res.status).toBe(0);
      expect(res.stdout).toContain("[ResearchGuard]");
      expect(res.stdout).toContain("[AnnotationGuard]");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("prompt-guard: blocks implement intent when plan status is Draft", () => {
    const cwd = tmpWorkspace("prompt-guard-status");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, "plans"), { recursive: true });

      writeFileSync(
        join(cwd, "plans/plan-20260304-1300-demo.md"),
        "# Plan: demo\n\n> **Status**: Draft\n"
      );

      expect(run("git", ["add", "."], cwd).status).toBe(0);
      expect(run("git", ["commit", "-m", "seed plan"], cwd).status).toBe(0);

      const res = runHook("prompt-guard.sh", cwd, {
        stdin: JSON.stringify({ user_message: "implement it all now" }),
      });

      expect(res.status).toBe(1);
      expect(res.stdout).toContain("[PlanStatusGuard]");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("prompt-guard: blocks implement intent when no active plan exists", () => {
    const cwd = tmpWorkspace("prompt-guard-missing-plan");
    try {
      initGitRepo(cwd);
      installHooks(cwd);

      const res = runHook("prompt-guard.sh", cwd, {
        stdin: JSON.stringify({ user_message: "开始实现" }),
      });

      expect(res.status).toBe(1);
      expect(res.stdout).toContain("No active plan found in plans/");
      expect(res.stdout).toContain("ensure-task-workflow.sh");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("prompt-guard: blocks done intent when task contract is missing", () => {
    const cwd = tmpWorkspace("prompt-guard-contract-missing");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, "plans"), { recursive: true });

      writeFileSync(
        join(cwd, "plans/plan-20260304-1400-demo.md"),
        "# Plan: demo\n\n> **Status**: Approved\n"
      );

      const res = runHook("prompt-guard.sh", cwd, {
        stdin: JSON.stringify({ user_message: "mark done now" }),
      });

      expect(res.status).toBe(1);
      expect(res.stdout).toContain("[ContractGuard]");
      expect(res.stdout).toContain("Missing task contract");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("prompt-guard: allows done intent when contract verification passes", () => {
    const cwd = tmpWorkspace("prompt-guard-contract-pass");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, "plans"), { recursive: true });
      mkdirSync(join(cwd, "tasks"), { recursive: true });
      mkdirSync(join(cwd, "tasks/contracts"), { recursive: true });
      mkdirSync(join(cwd, "scripts"), { recursive: true });

      writeFileSync(
        join(cwd, "plans/plan-20260304-1410-demo.md"),
        "# Plan: demo\n\n> **Status**: Approved\n"
      );
      writeFileSync(
        join(cwd, "tasks/todo.md"),
        "# Task Execution Checklist (Primary)\n\n> **Source Plan**: plans/plan-20260304-1410-demo.md\n"
      );
      writeFileSync(join(cwd, "tasks/contracts/demo.contract.md"), "# contract\n");
      writeFileSync(
        join(cwd, "scripts/verify-contract.sh"),
        "#!/bin/bash\nset -euo pipefail\necho \"[verify] ok\"\n"
      );
      expect(run("chmod", ["+x", "scripts/verify-contract.sh"], cwd).status).toBe(0);

      const res = runHook("prompt-guard.sh", cwd, {
        stdin: JSON.stringify({ user_message: "任务完成了，结束吧" }),
      });

      expect(res.status).toBe(0);
      expect(res.stdout).toContain("[verify] ok");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("task-handoff: creates handoff summary when completed tasks increase", () => {
    const cwd = tmpWorkspace("task-handoff");
    try {
      initGitRepo(cwd);
      installHooks(cwd);
      mkdirSync(join(cwd, "tasks"), { recursive: true });
      mkdirSync(join(cwd, "plans"), { recursive: true });

      writeFileSync(
        join(cwd, "tasks/todo.md"),
        [
          "# Task Execution Checklist (Primary)",
          "",
          "> **Source Plan**: plans/plan-20260304-1410-demo.md",
          "",
          "- [x] finish first task",
          "- [ ] second task",
          "",
        ].join("\n")
      );
      writeFileSync(
        join(cwd, "plans/plan-20260304-1410-demo.md"),
        "# Plan: demo\n\n> **Status**: Executing\n"
      );

      const res = runHook("task-handoff.sh", cwd, {
        stdin: JSON.stringify({ tool_input: { file_path: "tasks/todo.md" } }),
      });

      expect(res.status).toBe(0);
      expect(res.stdout).toContain("[TaskHandoff]");
      expect(existsSync(join(cwd, ".claude/.task-handoff.md"))).toBe(true);
      expect(existsSync(join(cwd, ".claude/.task-state.json"))).toBe(true);
      const handoff = readFileSync(join(cwd, ".claude/.task-handoff.md"), "utf-8");
      expect(handoff).toContain("finish first task");
      expect(handoff).toContain("Progress");
      expect(handoff).toContain("plans/plan-20260304-1410-demo.md");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
