import { test } from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { KATEX_OPTIONS, isInline } from "../src/frontend/render.js";

const render = (tex, displayMode = true) => katex.renderToString(tex, { ...KATEX_OPTIONS, displayMode });

test("team shortcuts render", () => {
  const html = render("\\theta=-105\\dBm,\\quad \\sigma=\\tfrac1{20}\\dB,\\quad s=\\argmax_k P_k");
  assert.match(html, /dBm/);
  assert.match(html, /arg/);
});

test("colour shortcuts produce coloured spans and plain \\textcolor still works", () => {
  const html = render("\\ql{q_{k,a}} + \\good{+M} - \\bad{\\lambda_1} + \\note{N\\lambda_1} + \\textcolor{red}{x}");
  assert.match(html, /color:#84179E/i);
  assert.match(html, /color:#1F845A/i);
  assert.match(html, /color:#C9372C/i);
  assert.match(html, /color:#626F86/i);
  assert.match(html, /color:red/i);
});

test("invalid input throws (so the config panel can block saving)", () => {
  assert.throws(() => render("\\frac{a}{"), /KaTeX parse error|Expected/);
});

test("mode resolution", () => {
  assert.equal(isInline({ mode: "auto" }, "latex-inline"), true);
  assert.equal(isInline({ mode: "auto" }, "latex-block"), false);
  assert.equal(isInline({ mode: "inline" }, "latex-block"), true);
  assert.equal(isInline({ mode: "display" }, "latex-inline"), false);
});
