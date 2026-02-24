import { describe, test, expect } from "bun:test";
import { assembleTemplate } from "../scripts/assemble-template";

function extractHeadings(content: string, levels: Array<"## " | "### ">): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => levels.some((level) => line.startsWith(level)));
}

function countLines(content: string): number {
  return content.split("\n").length;
}

describe("Quick Mode vs Full Mode Parity", () => {
  const quickModeOutput = assembleTemplate({
    planType: "C",
    variables: {
      PROJECT_NAME: "TestProject",
      USER_NAME: "Developer",
      SERVICE_TARGET: "User",
      INTERACTION_STYLE: "Technical, concise",
    },
  });

  const fullModeOutput = assembleTemplate({
    planType: "C",
    variables: {
      PROJECT_NAME: "TestProject",
      USER_NAME: "Developer",
      SERVICE_TARGET: "B2B SaaS Internal Users",
      INTERACTION_STYLE: "Professional and thorough",
      PROJECT_STRUCTURE: "src/\n  modules/\ntests/",
      TECH_STACK_TABLE: "| Frontend | React |",
      PROHIBITIONS: "- No any types",
    },
  });

  test("should produce output in both modes", () => {
    expect(quickModeOutput.length).toBeGreaterThan(0);
    expect(fullModeOutput.length).toBeGreaterThan(0);
  });

  test("should include Iron Rules section in both modes", () => {
    expect(quickModeOutput).toContain("## Iron Rules");
    expect(fullModeOutput).toContain("## Iron Rules");
  });

  test("should include Development Protocol in both modes", () => {
    expect(quickModeOutput).toContain("Development Protocol");
    expect(fullModeOutput).toContain("Development Protocol");
  });

  test("should include Workflow Rules in both modes", () => {
    expect(quickModeOutput).toContain("Workflow Rules");
    expect(fullModeOutput).toContain("Workflow Rules");
  });

  test("should produce same sections in both modes", () => {
    const quickSections = extractHeadings(quickModeOutput, ["## "]);
    const fullSections = extractHeadings(fullModeOutput, ["## "]);
    expect(quickSections).toEqual(fullSections);
  });

  test("should have same structure regardless of mode", () => {
    const quickStructure = extractHeadings(quickModeOutput, ["## ", "### "]);
    const fullStructure = extractHeadings(fullModeOutput, ["## ", "### "]);
    expect(quickStructure).toEqual(fullStructure);
  });
});

describe("Core Philosophy Preservation", () => {
  const output = assembleTemplate({
    planType: "C",
    variables: {
      PROJECT_NAME: "TestProject",
    },
  });

  test("output should contain IMMUTABLE LAYER", () => {
    expect(output).toContain("IMMUTABLE LAYER");
  });

  test("output should contain MUTABLE LAYER", () => {
    expect(output).toContain("MUTABLE LAYER");
  });

  test("output should contain NEW_FEATURE_FLOW", () => {
    expect(output).toContain("NEW_FEATURE_FLOW");
  });

  test("output should contain BUG_FIX_FLOW", () => {
    expect(output).toContain("BUG_FIX_FLOW");
  });

  test("output should contain core philosophy", () => {
    expect(output).toContain("Code is toilet paper");
  });

  test("output should contain source-of-truth principle", () => {
    expect(output.toLowerCase()).toContain("source of truth");
  });

  test("output should contain Good Taste principles", () => {
    expect(output).toContain("Good Taste");
  });

  test("output should contain Zero Compatibility Debt", () => {
    expect(output).toContain("Zero Compatibility Debt");
  });
});

describe("Cloudflare Conditional Inclusion", () => {
  test("Plan C should include Cloudflare section", () => {
    const output = assembleTemplate({
      planType: "C",
      variables: { PROJECT_NAME: "Test" },
    });
    expect(output).toContain("Cloudflare Deployment");
  });

  test("Plan B (UmiJS) should exclude Cloudflare section", () => {
    const output = assembleTemplate({
      planType: "B",
      variables: { PROJECT_NAME: "Test" },
    });
    expect(output).not.toContain("Cloudflare Deployment");
  });

  test("Plan F (Mobile) should exclude Cloudflare section", () => {
    const output = assembleTemplate({
      planType: "F",
      variables: { PROJECT_NAME: "Test" },
    });
    expect(output).not.toContain("Cloudflare Deployment");
  });

  test("Plan J (TUI) should exclude Cloudflare section", () => {
    const output = assembleTemplate({
      planType: "J",
      variables: { PROJECT_NAME: "Test" },
    });
    expect(output).not.toContain("Cloudflare Deployment");
  });

  test("Explicit --no-cloudflare should exclude section", () => {
    const output = assembleTemplate({
      planType: "C",
      variables: { PROJECT_NAME: "Test" },
      cloudflareNative: false,
    });
    expect(output).not.toContain("Cloudflare Deployment");
  });
});

describe("Output Quality Gates", () => {
  test("should reference project-local reference configs", () => {
    const output = assembleTemplate({
      planType: "B",
      variables: { PROJECT_NAME: "Test" },
    });

    expect(output).toContain("docs/reference-configs/changelog-versioning.yaml.md");
    expect(output).toContain("docs/reference-configs/git-strategy.yaml.md");
    expect(output).toContain("docs/reference-configs/release-deploy.yaml.md");
    expect(output).toContain("docs/reference-configs/ai-workflows.yaml.md");
    expect(output).not.toContain("assets/reference-configs/");
  });

  test("should use tasks files as primary workflow contracts", () => {
    const claude = assembleTemplate({
      planType: "B",
      variables: { PROJECT_NAME: "Test" },
    });

    const agents = assembleTemplate({
      target: "agents",
      planType: "B",
      variables: { PROJECT_NAME: "Test" },
    });

    expect(claude).toContain("tasks/todo.md");
    expect(claude).toContain("tasks/lessons.md");
    expect(agents).toContain("tasks/todo.md");
    expect(agents).toContain("tasks/lessons.md");
    expect(claude).toContain("Self-Improvement Loop");
    expect(agents).toContain("Self-Improvement Loop");

    // Compatibility references should still exist.
    expect(claude).toContain("docs/PROGRESS.md");
    expect(agents).toContain("docs/PROGRESS.md");
  });

  test("should stay within line-count budgets", () => {
    const claudeNoCloudflare = assembleTemplate({
      planType: "B",
      variables: { PROJECT_NAME: "Test" },
    });
    const claudeWithCloudflare = assembleTemplate({
      planType: "C",
      variables: { PROJECT_NAME: "Test" },
    });
    const agentsWithCloudflare = assembleTemplate({
      target: "agents",
      planType: "C",
      variables: { PROJECT_NAME: "Test" },
    });

    expect(countLines(claudeNoCloudflare)).toBeLessThanOrEqual(700);
    expect(countLines(claudeWithCloudflare)).toBeLessThanOrEqual(980);
    expect(countLines(agentsWithCloudflare)).toBeLessThanOrEqual(420);
  });
});
