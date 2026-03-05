import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { assembleTemplate, loadSkillVersion } from "../scripts/assemble-template";
import {
  checkConsistency,
  extractSkillMdVersion,
} from "../scripts/check-skill-version";

const REPO_ROOT = join(import.meta.dir, "..");

describe("Skill Version Consistency", () => {
  test("package.json and skill-version.json have same version", () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf-8"));
    const sv = JSON.parse(readFileSync(join(REPO_ROOT, "assets", "skill-version.json"), "utf-8"));
    expect(pkg.version).toBe(sv.version);
  });

  test("SKILL.md frontmatter version matches package.json", () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf-8"));
    const skillMdVersion = extractSkillMdVersion();
    expect(skillMdVersion).toBe(pkg.version);
  });

  test("checkConsistency returns consistent=true for current repo", () => {
    const result = checkConsistency();
    expect(result.consistent).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe("Skill Version Manifest Structure", () => {
  const sv = JSON.parse(readFileSync(join(REPO_ROOT, "assets", "skill-version.json"), "utf-8"));

  test("has required version field", () => {
    expect(sv.version).toBeDefined();
    expect(typeof sv.version).toBe("string");
    expect(sv.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("has required templateVersion field", () => {
    expect(sv.templateVersion).toBeDefined();
    expect(typeof sv.templateVersion).toBe("string");
    expect(sv.templateVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("has compatibility section", () => {
    expect(sv.compatibility).toBeDefined();
    expect(sv.compatibility.minClaudeCodeVersion).toBeDefined();
    expect(sv.compatibility.minBunVersion).toBeDefined();
  });

  test("has breakingChanges array", () => {
    expect(Array.isArray(sv.breakingChanges)).toBe(true);
    for (const change of sv.breakingChanges) {
      expect(change.version).toBeDefined();
      expect(change.description).toBeDefined();
    }
  });

  test("has generatedProjectStamp config", () => {
    expect(sv.generatedProjectStamp).toBeDefined();
    expect(sv.generatedProjectStamp.format).toBeDefined();
    expect(sv.generatedProjectStamp.location).toBe(".claude/.skill-version");
  });
});

describe("Footer Partial Uses Template Variables", () => {
  test("07-footer.partial.md uses {{TEMPLATE_VERSION}} not hardcoded version", () => {
    const footer = readFileSync(
      join(REPO_ROOT, "assets", "partials", "07-footer.partial.md"),
      "utf-8"
    );
    expect(footer).toContain("{{TEMPLATE_VERSION}}");
    expect(footer).toContain("{{SKILL_VERSION}}");
    expect(footer).not.toMatch(/Template Version: \d+\.\d+\.\d+/);
  });
});

describe("Assembled Output Contains Version Info", () => {
  const output = assembleTemplate({
    planType: "C",
    variables: { PROJECT_NAME: "VersionTest" },
  });

  test("output contains SKILL_VERSION value", () => {
    const sv = loadSkillVersion();
    expect(output).toContain(`project-initializer@${sv.version}`);
  });

  test("output contains TEMPLATE_VERSION value", () => {
    const sv = loadSkillVersion();
    expect(output).toContain(`Template Version: ${sv.templateVersion}`);
  });

  test("output does not contain raw SKILL_VERSION placeholder", () => {
    expect(output).not.toContain("{{SKILL_VERSION}}");
    expect(output).not.toContain("{{TEMPLATE_VERSION}}");
  });
});
