import { describe, test, expect } from "bun:test";
import { assembleTemplate } from "../scripts/assemble-template";

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

  test.todo("should produce same sections in both modes");
  test.todo("should have same structure regardless of mode");
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
