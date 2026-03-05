#!/usr/bin/env bun
/**
 * Skill Version Consistency Checker
 *
 * Validates that version numbers are consistent across:
 * - package.json
 * - assets/skill-version.json
 * - SKILL.md frontmatter
 *
 * Also checks if a generated project needs migration.
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, "..");

export interface ConsistencyResult {
  consistent: boolean;
  packageJsonVersion: string;
  skillVersionJsonVersion: string;
  skillMdVersion: string;
  errors: string[];
}

export interface MigrationCheckResult {
  needsMigration: boolean;
  currentSkillVersion: string;
  projectSkillVersion: string | null;
  projectTemplatVersion: string | null;
}

/**
 * Extract version from SKILL.md frontmatter.
 */
export function extractSkillMdVersion(skillMdPath: string = join(REPO_ROOT, "SKILL.md")): string {
  if (!existsSync(skillMdPath)) {
    throw new Error(`SKILL.md not found at ${skillMdPath}`);
  }

  const content = readFileSync(skillMdPath, "utf-8");
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error("SKILL.md missing frontmatter");
  }

  const versionMatch = frontmatterMatch[1].match(/^version:\s*(.+)$/m);
  if (!versionMatch) {
    throw new Error("SKILL.md frontmatter missing version field");
  }

  return versionMatch[1].trim();
}

/**
 * Check version consistency across all sources.
 */
export function checkConsistency(repoRoot: string = REPO_ROOT): ConsistencyResult {
  const errors: string[] = [];

  // Read package.json
  const pkgPath = join(repoRoot, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error(`package.json not found at ${pkgPath}`);
  }
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const packageJsonVersion = pkg.version as string;

  // Read skill-version.json
  const svPath = join(repoRoot, "assets", "skill-version.json");
  if (!existsSync(svPath)) {
    throw new Error(`skill-version.json not found at ${svPath}`);
  }
  const sv = JSON.parse(readFileSync(svPath, "utf-8"));
  const skillVersionJsonVersion = sv.version as string;

  // Read SKILL.md
  const skillMdVersion = extractSkillMdVersion(join(repoRoot, "SKILL.md"));

  // Check consistency
  if (packageJsonVersion !== skillVersionJsonVersion) {
    errors.push(
      `package.json (${packageJsonVersion}) != skill-version.json (${skillVersionJsonVersion})`
    );
  }

  if (packageJsonVersion !== skillMdVersion) {
    errors.push(
      `package.json (${packageJsonVersion}) != SKILL.md (${skillMdVersion})`
    );
  }

  if (skillVersionJsonVersion !== skillMdVersion) {
    errors.push(
      `skill-version.json (${skillVersionJsonVersion}) != SKILL.md (${skillMdVersion})`
    );
  }

  return {
    consistent: errors.length === 0,
    packageJsonVersion,
    skillVersionJsonVersion,
    skillMdVersion,
    errors,
  };
}

/**
 * Check if a generated project needs migration.
 */
export function checkProjectNeedsMigration(
  projectPath: string,
  repoRoot: string = REPO_ROOT
): MigrationCheckResult {
  const svPath = join(repoRoot, "assets", "skill-version.json");
  const sv = JSON.parse(readFileSync(svPath, "utf-8"));
  const currentSkillVersion = sv.version as string;

  const stampPath = join(projectPath, ".claude", ".skill-version");
  if (!existsSync(stampPath)) {
    return {
      needsMigration: true,
      currentSkillVersion,
      projectSkillVersion: null,
      projectTemplatVersion: null,
    };
  }

  const stampContent = readFileSync(stampPath, "utf-8");
  const skillVersionMatch = stampContent.match(/^skill_version=(.+)$/m);
  const templateVersionMatch = stampContent.match(/^template_version=(.+)$/m);

  const projectSkillVersion = skillVersionMatch?.[1] ?? null;
  const projectTemplatVersion = templateVersionMatch?.[1] ?? null;

  return {
    needsMigration: projectSkillVersion !== currentSkillVersion,
    currentSkillVersion,
    projectSkillVersion,
    projectTemplatVersion,
  };
}

// CLI entry point
if (import.meta.main) {
  const args = process.argv.slice(2);
  const projectIdx = args.indexOf("--project");
  const projectPath = projectIdx !== -1 ? args[projectIdx + 1] : null;

  try {
    const result = checkConsistency();

    if (result.consistent) {
      console.log(`Version consistency check passed: ${result.packageJsonVersion}`);
    } else {
      console.error("Version consistency check FAILED:");
      for (const error of result.errors) {
        console.error(`  - ${error}`);
      }
      process.exit(1);
    }

    if (projectPath) {
      const migration = checkProjectNeedsMigration(projectPath);
      if (migration.needsMigration) {
        console.log(
          `Project at ${projectPath} needs migration: ` +
          `${migration.projectSkillVersion ?? "(no stamp)"} → ${migration.currentSkillVersion}`
        );
      } else {
        console.log(`Project at ${projectPath} is up to date (${migration.currentSkillVersion})`);
      }
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
