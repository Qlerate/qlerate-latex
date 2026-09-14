// Best-effort TeX → Unicode text for places that cannot typeset (PDF/Word export, search snippets).
// It is deliberately conservative: unknown commands keep their name so nothing is silently lost.

const GREEK = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε", zeta: "ζ", eta: "η", theta: "θ",
  vartheta: "ϑ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", rho: "ρ", sigma: "σ",
  tau: "τ", upsilon: "υ", phi: "φ", varphi: "φ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π", Sigma: "Σ", Upsilon: "Υ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
};

const SYMBOLS = {
  sum: "Σ", prod: "Π", int: "∫", infty: "∞", partial: "∂", nabla: "∇",
  le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", approx: "≈", equiv: "≡", sim: "∼", propto: "∝",
  to: "→", rightarrow: "→", leftarrow: "←", Rightarrow: "⇒", Leftarrow: "⇐", leftrightarrow: "↔", mapsto: "↦",
  pm: "±", mp: "∓", times: "×", cdot: "·", div: "÷", ast: "∗", star: "⋆", circ: "∘", bullet: "•",
  in: "∈", notin: "∉", ni: "∋", subset: "⊂", subseteq: "⊆", supset: "⊃", supseteq: "⊇", cup: "∪", cap: "∩",
  setminus: "∖", emptyset: "∅", forall: "∀", exists: "∃", neg: "¬", land: "∧", lor: "∨", wedge: "∧", vee: "∨",
  ldots: "…", cdots: "⋯", dots: "…", vdots: "⋮", prime: "′", degree: "°", angle: "∠", perp: "⊥", parallel: "∥",
  langle: "⟨", rangle: "⟩", lfloor: "⌊", rfloor: "⌋", lceil: "⌈", rceil: "⌉", mid: "|", vert: "|", Vert: "‖",
  max: "max", min: "min", log: "log", ln: "ln", exp: "exp", sin: "sin", cos: "cos", tan: "tan", arg: "arg",
  argmax: "arg max", argmin: "arg min", dB: " dB", dBm: " dBm",
};

const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", n: "ⁿ", i: "ⁱ", T: "ᵀ" };
const SUB = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎", a: "ₐ", e: "ₑ", i: "ᵢ", j: "ⱼ", k: "ₖ", m: "ₘ", n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ" };

/** Replace the innermost {...} group at `start` (index of '{'); returns [inner, endIndexExclusive]. */
function group(s, start) {
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) return [s.slice(start + 1, i), i + 1];
    }
  }
  return [s.slice(start + 1), s.length];
}

// Placeholders keep an unconverted ^ or _ from being matched again by the script loop.
const SUP_MARK = "\u0001", SUB_MARK = "\u0002";

function script(inner, table, fallback) {
  const mapped = [...inner].map((c) => table[c]);
  if (mapped.length && mapped.every(Boolean)) return mapped.join("");
  return `${fallback}${inner.length > 1 ? `(${inner})` : inner}`;
}

export function tex2text(tex) {
  let s = String(tex || "");
  // Escaped braces are literal set braces; protect them from the grouping logic below.
  const LB = "\u0003", RB = "\u0004";
  s = s.replace(/\\\{/g, LB).replace(/\\\}/g, RB);
  // Environments and alignment/spacing noise.
  s = s.replace(/\\begin\{[a-z*]+\}|\\end\{[a-z*]+\}/g, "");
  s = s.replace(/\\left|\\right|\\big[lr]?|\\Big[lr]?|\\displaystyle|\\textstyle|\\nonumber|\\boxed/g, "");
  s = s.replace(/&/g, " ").replace(/\\\\/g, "\n").replace(/\\[,;:!> ]|\\quad|\\qquad/g, " ");
  // \frac{a}{b} → (a)/(b); \sqrt{x} → √(x)
  for (;;) {
    const i = s.indexOf("\\frac{");
    if (i < 0) break;
    const [num, j] = group(s, i + 5);
    const [den, k] = s[j] === "{" ? group(s, j) : ["", j];
    s = `${s.slice(0, i)}(${num})/(${den})${s.slice(k)}`;
  }
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, "√($1)");
  // Text-like wrappers keep their content.
  s = s.replace(/\\(?:mathrm|mathbf|mathit|mathcal|mathbb|mathsf|text|textbf|textit|operatorname|hat|bar|tilde|vec|widehat|overline|underbrace|underline)\{([^{}]*)\}/g, "$1");
  // Named symbols and Greek letters.
  s = s.replace(/\\([A-Za-z]+)/g, (m, name) => SYMBOLS[name] ?? GREEK[name] ?? name);
  // Scripts.
  for (;;) {
    const m = /[\^_]/.exec(s);
    if (!m) break;
    const op = m[0], i = m.index;
    let inner, end;
    if (s[i + 1] === "{") [inner, end] = group(s, i + 1);
    else { inner = s[i + 1] ?? ""; end = i + 2; }
    const table = op === "^" ? SUP : SUB;
    s = s.slice(0, i) + script(inner.trim(), table, op === "^" ? SUP_MARK : SUB_MARK) + s.slice(end);
  }
  return s
    .replace(/[{}]/g, "")
    .replace(new RegExp(SUP_MARK, "g"), "^")
    .replace(new RegExp(SUB_MARK, "g"), "_")
    .replace(new RegExp(LB, "g"), "{")
    .replace(new RegExp(RB, "g"), "}")
    .replace(/[ \t]+/g, " ")
    .trim();
}
