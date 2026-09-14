// Minimal resolver for the Jira issue panel. The panel itself calls Jira from the browser with the
// viewer's permissions (requestJira), so no server-side data access is needed here.
import Resolver from "@forge/resolver";

const resolver = new Resolver();
resolver.define("ping", () => ({ ok: true }));

export const handler = resolver.getDefinitions();
