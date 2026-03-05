import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");

describe("Skill eval assets", () => {
  const evals = JSON.parse(readFileSync(join(ROOT, "evals", "evals.json"), "utf-8")) as {
    skill_name: string;
    evals: Array<{
      id: number;
      prompt: string;
      expected_output: string;
      files?: string[];
      expectations: string[];
    }>;
  };

  test("eval asset uses the correct skill name", () => {
    expect(evals.skill_name).toBe("project-initializer");
  });

  test("eval asset covers the core workflows", () => {
    expect(evals.evals.length).toBeGreaterThanOrEqual(4);
    const prompts = evals.evals.map((entry) => entry.prompt).join("\n");
    expect(prompts).toContain("Initialize a new");
    expect(prompts).toContain("Fix AGENTS.md");
    expect(prompts).toContain("Migrate this older Claude Code repo");
    expect(prompts).toContain("Audit this AI-assisted coding setup");
  });

  test("eval ids are unique and outputs are non-empty", () => {
    const ids = new Set<number>();

    for (const entry of evals.evals) {
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
      expect(entry.prompt.length).toBeGreaterThan(20);
      expect(entry.expected_output.length).toBeGreaterThan(20);
      expect(entry.expectations.length).toBeGreaterThan(0);
      for (const expectation of entry.expectations) {
        expect(expectation.length).toBeGreaterThan(10);
      }
    }
  });
});
