import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const FORGE_CLI_VERSION = "14.1.0";

export function parseForgeVersion(output) {
  return String(output || "").match(/\b(\d+\.\d+\.\d+)\b/)?.[1] || null;
}

export function runForge(args = process.argv.slice(2)) {
  const checked = spawnSync("forge", ["--version"], { encoding: "utf8" });
  const actual = parseForgeVersion(`${checked.stdout || ""}\n${checked.stderr || ""}`);
  if (checked.error?.code === "ENOENT") {
    console.error(`Forge CLI ${FORGE_CLI_VERSION} is required. Install it with: npm install -g @forge/cli@${FORGE_CLI_VERSION}`);
    return 1;
  }
  if (checked.status !== 0 || actual !== FORGE_CLI_VERSION) {
    console.error(`Forge CLI ${FORGE_CLI_VERSION} is required; found ${actual || "an unreadable version"}.`);
    return 1;
  }
  return spawnSync("forge", args, { stdio: "inherit" }).status ?? 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  process.exitCode = runForge();
}
