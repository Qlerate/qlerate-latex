import { test } from "node:test";
import assert from "node:assert/strict";
import { tex2text } from "../src/tex2text.js";
import { buildExportDoc, handler } from "../src/export.js";

test("greek, sums and relations become Unicode", () => {
  assert.equal(tex2text("\\alpha q^{\\mathrm{SINR}} + \\beta q^{\\mathrm{RSRQ}} \\le M"), "α q^(SINR) + β q^(RSRQ) ≤ M");
  assert.equal(tex2text("\\sum_{k} w_k y_k"), "Σₖ wₖ yₖ");
  assert.equal(tex2text("\\theta = -105\\,\\mathrm{dBm}"), "θ = -105 dBm");
});

test("fractions, scripts and macros", () => {
  assert.equal(tex2text("\\frac{\\sigma}{|G^\\star|}"), "(σ)/(|G^⋆|)");
  assert.equal(tex2text("x_{k,a} \\in \\{0,1\\}"), "x_(k,a) ∈ {0,1}");
  assert.equal(tex2text("10\\log_{10} P + 30 \\ge \\theta"), "10log₁₀ P + 30 ≥ θ");
  assert.equal(tex2text("\\lambda_1 = 2M"), "λ₁ = 2M");
});

test("unknown commands are kept by name, never dropped", () => {
  assert.equal(tex2text("\\foo{x}"), "foox");
  assert.match(tex2text("\\mathscr{G}"), /G/);
});

test("export doc has a readable line and the exact source", () => {
  const tex = "E(\\mathbf x) = -\\sum_{k,a} q_{k,a} x_{k,a}";
  const doc = buildExportDoc({ tex }, "pdf");
  assert.equal(doc.type, "doc");
  assert.equal(doc.content.length, 2);
  assert.equal(doc.content[1].type, "codeBlock");
  assert.equal(doc.content[1].content[0].text, tex);
  assert.match(doc.content[0].content[0].text, /Σ/);
});

test("export handler reads config from any of the payload shapes", async () => {
  for (const payload of [
    { extension: { config: { tex: "a^2" } } },
    { extensionPayload: { config: { tex: "a^2" } } },
    { config: { tex: "a^2" } },
    { parameters: { guestParams: { tex: "a^2" } } },
  ]) {
    const doc = await handler(payload);
    assert.equal(doc.content[1].content[0].text, "a^2");
  }
  const empty = await handler({});
  assert.match(empty.content[0].content[0].text, /empty/);
});
