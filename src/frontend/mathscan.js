// Find LaTeX in free text (Jira descriptions and comments). Pure functions, no DOM, unit-tested.

/** Flatten an Atlassian Document Format node into plain text, one line per block. Code blocks in a TeX
 *  language become display formulas by wrapping them in $$ … $$ so the scanner picks them up. */
export function adfToText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.type === "text") return node.text || "";
  if (node.type === "hardBreak") return "\n";
  if (node.type === "codeBlock") {
    const lang = (node.attrs?.language || "").toLowerCase();
    const body = (node.content || []).map(adfToText).join("");
    return /^(la)?tex$|^math$/.test(lang) ? `\n$$${body}$$\n` : `\n${body}\n`;
  }
  const inner = (node.content || []).map(adfToText).join("");
  const block = /^(paragraph|heading|listItem|blockquote|tableCell|tableHeader|panel|doc|bulletList|orderedList|table|tableRow|expand|nestedExpand)$/.test(node.type || "");
  return block ? `${inner}\n` : inner;
}

/**
 * Extract formulas from text. Supported delimiters, in priority order:
 *   $$ … $$   and   \[ … \]   → display
 *   \( … \)                    → inline
 *   $ … $                      → inline (a single dollar next to a digit or space, e.g. "$5 or $ 10", is ignored)
 * Returns [{ tex, display, index }] in document order, deduplicated by (tex, display).
 */
export function findFormulas(text) {
  const src = String(text || "");
  return scanFormulas(src, { maxChars: src.length, maxFormulas: Number.MAX_SAFE_INTEGER }).formulas;
}

export const SCAN_LIMITS = Object.freeze({ maxChars: 32_767, maxFormulas: 100 });

/** Linear, bounded formula scan. The detailed result lets callers disclose truncation. */
export function scanFormulas(text, limits = {}) {
  const maxChars = nonNegativeLimit(limits.maxChars, SCAN_LIMITS.maxChars);
  const maxFormulas = nonNegativeLimit(limits.maxFormulas, SCAN_LIMITS.maxFormulas);
  const input = String(text || "");
  const src = input.slice(0, maxChars);
  const found = [];
  const lastClose = {
    "$$": src.lastIndexOf("$$"),
    "\\]": src.lastIndexOf("\\]"),
    "\\)": src.lastIndexOf("\\)"),
    "$": src.lastIndexOf("$"),
  };

  let i = 0;
  for (; i < src.length && found.length < maxFormulas;) {
    let opener = null;
    if (src.startsWith("$$", i)) opener = { open: "$$", close: "$$", display: true };
    else if (src.startsWith("\\[", i)) opener = { open: "\\[", close: "\\]", display: true };
    else if (src.startsWith("\\(", i)) opener = { open: "\\(", close: "\\)", display: false };
    else if (isInlineDollarOpen(src, i)) opener = { open: "$", close: "$", display: false };

    if (!opener) {
      i += 1;
      continue;
    }

    const bodyStart = i + opener.open.length;
    const end = findClose(src, bodyStart, opener.close, lastClose[opener.close]);
    if (end < 0 || (opener.close === "$" && !isInlineDollarClose(src, end))) {
      i += opener.open.length;
      continue;
    }
    const tex = src.slice(bodyStart, end).trim();
    if (tex) found.push({ tex, display: opener.display, index: i });
    i = end + opener.close.length;
  }

  const seen = new Set();
  const formulas = found.filter((f) => {
      const k = `${f.display ? "D" : "I"}:${f.tex}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  return {
    formulas,
    truncated: input.length > src.length || (found.length >= maxFormulas && i < src.length),
    scannedChars: src.length,
  };
}

function findClose(src, from, close, lastClose) {
  if (lastClose < from) return -1;
  const end = src.indexOf(close, from);
  if (close === "$" && end >= 0 && src.slice(from, end).includes("\n")) return -1;
  return end;
}

function isInlineDollarOpen(src, i) {
  return src[i] === "$"
    && src[i - 1] !== "\\"
    && src[i - 1] !== "$"
    && !/[\s\d$]/.test(src[i + 1] || "");
}

function isInlineDollarClose(src, i) {
  return !/[\s\\]/.test(src[i - 1] || "") && !/\d/.test(src[i + 1] || "");
}

function nonNegativeLimit(value, fallback) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}
