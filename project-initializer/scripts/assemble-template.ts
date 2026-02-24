#!/usr/bin/env bun
/**
 * Template Assembly Script
 *
 * Concatenates partial files and performs variable substitution
 * to generate CLAUDE.md or AGENTS.md outputs.
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ============================================================================
// Types
// ============================================================================

export type TemplateTarget = "claude" | "agents";

export interface AssemblyOptions {
  planType: string; // "A" | "B" | "C" | "D" | "F" | "G" | "H" | "J" | "K"
  variables: Record<string, string>;
  cloudflareNative?: boolean;
  target?: TemplateTarget;
}

export interface PartialInfo {
  name: string;
  path: string;
  order: number;
  conditional?: string; // e.g., "CLOUDFLARE_NATIVE"
}

// ============================================================================
// Constants
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ASSETS_DIR = join(__dirname, "..", "assets");
const PARTIALS_DIR = join(ASSETS_DIR, "partials");
const PARTIALS_AGENTS_DIR = join(ASSETS_DIR, "partials-agents");
const VERSIONS_FILE = join(ASSETS_DIR, "versions.json");

const TARGET_DIRS: Record<TemplateTarget, string> = {
  claude: PARTIALS_DIR,
  agents: PARTIALS_AGENTS_DIR,
};

// Plans that include Cloudflare section
const CLOUDFLARE_PLANS = new Set(["A", "C", "C+", "D"]);
// Plans that include partial Cloudflare (containers or workers only)
const CLOUDFLARE_PARTIAL_PLANS = new Set(["G", "H"]);

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Validate supported version syntax in versions.json.
 */
export function isValidVersionString(value: string): boolean {
  if (value === "latest") return true;
  if (/^\d+$/.test(value)) return true; // 19
  if (/^\d+\.x(?:-[0-9A-Za-z.-]+)?$/.test(value)) return true; // 6.x, 3.x-beta
  if (/^\d+(?:\.\d+){1,2}(?:-[0-9A-Za-z.-]+)?$/.test(value)) return true; // 2.0, 1.0.0-beta
  if (/^\d+(?:\.\d+)+\+$/.test(value)) return true; // 0.110+, 0.84+
  return false;
}

/**
 * Parse CLI target argument safely.
 */
export function parseTarget(value: string): TemplateTarget {
  if (value === "claude" || value === "agents") {
    return value;
  }

  throw new Error(
    `Invalid target: ${value}. Expected one of: claude, agents.`
  );
}

/**
 * Load versions from versions.json.
 */
export function loadVersions(versionsFilePath: string = VERSIONS_FILE): Record<string, string> {
  if (!existsSync(versionsFilePath)) {
    throw new Error(`versions.json not found at ${versionsFilePath}`);
  }

  let parsed: unknown;
  try {
    const raw = readFileSync(versionsFilePath, "utf-8");
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Failed to parse versions.json at ${versionsFilePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`Invalid versions.json format at ${versionsFilePath}: root must be an object`);
  }

  // Flatten nested structure to flat key-value
  const versions: Record<string, string> = {};

  for (const [category, items] of Object.entries(parsed as Record<string, unknown>)) {
    if (category.startsWith("$")) continue; // Skip $schema, $comment
    if (typeof items !== "object" || items === null) continue;

    for (const [key, value] of Object.entries(items as Record<string, unknown>)) {
      if (typeof value !== "string") {
        throw new Error(
          `Invalid version value for ${category}.${key}: expected string, got ${typeof value}`
        );
      }

      if (!isValidVersionString(value)) {
        throw new Error(
          `Invalid version format for ${category}.${key}: "${value}"`
        );
      }

      // Convert to VERSION_XXX format (uppercase, hyphens to underscores)
      const varName = `VERSION_${key.toUpperCase().replace(/-/g, "_")}`;
      versions[varName] = value;
    }
  }

  return versions;
}

/**
 * Get ordered list of partial files.
 */
export function getPartials(target: TemplateTarget = "claude"): PartialInfo[] {
  const partialDir = TARGET_DIRS[target];

  if (!existsSync(partialDir)) {
    throw new Error(`Partials directory not found for target "${target}": ${partialDir}`);
  }

  const files = readdirSync(partialDir).filter(
    (f) => f.endsWith(".partial.md") && /^\d{2}-/.test(f)
  );

  if (files.length === 0) {
    throw new Error(`No partial files found for target "${target}" in ${partialDir}`);
  }

  return files
    .map((f) => {
      const order = parseInt(f.substring(0, 2), 10);
      const name = f.replace(".partial.md", "");
      const conditional = name.includes("cloudflare") ? "CLOUDFLARE_NATIVE" : undefined;

      return {
        name,
        path: join(partialDir, f),
        order,
        conditional,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Read a partial file content.
 */
export function readPartial(partialPath: string): string {
  if (!existsSync(partialPath)) {
    throw new Error(`Partial not found: ${partialPath}`);
  }
  return readFileSync(partialPath, "utf-8");
}

/**
 * Determine if Cloudflare section should be included.
 */
export function shouldIncludeCloudflare(planType: string, explicitFlag?: boolean): boolean {
  if (explicitFlag !== undefined) {
    return explicitFlag;
  }
  return CLOUDFLARE_PLANS.has(planType) || CLOUDFLARE_PARTIAL_PLANS.has(planType);
}

/**
 * Replace variables in template content.
 * Format: {{VARIABLE_NAME}} -> value
 */
export function replaceVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  let iterations = 0;
  const maxIterations = 2; // Prevent circular references

  while (iterations < maxIterations) {
    let changed = false;

    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      const newResult = result.replace(pattern, value);
      if (newResult !== result) {
        changed = true;
        result = newResult;
      }
    }

    if (!changed) break;
    iterations++;
  }

  return result;
}

/**
 * Process conditional blocks with nested support.
 * Format: {{#IF CONDITION}}...content...{{/IF}}
 */
export function processConditionals(
  content: string,
  conditions: Record<string, boolean>
): string {
  const closeTag = "{{/IF}}";
  let result = content;
  let iterations = 0;

  while (true) {
    const closeIndex = result.indexOf(closeTag);
    const hasOpenTag = result.includes("{{#IF");

    if (closeIndex === -1) {
      if (hasOpenTag) {
        throw new Error("Malformed conditional block: missing {{/IF}}");
      }
      break;
    }

    const head = result.slice(0, closeIndex);
    const matches = [...head.matchAll(/\{\{#IF\s+(\w+)\}\}/g)];

    if (matches.length === 0) {
      throw new Error("Malformed conditional block: unexpected {{/IF}}");
    }

    const openMatch = matches[matches.length - 1];
    const openTag = openMatch[0];
    const condition = openMatch[1];
    const openStart = openMatch.index as number;
    const openEnd = openStart + openTag.length;

    const innerContent = result.slice(openEnd, closeIndex);
    const shouldInclude = conditions[condition] ?? false;
    const replacement = shouldInclude ? innerContent : "";

    result =
      result.slice(0, openStart) +
      replacement +
      result.slice(closeIndex + closeTag.length);

    iterations++;
    if (iterations > 10000) {
      throw new Error("Conditional processing exceeded safe iteration limit");
    }
  }

  if (result.includes("{{/IF}}")) {
    throw new Error("Malformed conditional block: unexpected {{/IF}}");
  }

  return result;
}

/**
 * Main assembly function.
 */
export function assembleTemplate(options: AssemblyOptions): string {
  const { planType, variables, cloudflareNative, target = "claude" } = options;

  // Load version variables
  const versions = loadVersions();

  // Merge all variables (user variables take precedence)
  const allVariables: Record<string, string> = {
    ...versions,
    ...variables,
    PLAN_TYPE: planType,
  };

  // Get partials
  const partials = getPartials(target);

  // Determine conditions
  const includeCloudflare = shouldIncludeCloudflare(planType, cloudflareNative);
  const conditions: Record<string, boolean> = {
    CLOUDFLARE_NATIVE: includeCloudflare,
  };

  // Concatenate partials
  const parts: string[] = [];

  for (const partial of partials) {
    // Skip conditional partials if condition is false
    if (partial.conditional && !conditions[partial.conditional]) {
      continue;
    }

    const content = readPartial(partial.path);
    parts.push(content);
  }

  let assembled = parts.join("\n\n");

  // Process conditionals first
  assembled = processConditionals(assembled, conditions);

  // Then replace variables
  assembled = replaceVariables(assembled, allVariables);

  return assembled;
}

// ============================================================================
// CLI
// ============================================================================

function printHelp() {
  console.log(`
Template Assembly Script

Usage:
  bun scripts/assemble-template.ts [options]

Options:
  --help              Show this help message
  --target <name>     Output target: claude (default) | agents
  --plan <type>       Plan type (A, B, C, D, F, G, H, J, K)
  --name <name>       Project name
  --quick             Quick mode (minimal questions)
  --no-cloudflare     Exclude Cloudflare section
  --cloudflare        Include Cloudflare section
  --var KEY=VALUE     Set a template variable

Examples:
  bun scripts/assemble-template.ts --plan C --name MyProject
  bun scripts/assemble-template.ts --target agents --plan C --name MyProject
  bun scripts/assemble-template.ts --plan B --name CRM --no-cloudflare
  bun scripts/assemble-template.ts --plan C --var USER_NAME=John --var SERVICE_TARGET=B2B
`);
}

function parseArgs(args: string[]): {
  help: boolean;
  target: TemplateTarget;
  plan: string;
  name: string;
  quick: boolean;
  cloudflare: boolean | undefined;
  variables: Record<string, string>;
} {
  const result = {
    help: false,
    target: "claude" as TemplateTarget,
    plan: "C",
    name: "MyProject",
    quick: false,
    cloudflare: undefined as boolean | undefined,
    variables: {} as Record<string, string>,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--help":
      case "-h":
        result.help = true;
        break;
      case "--target": {
        const targetValue = args[++i] || "claude";
        result.target = parseTarget(targetValue);
        break;
      }
      case "--plan":
        result.plan = args[++i] || "C";
        break;
      case "--name":
        result.name = args[++i] || "MyProject";
        break;
      case "--quick":
        result.quick = true;
        break;
      case "--no-cloudflare":
        result.cloudflare = false;
        break;
      case "--cloudflare":
        result.cloudflare = true;
        break;
      case "--var": {
        const varArg = args[++i];
        if (varArg && varArg.includes("=")) {
          const [key, ...valueParts] = varArg.split("=");
          result.variables[key] = valueParts.join("=");
        }
        break;
      }
    }
  }

  return result;
}

// Main entry point (only runs when executed directly)
if (import.meta.main) {
  const args = process.argv.slice(2);

  try {
    const parsed = parseArgs(args);

    if (parsed.help) {
      printHelp();
      process.exit(0);
    }

    const options: AssemblyOptions = {
      planType: parsed.plan,
      target: parsed.target,
      variables: {
        PROJECT_NAME: parsed.name,
        ...parsed.variables,
      },
      cloudflareNative: parsed.cloudflare,
    };

    const output = assembleTemplate(options);
    console.log(output);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
