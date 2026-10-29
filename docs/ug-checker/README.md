# UG Checker · CE Toolkit automation

Drop-in scaffolding for `salemove/ce-toolkit`. Ports the Chrome MV3 UG Checker into the CE Toolkit architecture from:

- `[CE Toolkit] Automations Creation Rulebook`
- `Hackathon Guide: Using IAM Credentials for Glia Banker`
- `glia-functions.md` (create function → version → deploy current version)

## What it does

Jira-driven Knowledge Bank lookup for the logged-in CE only:

1. Load that CE’s open UG Checker tickets.
2. Expand a ticket, verify the IDs, then run **Fetch** or **Responses**.
3. The Glia Function calls Knowledge Bank GraphQL with a bearer token from Secrets Manager.
4. The console shows the readable report (name, text, guidelines, button destinations).
5. Every run writes an audit row via `write_log`.

The browser never sees Knowledge Bank or Jira credentials.

## Files

| Path | Role |
| --- | --- |
| `index-card.html` | Card snippet to paste into toolkit `index.html` |
| `src/ug-checker.html` | Automation page (mandatory UI) |
| `src/css/ug-checker.css` | Page styles |
| `src/js/ug-checker.js` | Frontend logic — Glia SDK only, no secrets |
| `src/js/glia-functions/Automations/UgChecker/` | Orchestrator Glia Function |
| `src/js/glia-functions/Jira/jira-ce-tkt-retrieval-ug-checker/` | Jira ticket fetcher |

## Field mapping (same as the Chrome extension)

The UI labels stay swapped relative to the GraphQL model:

| UI / Jira form label | Used by | GraphQL |
| --- | --- | --- |
| **User goal ID** | Fetch | `response(where: { id })` |
| **Response ID** | Responses | `responses(where: { user_goal: { id: { equals } } })` |

## Mandatory UI (rulebook §4)

- Ticket table scoped to the logged-in CE
- Expandable **View More** row with details + verification checkbox
- Trigger buttons disabled until the checkbox is checked
- Terminal console (`<pre>`)
- Summary table after the run

## Security (rulebook §8 + hackathon)

- No tokens in `src/js/`, HTML, or git
- Secrets from AWS Secrets Manager via Glia Function env IAM keys (`aws:accessKeyId`, `aws:secretAccessKey`)
- Token verification logs only the first 5 characters
- `window.getGliaApi({ version: 'v1' })` before every function invoke
- Audit log on success and failure

## Secrets to create (ask Charlie / Ruy)

1. **Knowledge Bank** — `KNOWLEDGE_BANK_SECRET_ID`  
   JSON: `{ "bearerToken": "<kb-bearer>" }`

2. **Jira** — `JIRA_SECRET_ID`  
   JSON: `{ "baseUrl": "https://<org>.atlassian.net", "email": "<bot@…>", "apiToken": "<token>" }`

Reuse the shared Jira secret used by other CE Toolkit automations when possible.

## Glia Function env vars

### `ug_checker`

| Key | Purpose |
| --- | --- |
| `aws:accessKeyId` | IAM key that can read the KB secret |
| `aws:secretAccessKey` | IAM secret |
| `AWS_REGION` | `us-east-1` |
| `KNOWLEDGE_BANK_SECRET_ID` | Secret name/ARN |
| `GRAPHQL_ENDPOINT` | Optional; defaults to prod KB GraphQL |

### `jira_ce_tkt_retrieval_ug_checker`

| Key | Purpose |
| --- | --- |
| `aws:accessKeyId` | IAM key that can read the Jira secret |
| `aws:secretAccessKey` | IAM secret |
| `AWS_REGION` | `us-east-1` |
| `JIRA_SECRET_ID` | Secret name/ARN |
| `JIRA_JQL` | Optional override; must keep `{email}` assignee scope |

Default JQL:

```
assignee = "{email}" AND resolution = Unresolved AND labels = "ug-checker" ORDER BY updated DESC
```

Align the label / request type with Markko before go-live.

## Build and deploy (`glia-functions.md` + rulebook §10)

Glia Functions are ESM only (`export async function onInvoke(request, env)`). Upload the **bundle**, not the source.

### 1. Build each function

```bash
cd src/js/glia-functions/Automations/UgChecker
npm install
npm run build   # → function-out.js

cd ../../Jira/jira-ce-tkt-retrieval-ug-checker
npm install
npm run build   # → function-out.js
```

### 2. Create / version / deploy in Glia Hub

Per `glia-functions.md`:

1. **Create function** (once) → note `function_id` and `invocation_uri`.
2. **Create function version** with `function-out.js` and the env vars above.
3. **Change current version** to deploy that version.
4. Permissions: callers need `functions:invoke`. Service credentials used for S2S need `functions:invoke` via access policy.

### 3. Wire frontend URIs

In `src/js/ug-checker.js`, replace:

- `JIRA_RETRIEVAL_URI`
- `UG_CHECKER_URI`
- `WRITE_LOG_URI` (shared `write_log` / `dynamo_write_audittable` function)

The invocation UUID changes when you deploy a new current version — update the consts after each deploy.

### 4. Toolkit branch

This automation lives on `lucas_ug_checker` in `ruyca-glia/ce_toolkit_pre-prod`.

1. Card is already in `index.html`.
2. PR description must include: what it does, Jira ticket type, deployed function endpoint URLs, and confirmation that DynamoDB audit rows appear.
3. Deploy functions **before** merge. No staging — production only after CODEOWNERS + Snyk green.

## Manual go-live check (rulebook §11)

1. Open the applet as yourself.
2. Confirm only your tickets load.
3. View More → check the box → Fetch / Responses.
4. Console shows the report; summary table fills.
5. Audit log row appears in DynamoDB (`siteId` = CE Test Site UUID from the rulebook).

## Chrome extension

The original MV3 side-panel prototype is under `docs/ug-checker/chrome-extension/`. It talks to Knowledge Bank GraphQL from the browser with a pasted bearer token. This toolkit app is the Compsec-aligned path: approved Glia applet + Functions, secrets in AWS, Auth0/Glia session via the applet SDK.
