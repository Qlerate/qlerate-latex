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
  const found = [];
  const take = (re, display) => {
    for (const m of src.matchAll(re)) {
      const tex = m[1].trim();
      if (tex) found.push({ tex, display, index: m.index, length: m[0].length });
    }
  };
  take(/\$\$([\s\S]+?)\$\$/g, true);
  take(/\\\[([\s\S]+?)\\\]/g, true);
  take(/\\\(([\s\S]+?)\\\)/g, false);
  // Single-dollar inline: no space right after the opening or before the closing dollar, no digit right
  // after the opening dollar (money), and no line break inside.
  take(/(?<![\\$])\$(?![\s\d$])([^$\n]+?)(?<![\s\\])\$(?!\d)/g, false);

  // Drop inline matches that fall inside a display match, then order and dedupe.
  const spans = found.filter((f) => f.display);
  const inside = (f) => spans.some((s) => s !== f && f.index >= s.index && f.index + f.length <= s.index + s.length);
  const seen = new Set();
  return found
    .filter((f) => !inside(f))
    .sort((a, b) => a.index - b.index)
    .filter((f) => {
      const k = `${f.display ? "D" : "I"}:${f.tex}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map(({ tex, display, index }) => ({ tex, display, index }));
}
