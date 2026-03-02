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
});
