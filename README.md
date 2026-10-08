# Qlerate LaTeX for Confluence and Jira

Free, open-source LaTeX formulas for Confluence and Jira Cloud, built on Atlassian Forge. MIT licensed.

Two macros, **LaTeX formula** (display) and **LaTeX inline**, typeset TeX with [KaTeX](https://katex.org)
inside the page. The Jira issue panel finds and renders formulas in issue descriptions and comments.
Rendering happens from assets bundled with the app, no content is sent outside Atlassian, and the app
does not retain content. PDF and Word exports show a Unicode rendering plus the exact source in a code block.

## Install on your own site

Any Confluence Cloud admin can run their own copy. No Marketplace listing is required.

```
git clone https://github.com/Qlerate/qlerate-latex.git && cd qlerate-latex
npm ci && npm run build && npm test
npm install -g @forge/cli@14.1.0   # the repository checks this exact release-tool version
npm run forge -- login             # Atlassian e-mail + API token (id.atlassian.com → Security → API tokens)
npm run forge -- register "Qlerate LaTeX"  # writes the app id into manifest.yml
npm run deploy
npm run forge -- install --product confluence --site <your-site>.atlassian.net
```

The install asks an admin of the site to approve on first run. After that, `npm run deploy` updates
the installed app in place. The checked wrapper refuses to deploy with a different Forge CLI version.
Before a release, `npm run release:check` runs tests, builds, lints and writes `release-evidence.json`
with the source commit, tool versions and SHA-256 hashes of the lockfile, manifest and built bundles.

## Using it

In the editor type `/LaTeX`, choose the block or inline macro, enter TeX in the panel, Save.
The panel shows a live preview and refuses to save a formula KaTeX cannot parse.
Shortcuts defined out of the box: `\dB`, `\dBm`, `\argmax`, `\argmin`, `\R`, `\E`
(edit `src/frontend/render.js` to add your own).

Programmatic insertion (for example from an Atlassian MCP connector or the REST API) uses an
`extension` node whose `parameters.guestParams` is
`{ "tex": "...", "mode": "auto|display|inline", "size": "small|normal|large" }`.
Copy the exact `extensionId` from any page where the macro was inserted once by hand.

## Jira

The same app adds a **LaTeX** panel to the right-hand column of every Jira issue (an issue context
module, so it appears without anyone adding it). It reads the issue's description and comments
with the viewer's own permissions and typesets every formula it finds: `$…$` and `\(…\)` inline,
`$$…$$` and `\[…\]` display, and code blocks whose language is `latex` or `tex`. Money amounts such as
`$5` are ignored. The panel needs the `read:jira-work` scope, which the site admin approves at install.
Install on Jira with the same installation link, product Jira. To keep large issues responsive, each
field is scanned up to Jira's 32,767-character field limit and the panel renders at most 200 formulas
across 131,068 scanned characters. The panel shows a notice when a limit is reached.

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
| `scripts/forge.mjs` | enforces the reviewed Forge CLI version for release commands |
| `scripts/release-evidence.mjs` | verifies and records release provenance and artifact hashes |
| `test/` | `node --test` |

## Limits

- Custom UI runs in an iframe; an inline macro is sized to its content (`width: fit-content`).
- KaTeX dimensions are capped at 100 em per dimension; ordinary formulas and team shortcuts are unchanged.
- Exports cannot run KaTeX, hence the Unicode + source fallback. A typeset export would need a
  server-side renderer producing an attachment, which Forge's export hook does not support today.
- Confluence search indexes the TeX source as text, not as maths.

## Contributing

Issues and pull requests are welcome. Run `npm test` before opening a PR; add a case to
`test/tex2text.test.js` for any new TeX construct the export fallback should understand.
