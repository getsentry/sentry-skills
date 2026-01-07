#!/usr/bin/env bun
/**
 * Apply Sentry skills to a target project for specific AI agents.
 *
 * Usage:
 *   bun run apply <target-path> --agent cursor
 *   bun run apply <target-path> --agent cursor,copilot,zed
 *   bun run apply <target-path> --all
 *   bun run apply <target-path> --agent cursor --force
 */

import { parseArgs } from "util";
import { join, resolve, dirname } from "path";
import { existsSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import matter from "gray-matter";
import * as readline from "readline";

// Agent to output file mapping (what ruler actually generates)
// Based on ruler v0.3.x output
const AGENT_FILES: Record<string, string[]> = {
  cursor: ["AGENTS.md"],
  copilot: ["AGENTS.md"],
  aider: ["AGENTS.md", ".aider.conf.yml"],
  zed: ["AGENTS.md"],
  cline: [".clinerules"],
  windsurf: ["AGENTS.md"],
  goose: [".goosehints"],
  opencode: ["AGENTS.md", "opencode.json"],
  "gemini-cli": ["AGENTS.md"],
  "firebase-studio": [".idx/airules.md"],
  warp: ["WARP.md"],
  trae: [".trae/rules/project_rules.md"],
  "kilo-code": [".kilocode/rules/ruler_kilocode_instructions.md"],
  "roo-code": ["AGENTS.md"],
  "qwen-code": ["AGENTS.md"],
  "augment-code": [".augment/rules/ruler_augment_instructions.md"],
  "amazon-q": [".amazonq/rules/ruler_q_rules.md"],
  kiro: [".kiro/steering/ruler_kiro_instructions.md"],
  junie: [".junie/guidelines.md"],
  "open-hands": [".openhands/microagents/repo.md"],
  crush: ["CRUSH.md"],
  amp: ["AGENTS.md"],
  antigravity: [".agent/rules/ruler.md"],
  firebender: ["firebender.json"],
  "mistral-vibe": ["AGENTS.md"],
  "codex-cli": ["AGENTS.md"],
  jules: ["AGENTS.md"],
  claude: ["CLAUDE.md"],
};

const ALL_AGENTS = Object.keys(AGENT_FILES);

const RULER_COMMANDS = [
  "ruler apply",
  "bunx @intellectronica/ruler apply",
  "npx @intellectronica/ruler apply",
];

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);
const ROOT_DIR = resolve(SCRIPT_DIR, "..");
const SKILLS_DIR = join(ROOT_DIR, "plugins/sentry-skills/skills");
const RULER_DIR = join(ROOT_DIR, ".ruler/sentry-skills");

function isCommandAvailable(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function isRulerAvailable(): boolean {
  for (const cmd of RULER_COMMANDS) {
    try {
      execSync(cmd.replace(" apply", " --version"), { stdio: "pipe", timeout: 10000 });
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

async function ensureRulerInstalled(): Promise<void> {
  if (isRulerAvailable()) {
    return;
  }

  console.log("\n⚠️  Ruler is not installed.");
  console.log("Ruler is required to generate agent config files.\n");

  // Detect available package managers
  const hasNpm = isCommandAvailable("npm");
  const hasBun = isCommandAvailable("bun");

  const options: { name: string; cmd: string }[] = [];
  if (hasBun) options.push({ name: "bun", cmd: "bun add -g @intellectronica/ruler" });
  if (hasNpm) options.push({ name: "npm", cmd: "npm install -g @intellectronica/ruler" });

  if (options.length === 0) {
    console.error("No supported package manager found (npm or bun).");
    console.error("Please install Ruler manually: npm install -g @intellectronica/ruler");
    console.error("More info: https://github.com/intellectronica/ruler");
    process.exit(1);
  }

  // Use the first available option
  const preferred = options[0];
  console.log(`Available installers: ${options.map((o) => o.name).join(", ")}`);

  const answer = await prompt(
    `Install ruler using ${preferred.name}? (${preferred.cmd}) [Y/n]: `
  );

  if (answer === "n" || answer === "no") {
    console.log("\nTo install manually, run one of:");
    for (const opt of options) {
      console.log(`  ${opt.cmd}`);
    }
    process.exit(1);
  }

  console.log(`\nInstalling ruler with ${preferred.name}...`);
  try {
    execSync(preferred.cmd, { stdio: "inherit" });
    console.log("✓ Ruler installed successfully\n");
  } catch (error) {
    console.error(`\nFailed to install ruler. Please install manually:`);
    for (const opt of options) {
      console.log(`  ${opt.cmd}`);
    }
    process.exit(1);
  }
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function parseCliArgs() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      agent: { type: "string", short: "a" },
      all: { type: "boolean" },
      force: { type: "boolean", short: "f" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
Usage: bun run apply <target-path> [options]

Options:
  --agent, -a <agents>  Comma-separated list of agents (e.g., cursor,copilot,zed)
  --all                 Apply for all supported agents
  --force, -f           Overwrite existing files without prompting
  --help, -h            Show this help message

Supported agents:
  ${ALL_AGENTS.join(", ")}

Examples:
  bun run apply ~/projects/my-app --agent cursor
  bun run apply ~/projects/my-app --agent cursor,copilot,aider
  bun run apply ~/projects/my-app --all
  bun run apply ~/projects/my-app --agent cursor --force
`);
    process.exit(0);
  }

  const targetPath = positionals[0];
  if (!targetPath) {
    console.error("Error: Target path is required.");
    console.error("Usage: bun run apply <target-path> --agent <agents>");
    process.exit(1);
  }

  let agents: string[] = [];
  if (values.all) {
    agents = ALL_AGENTS;
  } else if (values.agent) {
    agents = values.agent.split(",").map((a) => a.trim().toLowerCase());
    const invalid = agents.filter((a) => !ALL_AGENTS.includes(a));
    if (invalid.length > 0) {
      console.error(`Error: Unknown agent(s): ${invalid.join(", ")}`);
      console.error(`Supported agents: ${ALL_AGENTS.join(", ")}`);
      process.exit(1);
    }
  } else {
    console.error("Error: Specify --agent <agents> or --all");
    process.exit(1);
  }

  return {
    targetPath: resolve(targetPath),
    agents,
    force: values.force ?? false,
  };
}

function readSkills(): { name: string; content: string }[] {
  const skills: { name: string; content: string }[] = [];

  if (!existsSync(SKILLS_DIR)) {
    console.error(`Error: Skills directory not found: ${SKILLS_DIR}`);
    process.exit(1);
  }

  const skillDirs = readdirSync(SKILLS_DIR).filter((d) =>
    statSync(join(SKILLS_DIR, d)).isDirectory()
  );

  for (const dir of skillDirs) {
    const skillFile = join(SKILLS_DIR, dir, "SKILL.md");
    if (existsSync(skillFile)) {
      const raw = readFileSync(skillFile, "utf-8");
      const { data, content } = matter(raw);

      // Generate markdown with skill name as header
      const skillContent = `# ${data.name || dir}\n\n${data.description ? `> ${data.description}\n\n` : ""}${content.trim()}`;

      skills.push({
        name: data.name || dir,
        content: skillContent,
      });
    }
  }

  return skills;
}

function generateRulerContent(skills: { name: string; content: string }[]) {
  // Clean up any existing ruler directory
  if (existsSync(RULER_DIR)) {
    rmSync(RULER_DIR, { recursive: true });
  }

  // Create ruler directory
  mkdirSync(RULER_DIR, { recursive: true });

  // Write each skill as a separate file
  for (const skill of skills) {
    const filePath = join(RULER_DIR, `${skill.name}.md`);
    const header = `<!-- Generated from SKILL.md - do not edit directly -->\n\n`;
    writeFileSync(filePath, header + skill.content);
  }

  console.log(`Generated ruler content from ${skills.length} skills`);
}

function runRuler() {
  console.log("Running ruler apply...");

  for (const cmd of RULER_COMMANDS) {
    try {
      execSync(cmd, {
        cwd: ROOT_DIR,
        stdio: "pipe",
      });
      return; // Success
    } catch {
      continue; // Try next command
    }
  }

  console.error("Error running ruler. Please install it:");
  console.error("  npm install -g @intellectronica/ruler");
  console.error("  # or");
  console.error("  bun add -g @intellectronica/ruler");
  process.exit(1);
}

function getGeneratedFiles(agents: string[]): string[] {
  return [...new Set(agents.flatMap((a) => AGENT_FILES[a] || []))];
}

async function copyToTarget(
  targetPath: string,
  agents: string[],
  force: boolean
): Promise<string[]> {
  const files = getGeneratedFiles(agents);
  const copied: string[] = [];

  for (const file of files) {
    const sourcePath = join(ROOT_DIR, file);
    const destPath = join(targetPath, file);

    // Check if source file was generated
    if (!existsSync(sourcePath)) {
      continue;
    }

    // Check if destination exists
    if (existsSync(destPath) && !force) {
      const answer = await prompt(
        `\n⚠️  ${file} already exists in target.\n   Overwrite? [y/N]: `
      );
      if (answer !== "y" && answer !== "yes") {
        console.log(`   Skipped ${file}`);
        continue;
      }
    }

    // Create parent directory if needed
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    // Copy file
    copyFileSync(sourcePath, destPath);
    copied.push(file);
  }

  return copied;
}

function cleanup() {
  // Clean up generated ruler content
  if (existsSync(RULER_DIR)) {
    rmSync(RULER_DIR, { recursive: true });
  }

  // Clean up generated agent files in this repo
  for (const file of getGeneratedFiles(ALL_AGENTS)) {
    const filePath = join(ROOT_DIR, file);
    if (existsSync(filePath)) {
      rmSync(filePath, { recursive: statSync(filePath).isDirectory() });
    }
  }

  // Clean up parent .ruler directory if empty
  const parentRulerDir = join(ROOT_DIR, ".ruler");
  if (existsSync(parentRulerDir)) {
    try {
      const contents = readdirSync(parentRulerDir);
      if (contents.length === 0) {
        rmSync(parentRulerDir, { recursive: true });
      }
    } catch {
      // Ignore errors
    }
  }
}

async function main() {
  const { targetPath, agents, force } = parseCliArgs();

  // Verify target exists
  if (!existsSync(targetPath)) {
    console.error(`Error: Target path does not exist: ${targetPath}`);
    process.exit(1);
  }

  // Ensure ruler is installed (will prompt to install if missing)
  await ensureRulerInstalled();

  console.log(`\nApplying Sentry skills to: ${targetPath}`);
  console.log(`Agents: ${agents.join(", ")}\n`);

  try {
    // Step 1: Read skills
    const skills = readSkills();
    if (skills.length === 0) {
      console.error("Error: No skills found");
      process.exit(1);
    }

    // Step 2: Generate ruler content
    generateRulerContent(skills);

    // Step 3: Run ruler apply
    runRuler();

    // Step 4: Copy files to target
    console.log(`\nCopying to ${targetPath}...`);
    const copied = await copyToTarget(targetPath, agents, force);

    // Step 5: Cleanup
    cleanup();

    // Summary
    if (copied.length > 0) {
      console.log("\n" + copied.map((f) => `✓ Created ${f}`).join("\n"));
      console.log(
        `\nDone! Sentry skills are now available in ${agents.join(", ")}.`
      );
    } else {
      console.log("\nNo files were copied.");
    }
  } catch (error) {
    cleanup();
    throw error;
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
