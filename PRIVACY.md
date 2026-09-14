# Privacy Policy — Qlerate LaTeX for Confluence

Effective date: 14 September 2026. Publisher: Qlerate (privacy contact: avi@qlerate.com).

## Summary

Qlerate LaTeX typesets LaTeX formulas inside Confluence Cloud pages. It runs entirely on Atlassian's
Forge platform and in the reader's browser. It does not collect, transmit, store or sell any personal
data, and it makes no network calls to any server outside Atlassian.

## What the app processes

- **Formula source.** The LaTeX text an author types into the macro. It is stored by Confluence as part
  of the page content, in the macro's configuration, on Atlassian's infrastructure, subject to your
  Atlassian Cloud terms. The app never copies it anywhere else.
- **Page context provided by Confluence.** When a macro renders, Confluence passes the app the usual
  Forge context (site, page and macro identifiers, the viewer's Atlassian account id, locale, theme).
  The app reads the macro configuration and theme from it and discards the rest. Nothing is logged
  or retained.

## What the app does not do

- No external requests. Rendering uses the KaTeX library bundled with the app and served by Atlassian.
  The app declares no external fetch, script, style, font or frame permissions in its manifest.
- No storage. The app uses no Forge storage, database or cache.
- No analytics, telemetry, cookies or tracking of any kind.
- No access to page content beyond the macro's own configuration. The app requests no Confluence
  content scopes.
- No sharing or selling of data. There is no data to share.

## Exports

When a page is exported to PDF or Word, Confluence invokes the app's export function once per macro
so the formula can appear in the document. The function receives only the macro configuration and
returns a text rendering of it. It keeps no record of the call.

## Data location and retention

All data lives where Confluence stores your pages. The app itself retains nothing, so there is nothing
for the app to delete; removing a macro or a page removes the formula with it. Uninstalling the app
leaves your pages intact with the formula source still stored in them.

## Security

The app's code is open source at https://github.com/Qlerate/qlerate-latex and can be audited in full.
It runs in Atlassian's sandboxed Forge environment, is eligible for Atlassian's "Runs on Atlassian"
designation (no egress), and renders with `trust: false` so LaTeX input cannot inject HTML.

## Children

The app is a productivity tool for Confluence users and is not directed at children.

## Changes

Changes to this policy are published in the repository above with the effective date updated.

## Contact

Questions about this policy: avi@qlerate.com.
