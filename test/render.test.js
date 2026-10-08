import { test } from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { KATEX_OPTIONS, createKatexOptions, isInline } from "../src/frontend/render.js";

const render = (tex, displayMode = true, options = KATEX_OPTIONS) => katex.renderToString(tex, { ...options, displayMode });

test("team shortcuts render", () => {
  const html = render("\\theta=-105\\dBm,\\quad \\sigma=\\tfrac1{20}\\dB,\\quad s=\\argmax_k P_k");
  assert.match(html, /dBm/);
  assert.match(html, /arg/);
});

test("colour shortcuts produce coloured spans and plain \\textcolor still works", () => {
  const html = render("\\ql{q_{k,a}} + \\good{+M} - \\bad{\\lambda_1} + \\note{N\\lambda_1} + \\textcolor{red}{x}");
  assert.match(html, /color:#84179E/i);
  assert.match(html, /color:#22A06B/i);
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

test("global macro definitions stay inside one formula", () => {
  const first = render("\\gdef\\R{\\text{APPROVED}}\\R", true, createKatexOptions());
  const second = render("\\R", true, createKatexOptions());
  assert.match(first, /APPROVED/);
  assert.doesNotMatch(second, /APPROVED/);
  assert.match(second, /mathbb/);
});

test("a failed formula cannot poison a later formula", () => {
  assert.throws(() => render("\\gdef\\R{\\text{BAD}}\\unknowncommand", true, createKatexOptions()));
  assert.doesNotMatch(render("\\R", true, createKatexOptions()), /BAD/);
});

test("dimension commands are bounded without removing the source annotation", () => {
  const html = render("\\rule{1000000000em}{1000000000em}", true, createKatexOptions());
  assert.match(html, /height:100em/);
  assert.doesNotMatch(html, /height:1000000000em/);
  assert.match(html, /1000000000em/);
});
