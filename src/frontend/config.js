// Config panel: a TeX editor with live preview. Saving writes {tex, mode, size} into the macro's config,
// which the macro view (main.js) and the export handler (src/export.js) both read.
import { view } from "@forge/bridge";
import { DEFAULTS, isInline, renderInto } from "./render.js";

const $ = (id) => document.getElementById(id);

async function main() {
  let context = {};
  try {
    context = await view.getContext();
  } catch {
    /* preview still works without context */
  }
  const config = { ...DEFAULTS, ...(context.extension?.config || {}) };
  const tex = $("tex");
  const mode = $("mode");
  const size = $("size");
  const preview = $("preview");
  const status = $("status");
  tex.value = config.tex;
  mode.value = config.mode;
  size.value = config.size;

  const refresh = () => {
    const current = { tex: tex.value, mode: mode.value, size: size.value };
    const err = renderInto(preview, current.tex, {
      inline: isInline(current, context.moduleKey),
      size: current.size,
    });
    $("save").disabled = Boolean(err);
    status.textContent = err ? "Fix the error above to save." : "";
  };
  tex.addEventListener("input", refresh);
  mode.addEventListener("change", refresh);
  size.addEventListener("change", refresh);
  refresh();

  $("save").addEventListener("click", async () => {
    const payload = { tex: tex.value, mode: mode.value, size: size.value };
    try {
      await view.submit(payload);
      status.textContent = "Saved.";
      view.close?.().catch?.(() => {});
    } catch (e) {
      status.textContent = `Could not save: ${e.message}`;
    }
  });
  $("cancel").addEventListener("click", () => view.close?.().catch?.(() => {}));

  // Ctrl/Cmd+Enter saves.
  tex.addEventListener("keydown", (ev) => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter" && !$("save").disabled) $("save").click();
  });
  view.theme?.enable?.().catch(() => {});
  tex.focus();
}

main();
