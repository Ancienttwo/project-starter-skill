import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { loadPlanMap } from "../scripts/assemble-template";

const ROOT = join(import.meta.dir, "..");

function read(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf-8");
}

describe("Plan map consistency", () => {
  test("plan-map should define canonical A..K plans", () => {
    const planMap = loadPlanMap();
    const planCodes = Object.keys(planMap.plans).sort();
    expect(planCodes).toEqual(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]);
  });

  test("docs should not reference deprecated plan labels", () => {
    const skill = read("SKILL.md");
    const readme = read("README.md");

    expect(skill).not.toContain("Plan C+");
    expect(skill).not.toContain("Plan L");
    expect(readme).not.toContain("Plan C+");
    expect(readme).not.toContain("Plan L");
  });

  test("canonical plan labels should appear in docs", () => {
    const skill = read("SKILL.md");
    const readme = read("README.md");
    const techStacks = read("references/tech-stacks.md");

    for (const plan of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]) {
      expect(skill).toContain(`Plan ${plan}`);
      expect(readme).toContain(`Plan ${plan}`);
      expect(techStacks).toContain(`Plan ${plan}`);
    }
  });
});
