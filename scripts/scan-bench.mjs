// Repeatable timing of the Jira panel's formula scanner on adversarial inputs, so the "approximately
// linear up to the Jira field cap" claim can be re-checked on any machine:  node scripts/scan-bench.mjs
import { cpus, platform, release } from "node:os";
import { scanFormulas } from "../src/frontend/mathscan.js";

const FIELD_CAP = 32_766; // one below Jira's documented 32,767-character description/comment limit
const SIZES = [4096, 8192, 16384, FIELD_CAP];
const REPEATS = 5;

const fixtures = {
  "unmatched \\[ openers": (n) => "\\[".repeat(n / 2),
  "unmatched $$ openers": (n) => "$$".repeat(n / 2),
  "unmatched $ openers": (n) => "$a".repeat(n / 2),
  "duplicate $$a$$ spans": (n) => "$$a$$ ".repeat(n / 6),
  "$ openers split by newlines": (n) => "$a\n".repeat(n / 3),
  "$ closers rejected by a digit": (n) => "$a$1".repeat(n / 4),
};

const best = (text) => {
  let min = Infinity;
  for (let r = 0; r < REPEATS; r++) {
    const t = performance.now();
    scanFormulas(text, { maxChars: text.length, maxFormulas: Number.MAX_SAFE_INTEGER });
    min = Math.min(min, performance.now() - t);
  }
  return min;
};

console.log(`node ${process.version} on ${platform()} ${release()}, ${cpus()[0]?.model || "unknown CPU"}`);
console.log(`best of ${REPEATS} runs, milliseconds; sizes are characters`);
console.log("fixture".padEnd(32) + SIZES.map((s) => String(s).padStart(10)).join(""));
for (const [name, make] of Object.entries(fixtures)) {
  const times = SIZES.map((n) => best(make(n).slice(0, FIELD_CAP)));
  const ratio = times[times.length - 1] / times[0];
  console.log(name.padEnd(32) + times.map((t) => t.toFixed(2).padStart(10)).join("") + `   x${ratio.toFixed(1)} over x${(SIZES[SIZES.length - 1] / SIZES[0]).toFixed(0)} size`);
}
