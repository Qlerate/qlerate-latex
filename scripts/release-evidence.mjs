import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { FORGE_CLI_VERSION, parseForgeVersion } from "./forge.mjs";

const artifactPaths = [
  "package-lock.json",
  "manifest.yml",
  "static/main/bundle.js",
  "static/config/bundle.js",
  "static/jira-panel/bundle.js",
];

const command = (name, args) => execFileSync(name, args, { encoding: "utf8" }).trim();
const forgeVersion = parseForgeVersion(command("forge", ["--version"]));
if (forgeVersion !== FORGE_CLI_VERSION) {
  throw new Error(`Forge CLI ${FORGE_CLI_VERSION} is required; found ${forgeVersion || "an unreadable version"}.`);
}

const evidence = {
  commit: command("git", ["rev-parse", "HEAD"]),
  node: process.version,
  npm: command("npm", ["--version"]),
  forge: forgeVersion,
  artifacts: Object.fromEntries(artifactPaths.map((path) => [
    path,
    createHash("sha256").update(readFileSync(path)).digest("hex"),
  ])),
};

writeFileSync("release-evidence.json", `${JSON.stringify(evidence, null, 2)}\n`, { flag: "w" });
console.log("Wrote release-evidence.json");
