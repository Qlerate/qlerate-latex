import { test } from "node:test";
import assert from "node:assert/strict";
import { FORGE_CLI_VERSION, parseForgeVersion } from "../scripts/forge.mjs";

test("release wrapper recognizes a complete semantic Forge CLI version", () => {
  assert.equal(FORGE_CLI_VERSION, "14.1.0");
  assert.equal(parseForgeVersion("14.1.0"), "14.1.0");
  assert.equal(parseForgeVersion("Forge CLI version 14.1.0\n"), "14.1.0");
  assert.equal(parseForgeVersion("not installed"), null);
});
