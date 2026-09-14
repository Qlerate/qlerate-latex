// Macro view: read the formula from the macro configuration and typeset it.
import { view } from "@forge/bridge";
import { DEFAULTS, isInline, renderInto } from "./render.js";

async function main() {
  const out = document.getElementById("out");
  let context = {};
  try {
    context = await view.getContext();
  } catch (e) {
    out.className = "error";
    out.textContent = `Could not read macro context: ${e.message}`;
    return;
  }
  const config = { ...DEFAULTS, ...(context.extension?.config || {}) };
  const inline = isInline(config, context.moduleKey);
  if (inline) document.body.classList.add("inline");
  renderInto(out, config.tex, { inline, size: config.size });
  // Theme follows Confluence (light/dark); ready event lets exports and the editor know we are done.
  view.theme?.enable?.().catch(() => {});
  try {
    await view.emitReadyEvent();
  } catch {
    /* not in an exporting context */
  }
}

main();
