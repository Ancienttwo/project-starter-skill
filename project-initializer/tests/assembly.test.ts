import { describe, test, expect } from "bun:test";
import {
  getPartials,
  readPartial,
  processConditionals,
  assembleTemplate,
  shouldIncludeCloudflare,
} from "../scripts/assemble-template";

describe("Template Assembly", () => {
  test("should read partials in correct order", () => {
    const partials = getPartials();
    expect(partials.length).toBeGreaterThanOrEqual(7);
    
    for (let i = 1; i < partials.length; i++) {
      expect(partials[i].order).toBeGreaterThan(partials[i - 1].order);
    }
  });

  test("should have expected partial names", () => {
    const partials = getPartials();
    const names = partials.map((p) => p.name);
    
    expect(names).toContain("01-header");
    expect(names).toContain("02-iron-rules");
    expect(names).toContain("03-philosophy");
    expect(names).toContain("04-project-structure");
    expect(names).toContain("05-workflow");
    expect(names).toContain("06-cloudflare");
    expect(names).toContain("07-footer");
  });

  test("should read partial content", () => {
    const partials = getPartials();
    const firstPartial = partials[0];
    
    const content = readPartial(firstPartial.path);
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });

  test("should mark 06-cloudflare as conditional", () => {
    const partials = getPartials();
    const cloudflarePartial = partials.find((p) => p.name === "06-cloudflare");
    
    expect(cloudflarePartial).toBeDefined();
    expect(cloudflarePartial?.conditional).toBe("CLOUDFLARE_NATIVE");
  });

  test.todo("should concatenate partials without gaps");
  test.todo("should preserve line breaks between partials");
});

describe("Conditional Sections", () => {
  test("should include section when condition is true", () => {
    const content = "Before {{#IF TEST}}included{{/IF}} After";
    const result = processConditionals(content, { TEST: true });
    expect(result).toBe("Before included After");
  });

  test("should exclude section when condition is false", () => {
    const content = "Before {{#IF TEST}}excluded{{/IF}} After";
    const result = processConditionals(content, { TEST: false });
    expect(result).toBe("Before  After");
  });

  test("should handle multiline conditional blocks", () => {
    const content = `Start
{{#IF CLOUDFLARE_NATIVE}}
Line 1
Line 2
{{/IF}}
End`;
    const result = processConditionals(content, { CLOUDFLARE_NATIVE: true });
    expect(result).toContain("Line 1");
    expect(result).toContain("Line 2");
  });

  test("should handle multiple conditional blocks", () => {
    const content = "{{#IF A}}a{{/IF}} {{#IF B}}b{{/IF}}";
    const result = processConditionals(content, { A: true, B: false });
    expect(result).toBe("a ");
  });

  test.todo("should handle nested conditionals");
  test.todo("should error on malformed conditional syntax");
});

describe("Cloudflare Plan Detection", () => {
  test("should include cloudflare for Plan C", () => {
    expect(shouldIncludeCloudflare("C")).toBe(true);
  });

  test("should include cloudflare for Plan A (Remix)", () => {
    expect(shouldIncludeCloudflare("A")).toBe(true);
  });

  test("should exclude cloudflare for Plan B (UmiJS)", () => {
    expect(shouldIncludeCloudflare("B")).toBe(false);
  });

  test("should exclude cloudflare for Plan F (Mobile)", () => {
    expect(shouldIncludeCloudflare("F")).toBe(false);
  });

  test("should exclude cloudflare for Plan J (TUI)", () => {
    expect(shouldIncludeCloudflare("J")).toBe(false);
  });

  test("should respect explicit flag over plan type", () => {
    expect(shouldIncludeCloudflare("C", false)).toBe(false);
    expect(shouldIncludeCloudflare("B", true)).toBe(true);
  });
});

describe("Full Assembly", () => {
  test("should assemble template with variables", () => {
    const result = assembleTemplate({
      planType: "C",
      variables: {
        PROJECT_NAME: "TestProject",
      },
    });
    
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  test.todo("should handle missing partials gracefully");
});
