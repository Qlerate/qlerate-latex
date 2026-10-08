import { test } from "node:test";
import assert from "node:assert/strict";
import { adfToText, findFormulas, scanFormulas } from "../src/frontend/mathscan.js";

test("finds display and inline formulas in document order", () => {
  const f = findFormulas("Energy $E(x)=\\sum_i Q_{ii}x_i$ and the gap $$\\Delta L < 0.1$$ done.");
  assert.deepEqual(f.map((x) => [x.tex, x.display]), [["E(x)=\\sum_i Q_{ii}x_i", false], ["\\Delta L < 0.1", true]]);
});

test("ignores money and lone dollars", () => {
  assert.deepEqual(findFormulas("costs $5 or $ 10 and $100 total"), []);
  assert.deepEqual(findFormulas("price is $5, tax $1"), []);
});

test("supports \\( \\) and \\[ \\] delimiters and dedupes", () => {
  const f = findFormulas("\\(a+b\\) then \\[\\int_0^1 f\\] and again \\(a+b\\)");
  assert.deepEqual(f.map((x) => [x.tex, x.display]), [["a+b", false], ["\\int_0^1 f", true]]);
});

test("inline match inside a display block is not duplicated", () => {
  const f = findFormulas("$$ x^2 $ y $$");
  assert.equal(f.length, 1);
  assert.equal(f[0].display, true);
});

test("ADF code blocks in latex become display formulas; other blocks flatten to text", () => {
  const adf = {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "RSRP threshold " }, { type: "text", text: "$\\theta=-105$" }] },
      { type: "codeBlock", attrs: { language: "latex" }, content: [{ type: "text", text: "\\frac{P}{12R}" }] },
      { type: "codeBlock", attrs: { language: "python" }, content: [{ type: "text", text: "x = 1" }] },
    ],
  };
  const text = adfToText(adf);
  assert.match(text, /RSRP threshold \$\\theta=-105\$/);
  const f = findFormulas(text);
  assert.deepEqual(f.map((x) => [x.tex, x.display]), [["\\theta=-105", false], ["\\frac{P}{12R}", true]]);
});

test("preserves delimiter priority, order, escaping and deduplication", () => {
  const f = findFormulas("escaped \\$x$; $$a $ b$$; \\(c\\); \\[d\\]; and \\(c\\) again");
  assert.deepEqual(f.map((x) => [x.tex, x.display]), [
    ["a $ b", true],
    ["c", false],
    ["d", true],
  ]);
});

test("bounds source length and formula count and reports truncation", () => {
  const chars = scanFormulas("$a$ after", { maxChars: 3 });
  assert.equal(chars.truncated, true);
  assert.deepEqual(chars.formulas.map((x) => x.tex), ["a"]);

  const formulas = scanFormulas("$a$ $b$ $c$", { maxFormulas: 2 });
  assert.equal(formulas.truncated, true);
  assert.deepEqual(formulas.formulas.map((x) => x.tex), ["a", "b"]);
});

test("legacy findFormulas helper remains unbounded", () => {
  const text = `${"plain ".repeat(6_000)}$late$`;
  assert.deepEqual(findFormulas(text).map((x) => x.tex), ["late"]);
});

test("handles a maximum-size run of unmatched display openers", () => {
  const result = scanFormulas("\\[".repeat(16_383));
  assert.deepEqual(result.formulas, []);
  assert.equal(result.truncated, false);
});
