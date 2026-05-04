#!/usr/bin/env npx tsx
import * as clack from "@clack/prompts";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { basename, dirname, resolve } from "path";

const VAULT_ZIP_URL =
  "https://github.com/dodycode/obsidian-starter-vault/archive/refs/heads/main.zip";

function isCancel<T>(value: T | symbol): value is symbol {
  return clack.isCancel(value);
}

function exitCancel() {
  clack.cancel("Operation cancelled.");
  process.exit(0);
}

// ── Project detection ───────────────────────────────────────────────────

const SYSTEM_DIRS = ["/", "/tmp", resolve("/tmp"), homedir(), resolve(homedir())];

const PROJECT_INDICATORS = [
  ".git",
  "package.json",
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "pyproject.toml",
  "composer.json",
  "Gemfile",
];

function isSystemDir(dirPath: string): boolean {
  const resolved = resolve(dirPath);
  return SYSTEM_DIRS.includes(resolved);
}

function isProjectFolder(
  dirPath: string,
  existsSyncFn: typeof existsSync = existsSync,
): boolean {
  const resolved = resolve(dirPath);

  if (isSystemDir(resolved)) {
    return false;
  }

  return PROJECT_INDICATORS.some((indicator) =>
    existsSyncFn(`${resolved}/${indicator}`),
  );
}

function findProjectFolder(
  startPath: string,
  existsSyncFn: typeof existsSync = existsSync,
): string | null {
  let current = resolve(startPath);

  while (true) {
    if (isProjectFolder(current, existsSyncFn)) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return null;
}

// ── Pure functions (testable core) ──────────────────────────────────────

function parseArgs(argv: string[]): Record<string, string | undefined> {
  const args: Record<string, string | undefined> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-/g, "_");
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = "true";
      }
    }
  }
  return args;
}

function getEnvOrArg(
  key: string,
  args: Record<string, string | undefined>,
  env: Record<string, string | undefined>,
): string | undefined {
  return args[key] || env[key.toUpperCase()];
}

function detectMode(
  args: Record<string, string | undefined>,
  env: Record<string, string | undefined>,
): { mode: "existing" | "new"; existingProjectPath?: string } {
  const projectPath = getEnvOrArg("project_path", args, env);
  if (projectPath) {
    return { mode: "existing", existingProjectPath: resolve(projectPath) };
  }
  return { mode: "new" };
}

function isNonInteractive(
  args: Record<string, string | undefined>,
  env: Record<string, string | undefined>,
): boolean {
  return (
    args.non_interactive === "true" ||
    getEnvOrArg("project_path", args, env) !== undefined ||
    getEnvOrArg("workspace", args, env) !== undefined
  );
}

function resolveWorkspace(
  args: Record<string, string | undefined>,
  env: Record<string, string | undefined>,
  existingProjectPath: string | undefined,
  cwd: string,
): string {
  const workspaceArg = getEnvOrArg("workspace", args, env);
  if (workspaceArg) {
    return resolve(workspaceArg);
  }

  if (existingProjectPath) {
    return `${dirname(existingProjectPath)}/${basename(existingProjectPath)}-workspace`;
  }

  return `${cwd}/my-project-workspace`;
}

function resolveProjectName(
  args: Record<string, string | undefined>,
  env: Record<string, string | undefined>,
  existingProjectPath: string | undefined,
): string {
  const projectNameArg = getEnvOrArg("project_name", args, env);
  if (projectNameArg) {
    return projectNameArg;
  }

  if (existingProjectPath) {
    return basename(existingProjectPath);
  }

  return "my-app";
}

function resolveUserName(
  args: Record<string, string | undefined>,
  env: Record<string, string | undefined>,
): string {
  const userNameArg = getEnvOrArg("user_name", args, env);
  if (userNameArg) {
    return userNameArg;
  }

  return env.USER || "dody";
}

function validateProjectName(name: string): string | undefined {
  if (!name) return "Project name is required";
  if (!/^[a-zA-Z0-9_-]+$/.test(name))
    return "Only letters, digits, hyphen, underscore allowed";
  return;
}

function validateUserName(name: string): string | undefined {
  if (!name) return "Name is required";
  if (!/^[a-zA-Z0-9_-]+$/.test(name))
    return "Only letters, digits, hyphen, underscore allowed";
  return;
}

function buildConfig(
  args: Record<string, string | undefined>,
  env: Record<string, string | undefined>,
  cwd: string,
) {
  const { mode, existingProjectPath } = detectMode(args, env);
  const nonInteractive = isNonInteractive(args, env);
  const workspace = resolveWorkspace(args, env, existingProjectPath, cwd);
  const projectName = resolveProjectName(args, env, existingProjectPath);
  const userName = resolveUserName(args, env);

  return {
    mode,
    existingProjectPath,
    workspace,
    projectName,
    userName,
    isNonInteractive: nonInteractive,
  };
}

export interface SetupDeps {
  execSync: (command: string, options?: { stdio?: string }) => void;
  mkdirSync: (path: string, options?: { recursive?: boolean }) => void;
  existsSync?: (path: string) => boolean;
}

function executeSetup(config: ReturnType<typeof buildConfig>, deps?: SetupDeps): void {
  const { mode, existingProjectPath, workspace, projectName, userName, isNonInteractive } =
    config;

  const exec = deps?.execSync ?? execSync;
  const mkdir = deps?.mkdirSync ?? mkdirSync;
  const exists = deps?.existsSync ?? existsSync;

  try {
    // Create workspace directory (reuse if exists)
    mkdir(workspace, { recursive: true });

    if (mode === "existing" && existingProjectPath) {
      exec(`mv "${existingProjectPath}" "${workspace}/${projectName}"`, {
        stdio: "inherit",
      });
    }

    const vaultPath = `${workspace}/vault`;

    // Remove existing vault if it exists (overwrite behavior)
    if (exists(vaultPath)) {
      exec(`rm -rf "${vaultPath}"`, { stdio: "inherit" });
    }

    // Download vault folder via curl + unzip (no .git, no repo root wrapper)
    const tmpZip = `${workspace}/.vault-tmp.zip`;
    const tmpDir = `${workspace}/.vault-tmp`;

    exec(`curl -sL "${VAULT_ZIP_URL}" -o "${tmpZip}"`, { stdio: "inherit" });
    exec(`unzip -q "${tmpZip}" -d "${tmpDir}"`, { stdio: "inherit" });
    exec(
      `mv "${tmpDir}/obsidian-starter-vault-main/vault" "${vaultPath}"`,
      { stdio: "inherit" },
    );
    exec(`rm -rf "${tmpZip}" "${tmpDir}"`, { stdio: "inherit" });

    // Run bootstrap
    const installHooks = "Y";
    exec(
      `cd "${vaultPath}" && BOILERPLATE_USER="${userName}" PROJECT_NAME="${projectName}" INSTALL_HOOKS="${installHooks}" ./scripts/bootstrap.sh`,
      { stdio: "inherit" },
    );
  } catch (error) {
    throw new Error(`Setup failed: ${error}`);
  }
}

// ── CLI wrapper ─────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = process.env as Record<string, string | undefined>;

  // Quick validation for non-interactive mode
  const projectPath = args.project_path || env.PROJECT_PATH;
  if (projectPath && !existsSync(resolve(projectPath))) {
    console.error(`Project path does not exist: ${projectPath}`);
    process.exit(1);
  }

  const config = buildConfig(args, env, process.cwd());

  if (!config.isNonInteractive) {
    clack.intro("Obsidian Starter Vault — Workspace Setup");

    // Interactive prompts for missing values
    if (!config.existingProjectPath) {
      // Auto-detect project folder
      const detectedPath = findProjectFolder(process.cwd());
      let autoDetected = false;

      if (detectedPath) {
        const useDetected = await clack.confirm({
          message: `Detected project folder: ${detectedPath}\nUse this folder?`,
          active: "Yes",
          inactive: "No",
        });

        if (isCancel(useDetected)) exitCancel();

        if (useDetected) {
          config.existingProjectPath = detectedPath;
          config.mode = "existing";
          config.workspace = `${dirname(detectedPath)}/${basename(detectedPath)}-workspace`;
          config.projectName = basename(detectedPath);
          autoDetected = true;
        }
      }

      // Fall back to manual selection if not auto-detected
      if (!autoDetected) {
        const selectedMode = await clack.select({
          message: "Do you have an existing project folder?",
          options: [
            {
              value: "existing",
              label: "Yes — I have an existing project folder",
              hint: "Moves your project into a new workspace alongside the vault",
            },
            {
              value: "new",
              label: "No — I'm starting fresh",
              hint: "Creates a workspace with the vault; you clone your app repo later",
            },
          ],
        });

        if (isCancel(selectedMode)) exitCancel();

        if (selectedMode === "existing") {
          const projectPath = await clack.text({
            message: "Path to your existing project folder:",
            placeholder: "/home/user/Projects/my-app",
            validate: (value) => {
              if (!value) return "Path is required";
              if (!existsSync(value)) return "Directory does not exist";
              return;
            },
          });

          if (isCancel(projectPath)) exitCancel();
          config.existingProjectPath = resolve(projectPath);
          config.mode = "existing";

          // Re-resolve workspace with the new project path
          config.workspace = `${dirname(config.existingProjectPath)}/${basename(config.existingProjectPath)}-workspace`;
          config.projectName = basename(config.existingProjectPath);
        }
      }
    }

    // Prompt for workspace if not provided
    if (!args.workspace && !env.WORKSPACE) {
      const workspacePath = await clack.text({
        message: "Where should the workspace be created?",
        placeholder: config.workspace,
        defaultValue: config.workspace,
      });

      if (isCancel(workspacePath)) exitCancel();
      config.workspace = resolve(workspacePath || config.workspace);
    }

    // Prompt for project name if not provided
    if (!args.project_name && !env.PROJECT_NAME) {
      const nameInput = await clack.text({
        message: "Project name (used for worktree naming):",
        placeholder: config.projectName,
        defaultValue: config.projectName,
        validate: validateProjectName,
      });

      if (isCancel(nameInput)) exitCancel();
      config.projectName = nameInput || config.projectName;
    }

    // Prompt for user name if not provided
    if (!args.user_name && !env.USER_NAME) {
      const nameInput = await clack.text({
        message: "Your short name:",
        placeholder: config.userName,
        defaultValue: config.userName,
        validate: validateUserName,
      });

      if (isCancel(nameInput)) exitCancel();
      config.userName = nameInput || config.userName;
    }

    // Check if workspace exists
    if (existsSync(config.workspace)) {
      const overwrite = await clack.confirm({
        message: `Directory ${config.workspace} already exists. Continue?`,
        active: "Yes",
        inactive: "No",
      });
      if (isCancel(overwrite) || !overwrite) exitCancel();
    }

    // Preview
    clack.log.info("Preview:");
    if (config.mode === "existing" && config.existingProjectPath) {
      clack.log.info(`  Workspace: ${config.workspace}`);
      clack.log.info(
        `  Project:   ${config.workspace}/${config.projectName} (moved from ${config.existingProjectPath})`,
      );
      clack.log.info(`  Vault:     ${config.workspace}/vault`);
    } else {
      clack.log.info(`  Workspace: ${config.workspace}`);
      clack.log.info(`  Vault:     ${config.workspace}/vault`);
      clack.log.info(
        `  Project:   ${config.workspace}/${config.projectName} (clone your app repo here later)`,
      );
    }

    const confirmed = await clack.confirm({
      message: "Create workspace?",
      active: "Yes",
      inactive: "No",
    });

    if (isCancel(confirmed) || !confirmed) exitCancel();
  }

  // Execute
  let s: ReturnType<typeof clack.spinner> | null = null;
  if (!config.isNonInteractive) {
    s = clack.spinner();
    s.start("Creating workspace...");
  } else {
    console.log("Creating workspace...");
  }

  try {
    executeSetup(config);

    if (s) {
      s.stop("Workspace created successfully!");
    } else {
      console.log("Workspace created successfully!");
    }
  } catch (error) {
    if (s) {
      s.stop("Failed to create workspace");
    } else {
      console.error("Failed to create workspace");
    }
    clack.log.error(String(error));
    process.exit(1);
  }

  // Outro
  if (!config.isNonInteractive) {
    clack.outro("Next steps:");
    console.log(`  1. Open the vault in Obsidian: ${config.workspace}/vault`);
    console.log(`  2. Start a Claude session: cd ${config.workspace}/vault && claude`);
    if (config.mode === "new") {
      console.log(
        `  3. Clone your app repo: cd ${config.workspace} && git clone <url> ${config.projectName}`,
      );
    }
  }
}

// Export for testing
export {
  parseArgs,
  getEnvOrArg,
  detectMode,
  isNonInteractive,
  resolveWorkspace,
  resolveProjectName,
  resolveUserName,
  validateProjectName,
  validateUserName,
  buildConfig,
  executeSetup,
  isProjectFolder,
  findProjectFolder,
  VAULT_REPO,
  type SetupDeps,
};

// Run CLI if executed directly
// Check if this file is the entry point (not imported as a module)
const isMainModule =
  typeof require !== "undefined" && require.main === module;
const isMainESM =
  typeof import.meta.url !== "undefined" &&
  import.meta.url === `file://${process.argv[1]}`;

if (isMainModule || isMainESM) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
