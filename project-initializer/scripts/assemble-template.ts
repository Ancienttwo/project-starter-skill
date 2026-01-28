#!/usr/bin/env bun
/**
 * Template Assembly Script
 *
 * Concatenates partial files and performs variable substitution
 * to generate the final CLAUDE.md output.
 *
 * Usage:
 *   bun scripts/assemble-template.ts --help
 *   bun scripts/assemble-template.ts --plan C --name "MyProject"
 *   bun scripts/assemble-template.ts --quick --name "MyProject" --type C --pm bun
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ============================================================================
// Types
// ============================================================================

export interface AssemblyOptions {
  planType: string; // "A" | "B" | "C" | "D" | "F" | "G" | "H" | "J" | "K"
  variables: Record<string, string>;
  cloudflareNative?: boolean;
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
const VERSIONS_FILE = join(ASSETS_DIR, "versions.json");

// Plans that include Cloudflare section
const CLOUDFLARE_PLANS = new Set(["A", "C", "C+", "D"]);
// Plans that include partial Cloudflare (containers or workers only)
const CLOUDFLARE_PARTIAL_PLANS = new Set(["G", "H"]);

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Load versions from versions.json
 */
export function loadVersions(): Record<string, string> {
  if (!existsSync(VERSIONS_FILE)) {
    throw new Error(`versions.json not found at ${VERSIONS_FILE}`);
  }

  const raw = readFileSync(VERSIONS_FILE, "utf-8");
  const parsed = JSON.parse(raw);

  // Flatten nested structure to flat key-value
  const versions: Record<string, string> = {};

  for (const [category, items] of Object.entries(parsed)) {
    if (category.startsWith("$")) continue; // Skip $schema, $comment
    if (typeof items === "object" && items !== null) {
      for (const [key, value] of Object.entries(items as Record<string, string>)) {
        // Convert to VERSION_XXX format (uppercase, hyphens to underscores)
        const varName = `VERSION_${key.toUpperCase().replace(/-/g, "_")}`;
        versions[varName] = value;
      }
    }
  }

  return versions;
}

/**
 * Get ordered list of partial files
 */
export function getPartials(): PartialInfo[] {
  const files = readdirSync(PARTIALS_DIR).filter(
    (f) => f.endsWith(".partial.md") && /^\d{2}-/.test(f)
  );

  return files
    .map((f) => {
      const order = parseInt(f.substring(0, 2), 10);
      const name = f.replace(".partial.md", "");
      const conditional = name === "06-cloudflare" ? "CLOUDFLARE_NATIVE" : undefined;

      return {
        name,
        path: join(PARTIALS_DIR, f),
        order,
        conditional,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Read a partial file content
 */
export function readPartial(partialPath: string): string {
  if (!existsSync(partialPath)) {
    throw new Error(`Partial not found: ${partialPath}`);
  }
  return readFileSync(partialPath, "utf-8");
}

/**
 * Determine if Cloudflare section should be included
 */
export function shouldIncludeCloudflare(planType: string, explicitFlag?: boolean): boolean {
  if (explicitFlag !== undefined) {
    return explicitFlag;
  }
  return CLOUDFLARE_PLANS.has(planType) || CLOUDFLARE_PARTIAL_PLANS.has(planType);
}

/**
 * Replace variables in template content
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
 * Process conditional blocks
 * Format: {{#IF CONDITION}}...content...{{/IF}}
 */
export function processConditionals(
  content: string,
  conditions: Record<string, boolean>
): string {
  let result = content;

  // Match {{#IF CONDITION}}...{{/IF}} blocks (including newlines)
  const ifPattern = /\{\{#IF\s+(\w+)\}\}([\s\S]*?)\{\{\/IF\}\}/g;

  result = result.replace(ifPattern, (match, condition, innerContent) => {
    const shouldInclude = conditions[condition] ?? false;
    return shouldInclude ? innerContent : "";
  });

  return result;
}

/**
 * Main assembly function
 */
export function assembleTemplate(options: AssemblyOptions): string {
  const { planType, variables, cloudflareNative } = options;

  // Load version variables
  const versions = loadVersions();

  // Merge all variables (user variables take precedence)
  const allVariables: Record<string, string> = {
    ...versions,
    ...variables,
    PLAN_TYPE: planType,
  };

  // Get partials
  const partials = getPartials();

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
  --plan <type>       Plan type (A, B, C, D, F, G, H, J, K)
  --name <name>       Project name
  --quick             Quick mode (minimal questions)
  --no-cloudflare     Exclude Cloudflare section
  --var KEY=VALUE     Set a template variable

Examples:
  bun scripts/assemble-template.ts --plan C --name MyProject
  bun scripts/assemble-template.ts --plan B --name CRM --no-cloudflare
  bun scripts/assemble-template.ts --plan C --var USER_NAME=John --var SERVICE_TARGET=B2B
`);
}

function parseArgs(args: string[]): {
  help: boolean;
  plan: string;
  name: string;
  quick: boolean;
  cloudflare: boolean | undefined;
  variables: Record<string, string>;
} {
  const result = {
    help: false,
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
      case "--var":
        const varArg = args[++i];
        if (varArg && varArg.includes("=")) {
          const [key, ...valueParts] = varArg.split("=");
          result.variables[key] = valueParts.join("=");
        }
        break;
    }
  }

  return result;
}

// Main entry point (only runs when executed directly)
if (import.meta.main) {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  const options: AssemblyOptions = {
    planType: parsed.plan,
    variables: {
      PROJECT_NAME: parsed.name,
      ...parsed.variables,
    },
    cloudflareNative: parsed.cloudflare,
  };

  try {
    const output = assembleTemplate(options);
    console.log(output);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
