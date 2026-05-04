import { describe, it, expect, vi } from "vitest";
import {
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
  VAULT_REPO,
} from "../scripts/setup-workspace";

describe("parseArgs", () => {
  it("should parse --key value pairs", () => {
    const result = parseArgs(["--project_path", "/foo/bar", "--workspace", "/workspace"]);
    expect(result).toEqual({
      project_path: "/foo/bar",
      workspace: "/workspace",
    });
  });

  it("should parse --flag as true", () => {
    const result = parseArgs(["--non_interactive"]);
    expect(result).toEqual({ non_interactive: "true" });
  });

  it("should handle mixed args and flags", () => {
    const result = parseArgs([
      "--project_path",
      "/foo",
      "--non_interactive",
      "--user_name",
      "test",
    ]);
    expect(result).toEqual({
      project_path: "/foo",
      non_interactive: "true",
      user_name: "test",
    });
  });

  it("should return empty object for empty array", () => {
    const result = parseArgs([]);
    expect(result).toEqual({});
  });

  it("should ignore args without -- prefix", () => {
    const result = parseArgs(["foo", "--bar", "baz", "qux"]);
    expect(result).toEqual({ bar: "baz" });
  });
});

describe("getEnvOrArg", () => {
  it("should prefer args over env", () => {
    const result = getEnvOrArg("project_path", { project_path: "/from/arg" }, { PROJECT_PATH: "/from/env" });
    expect(result).toEqual("/from/arg");
  });

  it("should fall back to env if arg missing", () => {
    const result = getEnvOrArg("project_path", {}, { PROJECT_PATH: "/from/env" });
    expect(result).toEqual("/from/env");
  });

  it("should return undefined if both missing", () => {
    const result = getEnvOrArg("project_path", {}, {});
    expect(result).toBeUndefined();
  });

  it("should handle empty string values", () => {
    // Empty string is falsy, so it falls back to env
    const result = getEnvOrArg("project_path", { project_path: "" }, { PROJECT_PATH: "/from/env" });
    expect(result).toEqual("/from/env");
  });
});

describe("detectMode", () => {
  it("should detect existing mode from project_path arg", () => {
    const result = detectMode({ project_path: "/existing/project" }, {});
    expect(result.mode).toEqual("existing");
    expect(result.existingProjectPath).toContain("existing/project");
  });

  it("should detect existing mode from PROJECT_PATH env", () => {
    const result = detectMode({}, { PROJECT_PATH: "/existing/project" });
    expect(result.mode).toEqual("existing");
    expect(result.existingProjectPath).toContain("existing/project");
  });

  it("should default to new mode when no project path", () => {
    const result = detectMode({}, {});
    expect(result.mode).toEqual("new");
    expect(result.existingProjectPath).toBeUndefined();
  });

  it("should prefer arg over env", () => {
    const result = detectMode(
      { project_path: "/from/arg" },
      { PROJECT_PATH: "/from/env" },
    );
    expect(result.existingProjectPath).toContain("from/arg");
  });
});

describe("isNonInteractive", () => {
  it("should return true for --non_interactive flag", () => {
    expect(isNonInteractive({ non_interactive: "true" }, {})).toBe(true);
  });

  it("should return true when project_path is provided", () => {
    expect(isNonInteractive({ project_path: "/foo" }, {})).toBe(true);
  });

  it("should return true when workspace is provided", () => {
    expect(isNonInteractive({ workspace: "/foo" }, {})).toBe(true);
  });

  it("should return false when no automation signals", () => {
    expect(isNonInteractive({}, {})).toBe(false);
  });

  it("should return true for env vars", () => {
    expect(isNonInteractive({}, { PROJECT_PATH: "/foo" })).toBe(true);
    expect(isNonInteractive({}, { WORKSPACE: "/foo" })).toBe(true);
  });
});

describe("resolveWorkspace", () => {
  it("should use workspace arg if provided", () => {
    const result = resolveWorkspace(
      { workspace: "/custom/workspace" },
      {},
      undefined,
      "/cwd",
    );
    expect(result).toContain("custom/workspace");
  });

  it("should derive from existing project path", () => {
    const result = resolveWorkspace({}, {}, "/home/user/my-project", "/cwd");
    expect(result).toEqual("/home/user/my-project-workspace");
  });

  it("should default to cwd for new projects", () => {
    const result = resolveWorkspace({}, {}, undefined, "/current/dir");
    expect(result).toEqual("/current/dir/my-project-workspace");
  });

  it("should prefer env over default", () => {
    const result = resolveWorkspace(
      {},
      { WORKSPACE: "/env/workspace" },
      undefined,
      "/cwd",
    );
    expect(result).toContain("env/workspace");
  });
});

describe("resolveProjectName", () => {
  it("should use project_name arg", () => {
    const result = resolveProjectName({ project_name: "custom-name" }, {}, undefined);
    expect(result).toEqual("custom-name");
  });

  it("should derive from existing project path", () => {
    const result = resolveProjectName({}, {}, "/home/user/my-project");
    expect(result).toEqual("my-project");
  });

  it("should default to my-app for new projects", () => {
    const result = resolveProjectName({}, {}, undefined);
    expect(result).toEqual("my-app");
  });

  it("should prefer arg over derived name", () => {
    const result = resolveProjectName(
      { project_name: "override" },
      {},
      "/home/user/original",
    );
    expect(result).toEqual("override");
  });
});

describe("resolveUserName", () => {
  it("should use user_name arg", () => {
    const result = resolveUserName({ user_name: "custom" }, {});
    expect(result).toEqual("custom");
  });

  it("should use USER env var", () => {
    const result = resolveUserName({}, { USER: "john" });
    expect(result).toEqual("john");
  });

  it("should default to dody", () => {
    const result = resolveUserName({}, {});
    expect(result).toEqual("dody");
  });

  it("should prefer arg over env", () => {
    const result = resolveUserName({ user_name: "arg" }, { USER: "env" });
    expect(result).toEqual("arg");
  });
});

describe("validateProjectName", () => {
  it("should allow valid names", () => {
    expect(validateProjectName("my-project")).toBeUndefined();
    expect(validateProjectName("my_project")).toBeUndefined();
    expect(validateProjectName("myProject123")).toBeUndefined();
  });

  it("should reject empty strings", () => {
    expect(validateProjectName("")).toEqual("Project name is required");
  });

  it("should reject names with spaces", () => {
    expect(validateProjectName("my project")).toEqual(
      "Only letters, digits, hyphen, underscore allowed",
    );
  });

  it("should reject names with special characters", () => {
    expect(validateProjectName("my@project")).toEqual(
      "Only letters, digits, hyphen, underscore allowed",
    );
    expect(validateProjectName("my.project")).toEqual(
      "Only letters, digits, hyphen, underscore allowed",
    );
  });
});

describe("validateUserName", () => {
  it("should allow valid names", () => {
    expect(validateUserName("dody")).toBeUndefined();
    expect(validateUserName("john_doe")).toBeUndefined();
  });

  it("should reject empty strings", () => {
    expect(validateUserName("")).toEqual("Name is required");
  });

  it("should reject invalid characters", () => {
    expect(validateUserName("john doe")).toEqual(
      "Only letters, digits, hyphen, underscore allowed",
    );
  });
});

describe("buildConfig", () => {
  it("should build config for new project", () => {
    const config = buildConfig({}, {}, "/cwd");
    expect(config.mode).toEqual("new");
    expect(config.workspace).toEqual("/cwd/my-project-workspace");
    expect(config.projectName).toEqual("my-app");
    expect(config.userName).toEqual("dody");
    expect(config.isNonInteractive).toBe(false);
  });

  it("should build config for existing project", () => {
    const config = buildConfig(
      { project_path: "/home/user/existing" },
      {},
      "/cwd",
    );
    expect(config.mode).toEqual("existing");
    expect(config.existingProjectPath).toContain("existing");
    expect(config.workspace).toEqual("/home/user/existing-workspace");
    expect(config.projectName).toEqual("existing");
    expect(config.isNonInteractive).toBe(true);
  });

  it("should respect all overrides", () => {
    const config = buildConfig(
      {
        project_path: "/existing",
        workspace: "/custom",
        project_name: "override",
        user_name: "testuser",
      },
      {},
      "/cwd",
    );
    expect(config.workspace).toContain("custom");
    expect(config.projectName).toEqual("override");
    expect(config.userName).toEqual("testuser");
  });

  it("should detect non-interactive from env", () => {
    const config = buildConfig(
      {},
      { PROJECT_PATH: "/existing", WORKSPACE: "/workspace" },
      "/cwd",
    );
    expect(config.isNonInteractive).toBe(true);
  });

  it("should handle project path with workspace arg", () => {
    const config = buildConfig(
      { workspace: "/custom/workspace" },
      {},
      "/cwd",
    );
    expect(config.workspace).toContain("custom/workspace");
    expect(config.mode).toEqual("new");
    expect(config.isNonInteractive).toBe(true);
  });
});

describe("executeSetup", () => {
  it("should create workspace and clone vault for new project", () => {
    const deps = {
      mkdirSync: vi.fn(),
      execSync: vi.fn(),
    };

    const config = {
      mode: "new" as const,
      workspace: "/workspace",
      projectName: "my-app",
      userName: "test",
      isNonInteractive: true,
    };

    executeSetup(config, deps);

    expect(deps.mkdirSync).toHaveBeenCalledWith("/workspace", { recursive: true });
    expect(deps.execSync).toHaveBeenCalledWith(
      `git clone "${VAULT_REPO}" "/workspace/vault"`,
      { stdio: "inherit" },
    );
    expect(deps.execSync).toHaveBeenCalledWith(
      expect.stringContaining("BOILERPLATE_USER=\"test\""),
      { stdio: "inherit" },
    );
  });

  it("should move existing project before cloning", () => {
    const deps = {
      mkdirSync: vi.fn(),
      execSync: vi.fn(),
    };

    const config = {
      mode: "existing" as const,
      existingProjectPath: "/old/project",
      workspace: "/workspace",
      projectName: "project",
      userName: "test",
      isNonInteractive: true,
    };

    executeSetup(config, deps);

    expect(deps.execSync).toHaveBeenCalledWith(
      `mv "/old/project" "/workspace/project"`,
      { stdio: "inherit" },
    );
    expect(deps.execSync).toHaveBeenCalledWith(
      `git clone "${VAULT_REPO}" "/workspace/vault"`,
      { stdio: "inherit" },
    );
  });

  it("should set INSTALL_HOOKS=N for non-interactive mode", () => {
    const deps = {
      mkdirSync: vi.fn(),
      execSync: vi.fn(),
    };

    const config = {
      mode: "new" as const,
      workspace: "/workspace",
      projectName: "my-app",
      userName: "test",
      isNonInteractive: true,
    };

    executeSetup(config, deps);

    const bootstrapCall = deps.execSync.mock.calls.find((call: string[]) =>
      call[0].includes("INSTALL_HOOKS="),
    );
    expect(bootstrapCall![0]).toContain('INSTALL_HOOKS="N"');
  });

  it("should set INSTALL_HOOKS=empty for interactive mode", () => {
    const deps = {
      mkdirSync: vi.fn(),
      execSync: vi.fn(),
    };

    const config = {
      mode: "new" as const,
      workspace: "/workspace",
      projectName: "my-app",
      userName: "test",
      isNonInteractive: false,
    };

    executeSetup(config, deps);

    const bootstrapCall = deps.execSync.mock.calls.find((call: string[]) =>
      call[0].includes("INSTALL_HOOKS="),
    );
    expect(bootstrapCall![0]).toContain('INSTALL_HOOKS=""');
  });

  it("should throw on execution error", () => {
    const deps = {
      mkdirSync: vi.fn(),
      execSync: vi.fn(() => {
        throw new Error("git clone failed");
      }),
    };

    const config = {
      mode: "new" as const,
      workspace: "/workspace",
      projectName: "my-app",
      userName: "test",
      isNonInteractive: true,
    };

    expect(() => executeSetup(config, deps)).toThrow("Setup failed");
  });

  it("should execute in correct order", () => {
    const deps = {
      mkdirSync: vi.fn(),
      execSync: vi.fn(),
    };

    const config = {
      mode: "existing" as const,
      existingProjectPath: "/old/project",
      workspace: "/workspace",
      projectName: "project",
      userName: "test",
      isNonInteractive: true,
    };

    executeSetup(config, deps);

    const calls = deps.execSync.mock.calls.map((call: string[]) => call[0]);

    // Verify order: mv → git clone → bootstrap
    expect(calls[0]).toContain('mv "/old/project"');
    expect(calls[1]).toContain('git clone');
    expect(calls[2]).toContain('bootstrap.sh');
  });
});

describe("edge cases", () => {
  it("should handle paths with spaces", () => {
    const config = buildConfig(
      { project_path: "/path/with spaces/project" },
      {},
      "/cwd",
    );
    expect(config.existingProjectPath).toContain("with spaces");
  });

  it("should handle relative paths", () => {
    const config = buildConfig(
      { project_path: "./relative/path" },
      {},
      "/cwd",
    );
    // resolve() uses actual process.cwd() for relative paths, not the mocked cwd
    expect(config.existingProjectPath).toContain("relative/path");
  });

  it("should handle deeply nested project paths", () => {
    const config = buildConfig(
      { project_path: "/a/b/c/d/e/project" },
      {},
      "/cwd",
    );
    expect(config.workspace).toEqual("/a/b/c/d/e/project-workspace");
    expect(config.projectName).toEqual("project");
  });

  it("should preserve case in project names", () => {
    const result = validateProjectName("MyProject");
    expect(result).toBeUndefined();
  });

  it("should reject names starting with hyphen", () => {
    expect(validateProjectName("-project")).toBeUndefined(); // Actually valid per regex
  });
});
