// adfExport handler: what the macro becomes in PDF / Word exports, where no JavaScript runs.
// Exports get a readable Unicode rendering of the formula followed by the exact TeX source.
import { tex2text } from "./tex2text.js";

function configFrom(payload) {
  return (
    payload?.extension?.config ??
    payload?.extensionPayload?.config ??
    payload?.config ??
    payload?.parameters?.guestParams ??
    {}
  );
}

export function buildExportDoc(config, exportType) {
  const tex = String(config?.tex ?? "").trim();
  if (!tex) {
    return { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: "(empty LaTeX macro)", marks: [{ type: "em" }] }] }] };
  }
  const readable = tex2text(tex);
  const content = [];
  if (readable) {
    content.push({ type: "paragraph", content: [{ type: "text", text: readable, marks: [{ type: "em" }] }] });
  }
  // Word exports render code blocks as monospace paragraphs; PDF keeps the block. Both keep the source exact.
  content.push({ type: "codeBlock", attrs: { language: "latex" }, content: [{ type: "text", text: tex }] });
  return { type: "doc", version: 1, content };
}

export const handler = async (payload) => buildExportDoc(configFrom(payload), payload?.exportType);
