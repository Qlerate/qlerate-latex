// Bundle the two Custom UI entry points and copy KaTeX's CSS + fonts next to them.
// Custom UI may only load assets from its own resource directory, so everything is local.
import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const katexDist = join(root, "node_modules", "katex", "dist");

for (const [entry, outdir] of [
  ["src/frontend/main.js", "static/main"],
  ["src/frontend/config.js", "static/config"],
]) {
  const out = join(root, outdir);
  mkdirSync(out, { recursive: true });
  await build({
    entryPoints: [join(root, entry)],
    bundle: true,
    format: "iife",
    target: ["es2020"],
    minify: true,
    sourcemap: false,
    outfile: join(out, "bundle.js"),
    logLevel: "info",
  });
  const katexOut = join(out, "katex");
  if (existsSync(katexOut)) rmSync(katexOut, { recursive: true });
  mkdirSync(katexOut, { recursive: true });
  cpSync(join(katexDist, "katex.min.css"), join(katexOut, "katex.min.css"));
  cpSync(join(katexDist, "fonts"), join(katexOut, "fonts"), { recursive: true });
}
console.log("build complete");
