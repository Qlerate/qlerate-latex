// Shared rendering helper for the macro view and the config preview.
import katex from "katex";

export const DEFAULTS = { tex: "", mode: "auto", size: "normal" };

// KaTeX options: no HTML injection (trust: false), errors surfaced to the author,
// a few macros that appear constantly in engineering notes.
export const KATEX_OPTIONS = {
  throwOnError: true,
  strict: "ignore",
  trust: false,
  macros: {
    "\\dB": "\\,\\mathrm{dB}",
    "\\dBm": "\\,\\mathrm{dBm}",
    "\\R": "\\mathbb{R}",
    "\\E": "\\mathbb{E}",
    "\\argmax": "\\operatorname{arg\\,max}",
    "\\argmin": "\\operatorname{arg\\,min}",
    // Colour shortcuts (KaTeX also accepts \textcolor{red}{…}, \textcolor{#84179E}{…}, \colorbox, \fcolorbox).
    "\\ql": "\\textcolor{#84179E}{#1}",      // Qlerate purple: the quantity being defined or emphasised
    "\\good": "\\textcolor{#1F845A}{#1}",    // green: rewards, gains, things that should be large
    "\\bad": "\\textcolor{#C9372C}{#1}",     // red: penalties, losses, things that should be small
    "\\note": "\\textcolor{#626F86}{#1}",    // grey: auxiliary terms and constants
  },
};

export function isInline(config, moduleKey) {
  if (config.mode === "inline") return true;
  if (config.mode === "display") return false;
  return moduleKey === "latex-inline";
}

/** Render `tex` into `el`. Returns null on success, the error message otherwise. */
export function renderInto(el, tex, { inline, size }) {
  el.className = `katex-host size-${size || "normal"}${inline ? " inline" : " display"}`;
  const source = (tex || "").trim();
  if (!source) {
    el.className = "hint";
    el.textContent = "LaTeX: open the macro settings and enter a formula.";
    return null;
  }
  try {
    katex.render(source, el, { ...KATEX_OPTIONS, displayMode: !inline });
    return null;
  } catch (e) {
    el.className = "error";
    el.textContent = `LaTeX error: ${e.message}`;
    return e.message;
  }
}
