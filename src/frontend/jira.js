// Jira issue panel: fetch the issue's description and comments with the viewer's permissions, find
// $…$ / $$…$$ / \(…\) / \[…\] spans and TeX code blocks, and typeset each one with KaTeX.
import { view, requestJira } from "@forge/bridge";
import { adfToText, findFormulas } from "./mathscan.js";
import { renderInto } from "./render.js";

const $ = (id) => document.getElementById(id);

function card(title, formulas) {
  if (!formulas.length) return null;
  const section = document.createElement("section");
  const h = document.createElement("h4");
  h.textContent = title;
  section.appendChild(h);
  for (const f of formulas) {
    const row = document.createElement("div");
    row.className = "row";
    const out = document.createElement("div");
    renderInto(out, f.tex, { inline: !f.display, size: "normal" });
    const src = document.createElement("code");
    src.textContent = f.display ? `$$${f.tex}$$` : `$${f.tex}$`;
    src.title = "LaTeX source";
    row.append(out, src);
    section.appendChild(row);
  }
  return section;
}

async function load() {
  const root = $("root");
  const status = $("status");
  root.replaceChildren();
  status.textContent = "Loading…";
  let context;
  try {
    context = await view.getContext();
  } catch (e) {
    status.textContent = `Cannot read issue context: ${e.message}`;
    return;
  }
  const key = context.extension?.issue?.key;
  if (!key) {
    status.textContent = "No issue in context.";
    return;
  }
  let issue;
  try {
    const res = await requestJira(`/rest/api/3/issue/${encodeURIComponent(key)}?fields=summary,description,comment&expand=renderedFields`);
    if (!res.ok) throw new Error(`Jira returned ${res.status}`);
    issue = await res.json();
  } catch (e) {
    status.textContent = `Could not load ${key}: ${e.message}`;
    return;
  }
  const sections = [];
  const descText = adfToText(issue.fields?.description) + "\n" + (issue.fields?.summary || "");
  sections.push(card("Description", findFormulas(descText)));
  for (const c of issue.fields?.comment?.comments || []) {
    const who = c.author?.displayName || "comment";
    const when = c.created ? new Date(c.created).toLocaleDateString() : "";
    sections.push(card(`Comment by ${who} ${when}`.trim(), findFormulas(adfToText(c.body))));
  }
  const present = sections.filter(Boolean);
  if (!present.length) {
    status.textContent = "No formulas found. Write $E=mc^2$ or $$\\sum_i x_i$$ in the description or a comment, or a code block with language latex.";
    return;
  }
  status.textContent = "";
  root.append(...present);
  try {
    await view.emitReadyEvent?.();
  } catch {
    /* not required in Jira */
  }
}

$("refresh").addEventListener("click", load);
view.theme?.enable?.().catch(() => {});
load();
