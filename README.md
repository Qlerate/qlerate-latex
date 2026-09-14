# Qlerate LaTeX for Confluence

Free, open-source LaTeX formulas for Confluence Cloud, built on Atlassian Forge. MIT licensed.

Two macros, **LaTeX formula** (display) and **LaTeX inline**, typeset TeX with [KaTeX](https://katex.org)
inside the page. Rendering happens entirely in Atlassian's sandbox from assets bundled with the app;
no formula, page or user data is sent anywhere. PDF and Word exports show a Unicode rendering plus the
exact source in a code block.

## Install on your own site

Any Confluence Cloud admin can run their own copy. No Marketplace listing is required.

```
git clone https://github.com/Qlerate/qlerate-latex.git && cd qlerate-latex
npm install && npm run build && npm test
npm install -g @forge/cli          # Forge CLI wants Node 22 or 24
forge login                        # Atlassian e-mail + API token (id.atlassian.com → Security → API tokens)
forge register "Qlerate LaTeX"     # writes the app id into manifest.yml
forge deploy
forge install --product confluence --site <your-site>.atlassian.net
```

The install asks a Confluence admin of the site to approve on first run. After that,
`npm run build && forge deploy` updates the installed app in place.

## Using it

In the editor type `/LaTeX`, choose the block or inline macro, enter TeX in the panel, Save.
The panel shows a live preview and refuses to save a formula KaTeX cannot parse.
Shortcuts defined out of the box: `\dB`, `\dBm`, `\argmax`, `\argmin`, `\R`, `\E`
(edit `src/frontend/render.js` to add your own).

Programmatic insertion (for example from an Atlassian MCP connector or the REST API) uses an
`extension` node whose `parameters.guestParams` is
`{ "tex": "...", "mode": "auto|display|inline", "size": "small|normal|large" }`.
Copy the exact `extensionId` from any page where the macro was inserted once by hand.

## Layout

| Path | Role |
|---|---|
| `manifest.yml` | two macro modules, one export function, `unsafe-inline` styles for KaTeX |
| `src/frontend/main.js` | macro view: reads `extension.config`, renders with KaTeX, emits the ready event |
| `src/frontend/config.js` | config panel: editor with live preview, `view.submit({tex, mode, size})` |
| `src/frontend/render.js` | shared KaTeX options and team macros |
| `src/export.js` | `adfExport` handler for PDF/Word |
| `src/tex2text.js` | TeX → Unicode fallback used by the export |
| `build.mjs` | esbuild bundles + copies KaTeX CSS/fonts into `static/*` |
| `test/` | `node --test` |

## Limits

- Custom UI runs in an iframe; an inline macro is sized to its content (`width: fit-content`).
- Exports cannot run KaTeX, hence the Unicode + source fallback. A typeset export would need a
  server-side renderer producing an attachment, which Forge's export hook does not support today.
- Confluence search indexes the TeX source as text, not as maths.

## Contributing

Issues and pull requests are welcome. Run `npm test` before opening a PR; add a case to
`test/tex2text.test.js` for any new TeX construct the export fallback should understand.
