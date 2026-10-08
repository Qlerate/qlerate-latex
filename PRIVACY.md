# Privacy Policy — Qlerate LaTeX for Confluence and Jira

Effective date: 8 October 2026. Publisher: Qlerate (privacy contact: support@qlerate.com).

## Summary

Qlerate LaTeX typesets LaTeX formulas inside Confluence Cloud pages and in a Jira Cloud issue panel.
It runs on Atlassian's Forge platform and in the reader's browser. It processes the Atlassian content
described below only to render formulas. It does not retain or sell that content and makes no network
calls to any server outside Atlassian.

## What the app processes

- **Formula source.** The LaTeX text an author types into the macro. It is stored by Confluence as part
  of the page content, in the macro's configuration, on Atlassian's infrastructure, subject to your
  Atlassian Cloud terms. The app never copies it anywhere else.
- **Page context provided by Confluence.** When a macro renders, Confluence passes the app the usual
  Forge context (site, page and macro identifiers, the viewer's Atlassian account id, locale, theme).
  The app reads the macro configuration and theme from it and discards the rest. Nothing is logged
  or retained.
- **Jira issue content.** When a viewer opens the Jira panel, the app uses that viewer's existing Jira
  permissions to request the issue key, summary, description, comments, comment-author display names
  and comment creation dates from Jira. It scans that content for formulas and uses author names and
  dates as labels in the panel. Processing is transient in the panel; the app does not store or log it.

## What the app does not do

- No external requests. Rendering uses the KaTeX library bundled with the app and served by Atlassian.
  The app declares no external fetch, script, style, font or frame permissions in its manifest.
- No storage. The app uses no Forge storage, database or cache.
- No analytics, telemetry, cookies or tracking of any kind.
- No access to Confluence page content beyond the macro's own configuration. The app requests no
  Confluence content scopes. Its `read:jira-work` scope is used only for the Jira issue content above.
- No sharing or selling of data. Processed content remains within Atlassian's platform and the viewer's
  browser session.

## Exports

When a page is exported to PDF or Word, Confluence invokes the app's export function once per macro
so the formula can appear in the document. The function receives only the macro configuration and
returns a text rendering of it. It keeps no record of the call.

## Data location and retention

Source content remains where Confluence stores pages and Jira stores issues. The app itself retains
nothing, so there is no app-owned content to delete. Removing content in Confluence or Jira removes it
from future rendering. Uninstalling the app does not delete the source content stored by Atlassian.

## Security

The app's code is open source at https://github.com/Qlerate/qlerate-latex and can be audited in full.
It runs in Atlassian's sandboxed Forge environment, is eligible for Atlassian's "Runs on Atlassian"
designation (no egress), and renders with `trust: false` so LaTeX input cannot inject HTML.

## Children

The app is a productivity tool for Confluence and Jira users and is not directed at children.

## Changes

Changes to this policy are published in the repository above with the effective date updated.

## Contact

Questions about this policy: support@qlerate.com.
