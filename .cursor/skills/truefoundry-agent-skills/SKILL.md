---
name: truefoundry-agent-skills
description: A comprehensive collection of agent skills for managing TrueFoundry platform operations — deployments, secrets, access control, AI gateway, guardrails, logs, MCP servers, prompts, and more.
license: MIT
compatibility: Requires Bash, curl, and access to a TrueFoundry instance
allowed-tools: Bash(*/tfy-api.sh *) Bash(curl *) Bash(python*)
---

# TrueFoundry Agent Skills

A bundled skill package for managing the TrueFoundry MLOps platform.

## Prerequisites

- A TrueFoundry account with API access
- Environment variables: `TFY_BASE_URL` (or `TFY_HOST`) and `TFY_API_KEY`
- Bash, curl installed

Run the **Status** section first to verify your credentials.

---

<objective>

# TrueFoundry Status

Check TrueFoundry connection and verify credentials are configured.

## When to Use

Verify TrueFoundry credentials and connectivity, or diagnose authentication issues before performing platform operations.

## When NOT to Use

- User wants to list workspaces → prefer `workspaces` skill; ask if the user wants another valid path
- User wants to deploy → prefer `deploy` skill; ask if the user wants another valid path
- User wants to see running apps → prefer `applications` skill; ask if the user wants another valid path

</objective>

<context>

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TFY_BASE_URL` | TrueFoundry platform URL | `https://your-org.truefoundry.cloud` |
| `TFY_HOST` | CLI host alias (recommended when `TFY_API_KEY` is set for CLI commands) | `https://your-org.truefoundry.cloud` |
| `TFY_API_KEY` | API key (raw, no Bearer prefix) | `tfy-...` |

</context>

<instructions>

## Check Credentials

### Via Tool Call (if tfy-tool-server is configured)

If the TrueFoundry tool server is available, use this tool call:

```
tfy_config_status
```

This returns connection status, configured base URL, and whether an API key is set.

### Via Direct API

Check environment variables and test the connection. Set `TFY_API_SH` to the full path of this skill's `scripts/tfy-api.sh`. See `references/tfy-api-setup.md` for paths per agent.

```bash
# Check env vars are set
echo "TFY_BASE_URL: ${TFY_BASE_URL:-(not set)}"
echo "TFY_HOST: ${TFY_HOST:-(not set)}"
echo "TFY_API_KEY: ${TFY_API_KEY:+(set)}${TFY_API_KEY:-(not set)}"

# Test connection — list workspaces (lightweight call). Use full path shown above.
# Example for Claude Code:
~/.claude/skills/truefoundry-status/scripts/tfy-api.sh GET '/api/svc/v1/workspaces?limit=1'
```

### Via .env File

If env vars are not set, check for a `.env` file:

```bash
[ -f .env ] && echo ".env found" || echo "No .env file"
```

## Presenting Status

```
TrueFoundry Status:
- Base URL: https://your-org.truefoundry.cloud ✓
- API Key: configured ✓
- Connection: OK (listed 1 workspace)
```

Or if something is wrong:

```
TrueFoundry Status:
- Base URL: (not set) ✗
- API Key: (not set) ✗

Set TFY_BASE_URL and TFY_API_KEY in your environment or .env file.
Get an API key: https://docs.truefoundry.com/docs/generating-truefoundry-api-keys
```

</instructions>

<success_criteria>

- The user can confirm whether TFY_BASE_URL and TFY_API_KEY are correctly set
- The agent has tested the API connection with a lightweight call and reported the result
- The user can see a clear status summary showing which components are configured and which are missing
- The agent has provided actionable next steps if any credential or connectivity issue was found
- The user knows which skill to use next based on their goal (`deploy`, list workspaces, etc.)

</success_criteria>

<troubleshooting>

## Error Handling

### 401 Unauthorized
```
API key is invalid or expired. Generate a new one:
https://docs.truefoundry.com/docs/generating-truefoundry-api-keys
```

### Connection Refused / Timeout
```
Cannot reach TFY_BASE_URL. Check:
- URL is correct (include https://)
- Network/VPN is connected
```

### Missing Variables
```
TFY_BASE_URL and TFY_API_KEY are required.
Set them via environment variables or add to .env in project root.
```

### CLI Host Missing (`TFY_HOST` error)
```
If tfy CLI says: "TFY_HOST env must be set since TFY_API_KEY env is set"
run: export TFY_HOST="${TFY_HOST:-${TFY_BASE_URL%/}}"
```

</troubleshooting>

<references>

## Composability

- **After status OK**: Use any other skill (workspaces, applications, deploy, etc.)
- **To set credentials**: Export env vars or create .env file
- **If using tool calls**: Use `tfy_config_set` to persist credentials

</references>

---

<objective>

# TrueFoundry Documentation

Fetch up-to-date TrueFoundry documentation for features, API reference, and deployment guides.

## When to Use

Fetch up-to-date TrueFoundry documentation for features, API reference, deployment guides, or troubleshooting.

</objective>

<instructions>

## Documentation Sources

### API Reference

Full API docs:
```
https://truefoundry.com/docs/api-reference
```

Fetch a specific section:
```bash
curl -s https://truefoundry.com/docs/api-reference/applications/list-applications
```

### Deployment Guides

| Topic | URL |
|-------|-----|
| Introduction to Services | `https://truefoundry.com/docs/introduction-to-a-service` |
| Deploy First Service | `https://truefoundry.com/docs/deploy-first-service` |
| Dockerize Code | `https://truefoundry.com/docs/dockerize-code` |
| Ports and Domains | `https://truefoundry.com/docs/define-ports-and-domains` |
| Endpoint Auth | `https://truefoundry.com/docs/endpoint-authentication` |
| Resources (CPU/Memory) | `https://truefoundry.com/docs/resources-cpu-memory-storage` |
| Fractional GPUs | `https://truefoundry.com/docs/using-fractional-gpus` |
| Environment Variables | `https://truefoundry.com/docs/environment-variables-and-secrets` |
| Autoscaling | `https://truefoundry.com/docs/autoscaling-overview` |
| Liveness/Readiness Probes | `https://truefoundry.com/docs/liveness-readiness-probe` |
| Rollout Strategy | `https://truefoundry.com/docs/rollout-strategy` |
| Deploy Programmatically | `https://truefoundry.com/docs/deploy-service-programatically` |
| CI/CD Setup | `https://truefoundry.com/docs/setting-up-cicd-for-your-service` |
| Monitoring | `https://truefoundry.com/docs/monitor-your-service` |

### Job Deployment

| Topic | URL |
|-------|-----|
| Introduction to Jobs | `https://truefoundry.com/docs/introduction-to-a-job` |
| Deploy First Job | `https://truefoundry.com/docs/deploy-first-job` |

### ML & LLM

| Topic | URL |
|-------|-----|
| ML Repos | `https://truefoundry.com/docs/ml-repos` |
| LLM Deployment | `https://truefoundry.com/docs/llm-deployment` |
| LLM Tracing | `https://truefoundry.com/docs/llm-tracing` |

### Authentication

| Topic | URL |
|-------|-----|
| Generating API Keys | `https://docs.truefoundry.com/docs/generating-truefoundry-api-keys` |

## Fetching Docs

To fetch a specific docs page for the user:

```bash
curl -sL "https://truefoundry.com/docs/deploy-first-service" | head -200
```

Or use WebFetch if available in the agent.

</instructions>

<success_criteria>

## Success Criteria

- The user has received the relevant documentation content or URL for their question
- The agent has fetched and summarized the specific docs page rather than just linking to it
- The user understands the next steps based on the documentation provided
- If the docs page was unavailable, the agent has suggested alternative resources or related skills

</success_criteria>

<references>

## Composability

- **Before deploy**: Fetch deploy guides for the specific app type
- **For API usage**: Reference `references/api-endpoints.md` in _shared
- **For troubleshooting**: Fetch relevant docs page and summarize

</references>

---

<objective>

# Access Control

Manage TrueFoundry roles, teams, and collaborators. Roles define permission sets, teams group users, and collaborators grant access to specific resources.

## When to Use

List, create, or delete roles, teams, and collaborators on TrueFoundry. Use when managing permissions, organizing users into teams, or granting/revoking access to workspaces, applications, MCP servers, or other resources.

</objective>

<instructions>

## Roles

Roles are named permission sets scoped to a resource type. Built-in roles vary by resource type (for example, `workspace-admin`, `workspace-member`).

When using direct API, set `TFY_API_SH` to the full path of this skill's `scripts/tfy-api.sh`. See `references/tfy-api-setup.md` for paths per agent.

### List Roles

#### Via Tool Call

```
tfy_roles_list()
```

#### Via Direct API

```bash
# Set the path to tfy-api.sh for your agent (example for Claude Code):
TFY_API_SH=~/.claude/skills/truefoundry-access-control/scripts/tfy-api.sh

# List all roles
$TFY_API_SH GET /api/svc/v1/roles
```

### Presenting Roles

```
Roles:
| Name              | ID       | Resource Type | Permissions |
|-------------------|----------|---------------|-------------|
| workspace-admin   | role-abc | workspace     | 12          |
| workspace-member  | role-def | workspace     | 5           |
| custom-deployer   | role-ghi | workspace     | 3           |
```

### Create Role

#### Via Tool Call

```
tfy_roles_create(payload={"name": "custom-deployer", "displayName": "Custom Deployer", "description": "Can deploy apps", "resourceType": "workspace", "permissions": ["deploy:create", "deploy:read"]})
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH POST /api/svc/v1/roles '{"name":"custom-deployer","displayName":"Custom Deployer","description":"Can deploy apps","resourceType":"workspace","permissions":["deploy:create","deploy:read"]}'
```

### Delete Role

#### Via Tool Call

```
tfy_roles_delete(id="ROLE_ID")
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH DELETE /api/svc/v1/roles/ROLE_ID
```

## Teams

Teams group users for collective access management. Each team has a name, description, and members list.

### List Teams

#### Via Tool Call

```
tfy_teams_list()
tfy_teams_list(team_id="TEAM_ID")  # get specific team
```

#### Via Direct API

```bash
# List all teams
$TFY_API_SH GET /api/svc/v1/teams

# Get a specific team
$TFY_API_SH GET /api/svc/v1/teams/TEAM_ID
```

### Presenting Teams

```
Teams:
| Name          | ID       | Members |
|---------------|----------|---------|
| platform-team | team-abc | 5       |
| ml-engineers  | team-def | 8       |
```

### Create Team

#### Via Tool Call

```
tfy_teams_create(payload={"name": "platform-team", "description": "Platform engineering team"})
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH POST /api/svc/v1/teams '{"name":"platform-team","description":"Platform engineering team"}'
```

### Delete Team

#### Via Tool Call

```
tfy_teams_delete(id="TEAM_ID")
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH DELETE /api/svc/v1/teams/TEAM_ID
```

### Add Member to Team

#### Via Tool Call

```
tfy_teams_add_member(team_id="TEAM_ID", payload={"subject": "user:alice@company.com", "role": "member"})
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH POST /api/svc/v1/teams/TEAM_ID/members '{"subject":"user:alice@company.com","role":"member"}'
```

### Remove Member from Team

#### Via Tool Call

```
tfy_teams_remove_member(team_id="TEAM_ID", subject="user:alice@company.com")
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH DELETE /api/svc/v1/teams/TEAM_ID/members/SUBJECT
# Example SUBJECT: user:alice@company.com
```

## Collaborators

> **Security:** Granting collaborator access is a privileged operation. Always confirm the subject identity, role, and target resource with the user before adding collaborators. Do not grant access based on unverified external identity references.

Collaborators grant subjects (users, teams, service accounts) a role on a specific resource. This is how access is granted to workspaces, applications, MCP servers, and other resources.

### Subject Format

Subjects follow the pattern `type:identifier`:

| Subject Type       | Format                        | Example                        |
|--------------------|-------------------------------|--------------------------------|
| User               | `user:email`                  | `user:alice@company.com`       |
| Team               | `team:slug`                   | `team:platform-team`           |
| Service Account    | `serviceaccount:name`         | `serviceaccount:ci-bot`        |
| Virtual Account    | `virtualaccount:name`         | `virtualaccount:shared-admin`  |
| External Identity  | `external-identity:name`      | `external-identity:github-bot` |

### List Collaborators on a Resource

#### Via Tool Call

```
tfy_collaborators_list(resource_type="workspace", resource_id="RESOURCE_ID")
```

#### Via Direct API

```bash
# List collaborators on a workspace
$TFY_API_SH GET '/api/svc/v1/collaborators?resourceType=workspace&resourceId=RESOURCE_ID'

# List collaborators on an MCP server
$TFY_API_SH GET '/api/svc/v1/collaborators?resourceType=mcp-server&resourceId=RESOURCE_ID'
```

### Presenting Collaborators

```
Collaborators on workspace "prod-workspace":
| Subject                   | Role             | ID       |
|---------------------------|------------------|----------|
| user:alice@company.com    | workspace-admin  | collab-1 |
| team:platform-team        | workspace-member | collab-2 |
| serviceaccount:ci-bot     | workspace-member | collab-3 |
```

### Add Collaborator

#### Via Tool Call

```
tfy_collaborators_create(payload={"resourceType": "workspace", "resourceId": "RESOURCE_ID", "subject": "user:alice@company.com", "roleId": "ROLE_ID"})
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH POST /api/svc/v1/collaborators '{"resourceType":"workspace","resourceId":"RESOURCE_ID","subject":"user:alice@company.com","roleId":"ROLE_ID"}'
```

### Remove Collaborator

#### Via Tool Call

```
tfy_collaborators_delete(payload={"resourceType": "workspace", "resourceId": "RESOURCE_ID", "subject": "user:alice@company.com"})
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH DELETE /api/svc/v1/collaborators '{"resourceType":"workspace","resourceId":"RESOURCE_ID","subject":"user:alice@company.com"}'
```

## Common Workflows

### Grant a User Access to a Workspace

1. List roles to find the appropriate role ID (e.g., `workspace-admin` or `workspace-member`)
2. Add the user as a collaborator on the workspace with that role

```bash
# 1. Find the role ID
$TFY_API_SH GET /api/svc/v1/roles

# 2. Add collaborator
$TFY_API_SH POST /api/svc/v1/collaborators '{"resourceType":"workspace","resourceId":"WORKSPACE_ID","subject":"user:alice@company.com","roleId":"ROLE_ID"}'
```

### Create a Team and Grant Access

1. Create the team
2. Add members to the team
3. Add the team as a collaborator on the target resource

```bash
# 1. Create team
$TFY_API_SH POST /api/svc/v1/teams '{"name":"ml-engineers","description":"ML engineering team"}'

# 2. Add members (use team ID from response)
$TFY_API_SH POST /api/svc/v1/teams/TEAM_ID/members '{"subject":"user:alice@company.com","role":"member"}'

# 3. Grant team access to a workspace
$TFY_API_SH POST /api/svc/v1/collaborators '{"resourceType":"workspace","resourceId":"WORKSPACE_ID","subject":"team:ml-engineers","roleId":"ROLE_ID"}'
```

### Audit Access on a Resource

List all collaborators to see who has access and with what role:

```bash
$TFY_API_SH GET '/api/svc/v1/collaborators?resourceType=workspace&resourceId=WORKSPACE_ID'
```

</instructions>

<success_criteria>

## Success Criteria

- The user can list all roles and see them in a formatted table
- The user can create a custom role with specific permissions
- The user can list all teams and their members
- The user can create a team and add/remove members
- The user can list collaborators on any resource type
- The user can add a collaborator (user, team, or service account) to a resource with a specific role
- The user can remove a collaborator from a resource
- The agent has confirmed any create/delete operations before executing

</success_criteria>

<references>

## Composability

- **Preflight**: Use `status` skill to verify credentials before managing access control
- **Before deploy**: Set up teams and grant workspace access so team members can deploy
- **With workspaces**: Grant collaborator access to workspaces for users and teams
- **With MCP servers**: Manage MCP server collaborators and role assignments on registered servers
- **With secrets**: Grant access to secret groups via collaborator roles
- **Dependency chain**: Create roles first, then create teams, then reference both when adding collaborators

</references>

<troubleshooting>

## Error Handling

### Role Not Found
```
Role ID not found. List roles first to find the correct ID.
```

### Team Not Found
```
Team ID not found. List teams first to find the correct ID.
```

### Permission Denied
```
Cannot manage access control. Check your API key permissions — admin access may be required.
```

### Collaborator Already Exists
```
Collaborator with this subject and role already exists on the resource. Use a different role or remove the existing collaborator first.
```

### Invalid Subject Format
```
Invalid subject format. Use the pattern "type:identifier" — e.g., user:alice@company.com, team:platform-team, serviceaccount:ci-bot.
```

### Resource Not Found
```
Resource not found. Verify the resourceType and resourceId are correct. List the resources first to confirm.
```

### Cannot Delete Built-in Role
```
Built-in roles cannot be deleted. Only custom roles can be removed.
```

</troubleshooting>

---

<objective>

# Access Tokens

Manage TrueFoundry personal access tokens (PATs). List, create, and delete tokens used for API authentication, CI/CD pipelines, and AI Gateway access.

## When to Use

List, create, or delete personal access tokens for API authentication, CI/CD pipelines, or AI Gateway access.

</objective>

<instructions>

> **Security Policy: Credential Handling**
> - The agent MUST NOT repeat, store, or log token values in its own responses.
> - After creating a token, direct the user to copy the value from the API response output above — do not re-display it.
> - Never include token values in summaries, follow-up messages, or any other output.

## Step 1: Preflight

Run the `status` skill first to verify `TFY_BASE_URL` and `TFY_API_KEY` are set and valid.

When using direct API, set `TFY_API_SH` to the full path of this skill's `scripts/tfy-api.sh`. See `references/tfy-api-setup.md` for paths per agent.

## Step 2: List Access Tokens

### Via Tool Call
```
tfy_access_tokens_list()
```

### Via Direct API
```bash
TFY_API_SH=~/.claude/skills/truefoundry-access-tokens/scripts/tfy-api.sh

# List all personal access tokens
$TFY_API_SH GET /api/svc/v1/personal-access-tokens
```

Present results:
```
Personal Access Tokens:
| Name          | ID       | Created At  | Expires At  |
|---------------|----------|-------------|-------------|
| ci-pipeline   | pat-abc  | 2025-01-15  | 2025-07-15  |
| dev-local     | pat-def  | 2025-03-01  | Never       |
```

**Security:** Never display token values. They are only shown once at creation time.

## Step 3: Create Access Token

Ask the user for a token name before creating.

### Via Tool Call
```
tfy_access_tokens_create(payload={"name": "my-token"})
```

**Note:** Requires human approval (HITL) via tool call.

### Via Direct API
```bash
# Create a new personal access token
$TFY_API_SH POST /api/svc/v1/personal-access-tokens '{"name":"my-token"}'
```

**IMPORTANT:** The token value is returned ONLY in the creation response.

> **Security: Token Display Policy**
> - Default to showing only a masked preview (for example: first 4 + last 4 characters).
> - Show the full token only after explicit user confirmation that they are ready to copy it now.
> - If a full token is shown, show it only once, in a minimal response, and never repeat it in summaries/follow-up messages.
> - The agent must NEVER store, log, or re-display the token value after the initial one-time reveal.
> - If the user asks to see the token again later, instruct them to create a new token.

Present the result:
```
Token created successfully!
Name: my-token
Token (masked): tfy_****...****

If user explicitly confirms they are ready to copy it:
One-time token: <full value from API response>

⚠️  Save this token NOW — it will not be shown again.
Store it in a password manager, CI/CD secret store, or TrueFoundry secret group.
Never commit tokens to Git or share them in plain text.
```

## Step 4: Delete Access Token

Ask for confirmation before deleting — this is irreversible and will break any integrations using the token.

### Via Tool Call
```
tfy_access_tokens_delete(id="TOKEN_ID")
```

**Note:** Requires human approval (HITL) via tool call.

### Via Direct API
```bash
# Delete a personal access token
$TFY_API_SH DELETE /api/svc/v1/personal-access-tokens/TOKEN_ID
```

</instructions>

<success_criteria>

## Success Criteria

- The user can list all personal access tokens in a formatted table
- The user can create a new token and receives a masked preview by default
- Full token reveal happens only on explicit confirmation and only once
- The user has been warned to save the token value immediately
- The user can delete a token after confirmation
- The agent has never displayed existing token values — only new tokens at creation time

</success_criteria>

<references>

## Composability

- **AI Gateway**: PATs are used to authenticate AI Gateway requests (`ai-gateway` skill)
- **GitOps / CI/CD**: PATs are needed for automated deployments (`gitops` skill, `deploy` skill declarative apply workflow)
- **Status**: Use `status` skill to verify a PAT is working
- **Secrets**: Store PATs as secrets for deployments (`secrets` skill)

## API Endpoints

See `references/api-endpoints.md` for the full Personal Access Tokens API reference.

</references>

<troubleshooting>

## Error Handling

### Permission Denied
```
Cannot manage access tokens. Check your API key permissions.
```

### Token Not Found
```
Token ID not found. List tokens first to find the correct ID.
```

### Token Name Already Exists
```
A token with this name already exists. Use a different name.
```

### Deleted Token Still In Use
```
If services fail after token deletion, they were using the deleted token.
Create a new token and update the affected services/pipelines.
```

### Cannot Retrieve Token Value
```
Token values are only shown at creation time. If lost, delete the old token
and create a new one, then update all services that used the old token.
```

</troubleshooting>

---

<objective>

# AI Gateway

Use TrueFoundry's AI Gateway to access 1000+ LLMs through a unified OpenAI-compatible API with rate limiting, budget controls, load balancing, routing, and observability.

## When to Use

Access LLMs through TrueFoundry's unified OpenAI-compatible gateway, configure auth tokens (PAT/VAT), set up rate limiting, budget controls, or load balancing across providers.

## When NOT to Use

- User wants to deploy a self-hosted model → prefer `llm-deploy` skill; ask if the user wants another valid path (then connect to gateway)
- User wants to deploy tool servers → prefer `deploy` skill; ask if the user wants another valid path (service with tool-proxy)
- User wants to manage TrueFoundry platform credentials → prefer `status` skill; ask if the user wants another valid path

</objective>

<context>

## Overview

The AI Gateway sits between your application and LLM providers:

```
Your App → AI Gateway → OpenAI / Anthropic / Azure / Self-hosted vLLM / etc.
                ↑
         Unified API + Auth + Rate Limiting + Routing + Logging
```

**Key benefits:**
- **Single endpoint** for all models (cloud + self-hosted)
- **One API key** (PAT or VAT) instead of managing per-provider keys
- **OpenAI-compatible** — works with any OpenAI SDK client
- **Rate limiting** per user, team, or application
- **Budget controls** to enforce cost limits
- **Load balancing** across model instances with fallback
- **Observability** — request logging, cost tracking, analytics

## Gateway Endpoint

The gateway base URL is your TrueFoundry platform URL + `/api/llm`:

```
{TFY_BASE_URL}/api/llm
```

Example: `https://your-org.truefoundry.cloud/api/llm`

## Authentication

### Personal Access Token (PAT)

For development and individual use:

1. Go to TrueFoundry dashboard → **Access** → **Personal Access Tokens**
2. Click **New Personal Access Token**
3. Copy the token

### Virtual Access Token (VAT)

For production applications (recommended):

1. Go to TrueFoundry dashboard → **Access** → **Virtual Account Tokens**
2. Click **New Virtual Account** (requires admin privileges)
3. Name it and **select which models** it can access
4. Copy the token

**VATs are recommended for production** because:
- Not tied to a specific user (survives team changes)
- Support granular model access control
- Better for tracking per-application usage

</context>

<instructions>

## Calling Models

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    api_key="<your-PAT-or-VAT>",
    base_url="https://<your-truefoundry-url>/api/llm",
)

# Chat completion
response = client.chat.completions.create(
    model="openai/gpt-4o",  # or any configured model name
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"},
    ],
    max_tokens=200,
)
print(response.choices[0].message.content)
```

### Python (Streaming)

```python
stream = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Write a haiku about AI"}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### cURL

```bash
curl "${TFY_BASE_URL}/api/llm/chat/completions" \
  -H "Authorization: Bearer ${TFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 200
  }'
```

### JavaScript / Node.js

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "<your-PAT-or-VAT>",
  baseURL: "https://<your-truefoundry-url>/api/llm",
});

const response = await client.chat.completions.create({
  model: "openai/gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Environment Variables

Set these to use with any OpenAI-compatible library:

```bash
export OPENAI_BASE_URL="${TFY_BASE_URL}/api/llm"
export OPENAI_API_KEY="<your-PAT-or-VAT>"
```

Then any code using `openai.OpenAI()` without explicit parameters will use the gateway automatically.

## Supported APIs

| API | Endpoint | Description |
|-----|----------|-------------|
| **Chat Completions** | `/chat/completions` | Chat with any model (streaming + non-streaming) |
| **Completions** | `/completions` | Legacy text completions |
| **Embeddings** | `/embeddings` | Text embeddings (text + list inputs) |
| **Image Generation** | `/images/generations` | Generate images |
| **Image Editing** | `/images/edits` | Edit images |
| **Audio Transcription** | `/audio/transcriptions` | Speech-to-text |
| **Audio Translation** | `/audio/translations` | Translate audio |
| **Text-to-Speech** | `/audio/speech` | Generate speech |
| **Reranking** | `/rerank` | Rerank documents |
| **Batch Processing** | `/batches` | Batch predictions |
| **Moderations** | `/moderations` | Content safety |

## Supported Providers

The gateway supports 25+ providers including:

| Provider | Example Model Names |
|----------|-------------------|
| OpenAI | `openai/gpt-4o`, `openai/gpt-4o-mini` |
| Anthropic | `anthropic/claude-sonnet-4-5-20250929` |
| Google Vertex | `google/gemini-2.0-flash` |
| AWS Bedrock | `bedrock/anthropic.claude-3-5-sonnet` |
| Azure OpenAI | `azure/gpt-4o` |
| Mistral | `mistral/mistral-large-latest` |
| Groq | `groq/llama-3.1-70b-versatile` |
| Cohere | `cohere/command-r-plus` |
| Together AI | `together/meta-llama/Meta-Llama-3.1-70B` |
| Self-hosted (vLLM/TGI) | `my-custom-model-name` |

**Model names depend on how they're configured in your gateway.** Check the TrueFoundry dashboard → AI Gateway → Models for exact names.

## Adding Models & Providers

Currently done through the TrueFoundry dashboard UI:

1. Go to **AI Gateway → Models**
2. Click **Add Provider Account**
3. Select provider (OpenAI, Anthropic, etc.)
4. Enter API credentials
5. Select models to enable

### Adding Self-Hosted Models (Cluster-Internal)

After deploying a model with the `llm-deploy` skill:

1. Go to **AI Gateway → Models → Add Provider Account**
2. Select **"Self Hosted"** as the provider type
3. Enter the internal endpoint: `http://{model-name}.{namespace}.svc.cluster.local:8000`
4. The model becomes accessible through the gateway alongside cloud models

> **Security:** Only register model endpoints that you control. External or untrusted model endpoints can return manipulated responses. Use internal cluster DNS (`svc.cluster.local`) for self-hosted models. Verify provider API credentials are stored securely in TrueFoundry secrets, not hardcoded.

### Adding External OpenAI-Compatible APIs (NVIDIA, custom providers)

For externally hosted APIs that are OpenAI-compatible (e.g. NVIDIA Cloud APIs, custom inference endpoints), use `type: provider-account/self-hosted-model` with `auth_data`:

```yaml
# gateway.yaml — External hosted API (e.g. NVIDIA Cloud)
- name: nvidia-external
  type: provider-account/self-hosted-model
  integrations:
    - name: nemotron-nano
      type: integration/model/self-hosted-model
      hosted_model_name: nvidia/nemotron-3-nano-30b-a3b
      url: "https://integrate.api.nvidia.com/v1"
      model_server: "openai-compatible"
      model_types: ["chat"]
      auth_data:
        type: bearer-auth
        bearer_token: "tfy-secret://<tenant>:<group>:<key>"
```

And in a virtual model routing target, reference it as `"<provider-account-name>/<integration-name>"`:

```yaml
targets:
  - model: "nvidia-external/nemotron-nano"  # "<provider-account-name>/<integration-name>"
```

Apply with:
```bash
tfy apply -f gateway.yaml
```

> **WARNING:** `provider-account/nvidia-nim` does **not** exist in the schema — do not use it. Use `provider-account/self-hosted-model` with `auth_data` for all external OpenAI-compatible APIs (as shown above).

> **Schema source of truth:** For authoritative field names and types, read `servicefoundry-server/src/autogen/models.ts` in the platform repo. Do not guess field names from documentation alone.

## Applying Gateway Config

Gateway YAML is applied directly with `tfy apply` — no service build or Docker image involved:

```bash
# Preview changes
tfy apply -f gateway.yaml --dry-run --show-diff

# Apply
tfy apply -f gateway.yaml
```

**Do NOT delegate gateway applies to the `deploy` skill** (which is for service/application deployments). Gateway configs (`type: gateway-*`, `type: provider-account/*`) are applied inline with `tfy apply`.

**Test after apply:**
```bash
# Quick smoke test via curl
curl "${TFY_BASE_URL}/api/llm/chat/completions" \
  -H "Authorization: Bearer ${TFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia-external/nemotron-nano",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 50
  }'
```

Or via Python:
```python
from openai import OpenAI
client = OpenAI(api_key="<PAT-or-VAT>", base_url=f"{TFY_BASE_URL}/api/llm")
resp = client.chat.completions.create(
    model="nvidia-external/nemotron-nano",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(resp.choices[0].message.content)
```

> **Note:** The `deploy` skill reference in the Routing Config section below is only for CI/CD GitOps pipelines — not for one-off gateway config applies.

## Load Balancing & Routing

The gateway supports intelligent request routing across multiple model instances.

### Weight-Based Routing

Distribute requests proportionally:
- 90% to Azure GPT-4o (primary)
- 10% to OpenAI GPT-4o (overflow)

### Latency-Based Routing

Automatically route to the lowest-latency model:
- Measures time per output token over last 20 minutes
- Models within 1.2x of fastest are treated equally
- Models with < 3 recent requests get preferential routing for data collection

### Priority-Based Routing

Route to highest-priority healthy model with SLA cutoff:
- Monitors average Time Per Output Token over 3-minute windows
- Auto-marks models unhealthy when TPOT exceeds threshold
- Automatic recovery when metrics improve

### Fallback Configuration

- **Default retry codes**: 429, 500, 502, 503
- **Default fallback codes**: 401, 403, 404, 429, 500, 502, 503
- Per-target retry attempts and delay intervals
- Auto-failover to backup models when primary is down

### Routing Config via GitOps

Routing configurations can be managed as YAML and applied via `tfy apply`:

```bash
# Store routing config in git, apply via CLI
tfy apply -f gateway-routing-config.yaml
```

See `deploy` skill (declarative apply workflow) and `gitops` skill for CI/CD integration.

## Rate Limiting

Control model usage per user, team, or application:

- **Requests per minute (RPM)** limits
- **Tokens per minute (TPM)** limits
- Per-model or global limits
- Configure via TrueFoundry dashboard → AI Gateway → Rate Limiting

## Budget Controls

Enforce cost limits:

- Per-user spending caps
- Per-team budgets
- Per-model cost limits
- Automatic blocking when budget exceeded
- Configure via TrueFoundry dashboard → AI Gateway → Budget Limiting

## Observability

### Request Logging

All gateway requests are logged with:
- Input/output tokens
- Latency (TTFT, total)
- Cost
- Model and provider
- User identity
- Custom metadata

### Custom Metadata

Tag requests with custom metadata for tracking:

```python
response = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
    extra_headers={
        "X-TFY-LOGGING-CONFIG": '{"project": "my-app", "environment": "production"}'
    },
)
```

### Analytics

View usage analytics in TrueFoundry dashboard:
- Requests/minute per model
- Tokens/minute per model
- Failures/minute per model
- Cost breakdown by model, user, team

### OpenTelemetry Integration

Export traces to your observability stack:
- Prometheus + Grafana
- Datadog
- Custom OTEL collectors

## Guardrails

For content filtering, PII detection, prompt injection prevention, and custom safety rules, use the `guardrails` skill. It configures guardrail providers and rules that apply to this gateway's traffic.

## MCP Gateway Attachment Flow

If a user has already deployed a tool server and wants to attach it to MCP gateway:

1. Verify deployment status and endpoint URL (`deploy` + `applications` skills)
2. Register the endpoint as an MCP server (`mcp-servers` skill)
3. Confirm registration ID/name and share how to reference it in policies

## Framework Integration

The gateway works with popular AI frameworks:

### LangChain

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="openai/gpt-4o",
    api_key="<your-PAT-or-VAT>",
    base_url="https://<your-truefoundry-url>/api/llm",
)
```

### LlamaIndex

```python
from llama_index.llms.openai import OpenAI

llm = OpenAI(
    model="openai/gpt-4o",
    api_key="<your-PAT-or-VAT>",
    api_base="https://<your-truefoundry-url>/api/llm",
)
```

### Cursor / Claude Code / Cline

Configure the gateway as a custom API endpoint in your coding assistant settings:
- Base URL: `{TFY_BASE_URL}/api/llm`
- API Key: Your PAT or VAT

## Presenting Gateway Info

When the user asks about gateway configuration:

```
AI Gateway:
  Endpoint: https://your-org.truefoundry.cloud/api/llm
  Auth:     Personal Access Token (PAT) or Virtual Access Token (VAT)

Available Models (check dashboard for current list):
| Model Name        | Provider     | Type        |
|-------------------|-------------|-------------|
| openai/gpt-4o     | OpenAI      | Cloud       |
| my-gemma-2b       | Self-hosted | vLLM (T4)   |
| anthropic/claude   | Anthropic   | Cloud       |

Usage:
  export OPENAI_BASE_URL="https://your-org.truefoundry.cloud/api/llm"
  export OPENAI_API_KEY="your-token"
  # Then use any OpenAI-compatible SDK
```

</instructions>

<success_criteria>

## Success Criteria

- The user can call LLMs through the gateway endpoint using an OpenAI-compatible SDK or cURL
- The user has a valid authentication token (PAT or VAT) configured for gateway access
- The agent has confirmed the target model name is available in the user's gateway configuration
- The user can verify successful responses from the gateway with correct model output
- The agent has provided working code snippets tailored to the user's language and framework
- Rate limiting, budget controls, or routing are configured if the user requested them

</success_criteria>

<references>

## Composability

- **Deploy model first**: Use `llm-deploy` skill to deploy a self-hosted model, then add to gateway
- **Need API key**: Create PAT/VAT in TrueFoundry dashboard → Access
- **Rate limiting**: Configure in dashboard → AI Gateway → Rate Limiting
- **Routing config**: Use `deploy` skill (declarative apply workflow) to apply routing YAML via GitOps
- **tool servers**: Use `deploy` skill to deploy tool servers (service with tool-proxy), register in gateway
- **Check deployed models**: Use `applications` skill to see running model services
- **Benchmark through gateway**: Use your preferred load-testing tool against gateway endpoints

</references>

<troubleshooting>

## Error Handling

### 401 Unauthorized
```
Gateway authentication failed. Check:
- API key (PAT or VAT) is valid and not expired
- Using correct header: Authorization: Bearer <token>
```

### 403 Forbidden
```
Model access denied. Your token may not have access to this model.
- PATs inherit user permissions
- VATs only have access to explicitly selected models
- Check with your admin to grant model access
```

### 429 Rate Limited
```
Rate limit exceeded. Options:
- Wait and retry (check Retry-After header)
- Request higher limits from admin
- Use load balancing to distribute across providers
```

### 502/503 Provider Error
```
Upstream provider error. The gateway will automatically:
- Retry on configured status codes
- Fallback to alternate models if routing is configured
If persistent, check provider status page or self-hosted model health.
```

### Model Not Found
```
Model name not found in gateway. Check:
- Exact model name in TrueFoundry dashboard → AI Gateway → Models
- Provider account is active and model is enabled
- Your token has access to this model
```

</troubleshooting>

---

<objective>

# Guardrails

Configure content safety guardrails for TrueFoundry AI Gateway. Guardrails add safety controls to LLM inputs/outputs and MCP tool invocations.

## When to Use

Set up guardrail providers, create guardrail rules, or manage content safety policies for AI Gateway endpoints. This includes PII filtering, content moderation, prompt injection detection, secret detection, and custom validation rules.

## Deploying a Custom Guardrails Server

When the user asks to **deploy a guardrails server** or run guardrails as a deployed service, start from the official template so the server adheres to the gateway's input/output formats:

1. **Clone the default repo:** [truefoundry/custom-guardrails-template](https://github.com/truefoundry/custom-guardrails-template)
2. **Build on top of it** — Add or adjust custom rules, providers, or config within the template structure; do not build from scratch.
3. **Deploy** — Use the `deploy` skill to deploy the resulting service (Dockerfile or build from source as in the template).

This keeps guardrail servers compatible with TrueFoundry AI Gateway expectations.

</objective>

<instructions>

## Overview

Guardrails require a two-step setup:

1. **Guardrail Config Group** — Register guardrail provider integrations (credentials and configuration)
2. **Gateway Guardrails Config** — Create rules that reference those providers and attach them to a gateway

## Step 1: Create Guardrail Config Group

A guardrail config group holds integration credentials for one or more guardrail providers. See `references/guardrail-providers.md` for all supported providers.

When using direct API, set `TFY_API_SH` to the full path of this skill's `scripts/tfy-api.sh`. See `references/tfy-api-setup.md` for paths per agent.

### List Existing Config Groups

#### Via Tool Call

```
tfy_guardrail_config_groups_list()
```

#### Via Direct API

```bash
TFY_API_SH=~/.claude/skills/truefoundry-guardrails/scripts/tfy-api.sh

$TFY_API_SH GET '/api/svc/v1/provider-accounts?type=guardrail-config-group'
```

### Create Config Group

#### Via Tool Call

```
tfy_guardrail_config_groups_create(payload={"name": "my-guardrails", "type": "provider-account/guardrail-config-group", "integrations": [...]})
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH POST /api/svc/v1/provider-accounts '{
  "name": "my-guardrails",
  "type": "provider-account/guardrail-config-group",
  "integrations": [
    {
      "type": "integration/guardrail/tfy-pii",
      "config": {}
    },
    {
      "type": "integration/guardrail/tfy-content-moderation",
      "config": {}
    }
  ]
}'
```

Each integration has a `type` (from the providers reference) and a `config` object with provider-specific fields. Some providers (like `tfy-pii`, `tfy-content-moderation`) require no config. Others (like `aws-bedrock`, `azure-content-safety`) need cloud credentials.

> **Security:** Guardrail providers with external `endpoint_url` fields (e.g., `custom`, `opa`, `fiddler`, `palo-alto-prisma-airs`) route request data to third-party services. Verify that all external endpoints are trusted and controlled by your organization before registering them. Prefer TrueFoundry built-in providers (`tfy-pii`, `tfy-content-moderation`, `tfy-prompt-injection`) when possible.

### Presenting Config Groups

```
Guardrail Config Groups:
| Name             | ID       | Integrations |
|------------------|----------|--------------|
| my-guardrails    | pa-abc   | 3            |
| prod-safety      | pa-def   | 5            |
```

## Step 2: Create Gateway Guardrails Config

Gateway guardrails config defines rules that control which guardrails apply to which models, users, and tools.

### Get Existing Guardrails Config

#### Via Tool Call

```
tfy_gateway_guardrails_list()
```

#### Via Direct API

```bash
$TFY_API_SH GET /api/svc/v1/gateway-guardrails-configs
```

### Create Guardrails Config

#### Via Tool Call

```
tfy_gateway_guardrails_create(payload={"name": "production-guardrails", "type": "gateway-guardrails-config", "gateway_ref": "GATEWAY_FQN", "rules": [...]})
```

**Note:** Requires human approval (HITL) via tool call.

#### Via Direct API

```bash
$TFY_API_SH POST /api/svc/v1/gateway-guardrails-configs '{
  "name": "production-guardrails",
  "type": "gateway-guardrails-config",
  "gateway_ref": "GATEWAY_FQN",
  "rules": [
    {
      "id": "pii-filter-all-models",
      "when": {
        "target_conditions": {
          "models": ["*"],
          "mcp_servers": [],
          "tools": []
        },
        "subject_conditions": {
          "users": ["*"],
          "teams": []
        }
      },
      "llm_input_guardrails": [
        {
          "provider_ref": "provider-account-id:integration/guardrail/tfy-pii",
          "operation": "validate",
          "enforcing_strategy": "enforce",
          "priority": 1
        }
      ],
      "llm_output_guardrails": [
        {
          "provider_ref": "provider-account-id:integration/guardrail/tfy-pii",
          "operation": "validate",
          "enforcing_strategy": "enforce",
          "priority": 1
        }
      ],
      "mcp_tool_pre_invoke_guardrails": [],
      "mcp_tool_post_invoke_guardrails": []
    }
  ]
}'
```

### Update Existing Guardrails Config

#### Via Direct API

```bash
$TFY_API_SH PUT /api/svc/v1/gateway-guardrails-configs/GUARDRAILS_CONFIG_ID '{
  "name": "production-guardrails",
  "type": "gateway-guardrails-config",
  "gateway_ref": "GATEWAY_FQN",
  "rules": [...]
}'
```

### Rule Structure

Each rule contains:

- **id** — Unique identifier for the rule
- **when** — Conditions controlling when the rule applies:
  - `target_conditions.models` — Model name patterns (use `["*"]` for all)
  - `target_conditions.mcp_servers` — MCP server names to target
  - `target_conditions.tools` — Specific tool names to target
  - `subject_conditions.users` — User patterns (use `["*"]` for all)
  - `subject_conditions.teams` — Team names
- **llm_input_guardrails** — Applied to LLM request inputs
- **llm_output_guardrails** — Applied to LLM response outputs
- **mcp_tool_pre_invoke_guardrails** — Applied before MCP tool execution
- **mcp_tool_post_invoke_guardrails** — Applied after MCP tool execution

### Guardrail Reference Fields

Each guardrail entry in a rule has:

- **provider_ref** — Format: `<provider-account-id>:integration/guardrail/<provider-type>`
- **operation** — `validate` (check and block) or `mutate` (modify content, e.g., redact PII)
- **enforcing_strategy** — How violations are handled:
  - `enforce` — Block the request on violation
  - `audit` — Log the violation but allow the request
  - `enforce_but_ignore_on_error` — Enforce if guardrail succeeds, allow if guardrail errors
- **priority** — Integer for ordering when multiple mutate guardrails apply (lower runs first)

## Common Patterns

### PII Detection on All Models

```bash
# Step 1: Create config group with tfy-pii
$TFY_API_SH POST /api/svc/v1/provider-accounts '{
  "name": "pii-guardrails",
  "type": "provider-account/guardrail-config-group",
  "integrations": [
    {"type": "integration/guardrail/tfy-pii", "config": {}}
  ]
}'

# Step 2: Create rule targeting all models
# Use the provider account ID from step 1 response in provider_ref
```

### Content Moderation with Audit Mode

Use `"enforcing_strategy": "audit"` to log violations without blocking — useful for monitoring before enforcement.

### MCP Tool Guardrails

Target specific MCP tools with `mcp_tool_pre_invoke_guardrails` to validate inputs before tool execution, or `mcp_tool_post_invoke_guardrails` to scan tool outputs.

### Model-Specific Rules

Use `target_conditions.models` to apply guardrails only to specific models:

```json
"when": {
  "target_conditions": {
    "models": ["openai/gpt-4*", "anthropic/claude-*"],
    "mcp_servers": [],
    "tools": []
  }
}
```

### Exempt Specific Users

Combine broad model targeting with specific user conditions to exempt admin users:

```json
"subject_conditions": {
  "users": ["user1@example.com", "user2@example.com"],
  "teams": ["engineering"]
}
```

## Finding the Gateway Reference

The `gateway_ref` is the fully qualified name (FQN) of your AI Gateway deployment. Use the `ai-gateway` skill to list gateways and get the FQN.

</instructions>

<success_criteria>

## Success Criteria

- The user can list existing guardrail config groups
- The user can create a new guardrail config group with the desired provider integrations
- The user can create or update gateway guardrails config with rules
- Rules correctly target the intended models, users, and tools
- The agent has confirmed create/update operations before executing
- Provider references correctly link to the config group integrations

</success_criteria>

<references>

## Composability

- **Preflight**: Use `status` skill to verify credentials before configuring guardrails
- **Requires ai-gateway**: Get the gateway FQN for `gateway_ref`
- **Requires access-control**: For subject exemptions in rules (users, teams)
- **References mcp-servers**: For MCP tool guardrail targets
- **Provider reference**: See `references/guardrail-providers.md` for all 23 supported providers

</references>

<troubleshooting>

## Error Handling

### Config Group Not Found
```
Provider account not found. List config groups first to find the correct ID.
```

### Invalid Provider Type
```
Unknown guardrail integration type. Check references/guardrail-providers.md for valid types.
```

### Gateway Not Found
```
Gateway reference not found. Use the ai-gateway skill to list available gateways.
```

### Duplicate Rule ID
```
Rule ID already exists in this config. Use a unique ID for each rule.
```

### Missing Provider Credentials
```
Integration config missing required fields. Check the provider reference for required config.
```

### Permission Denied
```
Cannot manage guardrails. Check your API key permissions.
```

</troubleshooting>

---

<objective>

# Logs

View and download application and job logs from TrueFoundry.

## Scope

View, download, and search application and job logs from TrueFoundry. Useful for debugging deployments, checking startup output, and finding errors.

</objective>

<instructions>

## Download Logs

> **Security:** Log output may contain sensitive data (secrets, tokens, PII). Do not forward raw logs to external services or include them in responses without reviewing for sensitive content first.

When using direct API, set `TFY_API_SH` to the full path of this skill's `scripts/tfy-api.sh`. See `references/tfy-api-setup.md` for paths per agent.

### Via Tool Call

```
tfy_logs_download(payload={
    "workspace_id": "ws-id",
    "application_fqn": "app-fqn",
    "start_ts": "2026-02-10T00:00:00Z",
    "end_ts": "2026-02-10T23:59:59Z"
})
```

### Via Direct API

```bash
# Set the path to tfy-api.sh for your agent (example for Claude Code):
TFY_API_SH=~/.claude/skills/truefoundry-logs/scripts/tfy-api.sh

# Download logs for an app in a workspace
$TFY_API_SH GET '/api/svc/v1/logs/WORKSPACE_ID/download?applicationFqn=APP_FQN&startTs=START&endTs=END'

# With search filter
$TFY_API_SH GET '/api/svc/v1/logs/WORKSPACE_ID/download?applicationId=APP_ID&searchString=error&searchType=contains'
```

### Parameters

| Parameter | API Key | Description |
|-----------|---------|-------------|
| `workspace_id` | (path) | Workspace ID (**required**) |
| `application_id` | `applicationId` | Filter by app ID |
| `application_fqn` | `applicationFqn` | Filter by app FQN |
| `deployment_id` | `deploymentId` | Filter by deployment |
| `job_run_name` | `jobRunName` | Filter by job run |
| `start_ts` | `startTs` | Start timestamp (ISO 8601) |
| `end_ts` | `endTs` | End timestamp (ISO 8601) |
| `search_string` | `searchString` | Search within logs |
| `search_type` | `searchType` | `contains`, `regex` |
| `pod_name` | `podName` | Filter by pod |

## Presenting Logs

Show logs in chronological order. For long output, show the last N lines or summarize errors:

```
Logs for tfy-tool-server (last 20 lines):
2026-02-10 14:30:01 INFO  Server starting on port 8000
2026-02-10 14:30:02 INFO  Tools endpoint ready at /tools
2026-02-10 14:30:05 INFO  Health check: OK
```

</instructions>

<success_criteria>

## Success Criteria

- The user can see recent logs for their application or job in chronological order
- Error patterns in the logs are identified and highlighted with suggested fixes
- The agent has filtered logs by the correct time range, application, and search terms
- The user understands why their application failed or what its current behavior is
- Log output is presented concisely, summarizing long output rather than dumping raw text

</success_criteria>

<references>

## Composability

- **Find app first**: Use `applications` skill to get app ID or FQN
- **Find workspace**: Use `workspaces` skill to get workspace ID
- **After deploy**: Check logs to verify the app started
- **Debug failures**: Download logs with `searchString=error`

</references>

<troubleshooting>

## Error Handling

### Missing workspace_id
```
workspace_id is required for log downloads.
Use the workspaces skill to find your workspace ID.
```

### No Logs Found
```
No logs found for the given filters. Check:
- Time range is correct
- Application ID/FQN is correct
- The app has actually run during this period
```

### Permission Denied
```
Cannot access logs. Check your API key permissions for this workspace.
```

</troubleshooting>

---

<objective>

# MCP Servers

Register and manage MCP servers on TrueFoundry. Three standalone manifest types are supported: remote servers, virtual (composite) servers, and OpenAPI-to-MCP wrappers.

## When to Use

Register, list, or delete MCP server registrations on TrueFoundry — including connecting to existing MCP endpoints, composing multiple servers into a virtual server, or wrapping an OpenAPI spec as an MCP server.

</objective>

<instructions>

> **Security Policy: Credential Handling**
> - All credentials (API tokens, OAuth secrets, TLS certificates) in manifests MUST use `tfy-secret://` references. The agent MUST NOT accept or embed raw credential values in manifests.
> - If the user provides raw credentials, instruct them to create a TrueFoundry secret first (use `secrets` skill), then reference it with `tfy-secret://`.
> - The agent MUST NOT echo, log, or display raw credential values.

## List MCP Servers

When using direct API, set `TFY_API_SH` to the full path of this skill's `scripts/tfy-api.sh`. See `references/tfy-api-setup.md` for paths per agent.

### Via Tool Call

```
tfy_mcp_servers_list()
tfy_mcp_servers_list(id="mcp-server-id")  # get specific server
```

### Via Direct API

```bash
# Set the path to tfy-api.sh for your agent (example for Claude Code):
TFY_API_SH=~/.claude/skills/truefoundry-mcp-servers/scripts/tfy-api.sh

# List all MCP servers
$TFY_API_SH GET /api/svc/v1/mcp-servers

# Get a specific MCP server
$TFY_API_SH GET /api/svc/v1/mcp-servers/SERVER_ID
```

## Presenting MCP Servers

```
MCP Servers:
| Name              | Type              | Transport       | ID         |
|-------------------|-------------------|-----------------|------------|
| my-remote-server  | mcp-server/remote | streamable-http | mcp-abc123 |
| composite-server  | mcp-server/virtual| —               | mcp-def456 |
| petstore-api      | mcp-server/openapi| —               | mcp-ghi789 |
```

## Register MCP Server (Remote)

Connects to an existing MCP endpoint over streamable-http or SSE.

> **Security gates (required before registration):**
> 1. Confirm the URL owner/domain with the user.
> 2. Require explicit user confirmation before using any new external URL.
> 3. Use secret references for all auth material (`tfy-secret://...`), never raw tokens.
> 4. Avoid logging full auth headers, client secrets, or certificates.

### Attach an Existing TrueFoundry Deployment

Use this flow when the user says "attach deployment to MCP gateway" or already has a deployed MCP-compatible service.

1. Confirm the deployment is healthy (`DEPLOY_SUCCESS`) and endpoint is reachable
2. Collect endpoint details:
   - URL (public or internal)
   - transport (`streamable-http` or `sse`)
   - auth mode (`header`, `oauth2`, or `passthrough`)
3. Register it as `type: mcp-server/remote`
4. Return server ID and name so users can reference it from guardrails/policies

Example internal URL pattern for service deployments:
`http://{service-name}.{namespace}.svc.cluster.local:{port}/mcp`

### Manifest

```yaml
name: my-remote-server
type: mcp-server/remote
description: Production analytics MCP server
url: https://analytics.example.com/mcp
transport: streamable-http
# SECURITY: Use tfy-secret:// references instead of hardcoding tokens in manifests.
# Hardcoded tokens in YAML files risk exposure via Git history and CI logs.
auth_data:
  type: header
  headers:
    Authorization: "Bearer tfy-secret://my-org:mcp-secrets:api-token"
collaborators:
  - subject: user:jane@example.com
    role_id: admin
tags:
  - analytics
  - production
```

### Auth Options

**Static header (use secret references — never hardcode tokens):**

```yaml
auth_data:
  type: header
  headers:
    Authorization: "Bearer tfy-secret://my-org:mcp-secrets:api-token"
```

**OAuth2:**

```yaml
auth_data:
  type: oauth2
  authorization_url: https://auth.example.com/authorize
  token_url: https://auth.example.com/token
  client_id: my-client-id
  client_secret: tfy-secret://my-org:mcp-secrets:oauth-client-secret
  jwt_source: access_token
  scopes:
    - read
    - write
  pkce: true
  dynamic_client_registration:
    registration_endpoint: https://auth.example.com/register
    initial_access_token: tfy-secret://my-org:mcp-secrets:registration-token
```

**Passthrough (forwards TFY credentials):**

```yaml
auth_data:
  type: passthrough
```

### TLS Settings (optional)

```yaml
tls_settings:
  # Prefer storing certificate material in a secret reference, then injecting at runtime.
  # Avoid inlining full certificate PEM blocks in manifests shared via chat or git.
  ca_cert: tfy-secret://my-org:mcp-secrets:ca-cert-pem
  insecure_skip_verify: false
```

### Via CLI

```bash
tfy apply -f mcp-server-remote.yaml
```

### Via Direct API

```bash
$TFY_API_SH PUT /api/svc/v1/apps "$(cat mcp-server-remote.yaml | yq -o json)"
```

## Register MCP Server (Virtual)

Composes multiple registered MCP servers into a single virtual server. Each sub-server can expose all or a subset of its tools.

### Manifest

```yaml
name: dev-tools
type: mcp-server/virtual
description: Composite server combining code analysis and deployment tools
servers:
  - name: code-analysis-server
    enabled_tools:
      - lint
      - format
      - analyze
  - name: deployment-server
    enabled_tools:
      - deploy
      - rollback
collaborators:
  - subject: team:platform-eng
    role_id: viewer
```

### Via CLI

```bash
tfy apply -f mcp-server-virtual.yaml
```

### Via Direct API

```bash
$TFY_API_SH PUT /api/svc/v1/apps "$(cat mcp-server-virtual.yaml | yq -o json)"
```

## Register MCP Server (OpenAPI)

Wraps an OpenAPI specification as an MCP server. Supports up to 30 tools derived from API operations.

> **Security: Remote OpenAPI specs are fetched at runtime and auto-converted into MCP tools that control agent capabilities. Only use trusted, verified spec URLs. For sensitive environments, prefer `spec.type: inline` to eliminate the runtime dependency on external endpoints.**
>
> **Execution policy:** Do not fetch or register a new remote spec URL until the user explicitly confirms the source is trusted for tool generation.

### Manifest (remote spec URL)

```yaml
name: petstore-api
type: mcp-server/openapi
description: Petstore API exposed as MCP tools
spec:
  type: remote
  url: https://internal-api.example.com/openapi.json
collaborators:
  - subject: user:dev@example.com
    role_id: viewer
```

### Manifest (inline spec)

```yaml
name: internal-api
type: mcp-server/openapi
description: Internal API with inline OpenAPI spec
spec:
  type: inline
  content: |
    openapi: "3.0.0"
    info:
      title: Internal API
      version: "1.0"
    paths:
      /health:
        get:
          operationId: healthCheck
          summary: Check service health
          responses:
            "200":
              description: OK
collaborators: []
```

### Via CLI

```bash
tfy apply -f mcp-server-openapi.yaml
```

### Via Direct API

```bash
$TFY_API_SH PUT /api/svc/v1/apps "$(cat mcp-server-openapi.yaml | yq -o json)"
```

## Delete MCP Server

### Via Tool Call

```
tfy_mcp_servers_delete(id="SERVER_ID")
```

**Note:** Requires human approval (HITL) via tool call.

### Via Direct API

```bash
$TFY_API_SH DELETE /api/svc/v1/mcp-servers/SERVER_ID
```

</instructions>

<success_criteria>

## Success Criteria

- The user can list all registered MCP servers in a formatted table
- The user can register a remote MCP server with the correct transport and auth configuration
- The user can register a virtual MCP server composing multiple sub-servers with tool filtering
- The user can register an OpenAPI-to-MCP server with a remote or inline spec
- The user can delete an MCP server registration
- The agent has confirmed any create/delete operations before executing
- Collaborators are correctly specified when provided

</success_criteria>

<references>

## Composability

- **Preflight**: Use `status` skill to verify credentials before managing MCP servers
- **Before registering**: Deploy the MCP server as a service (use `deploy` skill), set up teams/roles for collaborators (use `access-control` skill)
- **After registering**: Reference MCP servers in agent manifests, configure guardrails for MCP tools

</references>

<troubleshooting>

## Error Handling

### MCP Server Not Found
```
MCP server ID not found. List servers first to find the correct ID.
```

### Permission Denied
```
Cannot access MCP servers. Check your API key permissions.
```

### Server Already Exists
```
MCP server with this name already exists. Use a different name or delete the existing one first.
```

### Unreachable Remote URL
```
Cannot reach the MCP server URL. Verify the URL is correct and accessible from the cluster.
```

### OpenAPI Spec Too Large
```
OpenAPI spec exceeds 30 tools limit. Reduce the number of operations in the spec.
```

### Invalid Transport
```
Invalid transport type. Use "streamable-http" or "sse".
```

### OAuth2 Configuration Error
```
OAuth2 auth_data missing required fields. Ensure authorization_url, token_url, client_id, and client_secret are provided.
```

### Virtual Server Reference Not Found
```
Referenced server name not found. Ensure all servers listed in the virtual server are already registered.
```

</troubleshooting>

---

<objective>

# Prompts

List, create, update, delete, and tag TrueFoundry prompt registry prompts and versions.

## When to Use

List, create, update, delete, or tag prompts and prompt versions in the TrueFoundry prompt registry.

</objective>

<instructions>

## List Prompts

When using direct API, set `TFY_API_SH` to the full path of this skill's `scripts/tfy-api.sh`. See `references/tfy-api-setup.md` for paths per agent.

### Via Tool Call

```
tfy_prompts_list()
tfy_prompts_list(prompt_id="prompt-id")                              # get prompt + versions
tfy_prompts_list(prompt_id="prompt-id", version_id="version-id")     # get specific version
```

### Via Direct API

```bash
# Set the path to tfy-api.sh for your agent (example for Claude Code):
TFY_API_SH=~/.claude/skills/truefoundry-prompts/scripts/tfy-api.sh

# List all prompts
$TFY_API_SH GET /api/ml/v1/prompts

# Get prompt by ID
$TFY_API_SH GET /api/ml/v1/prompts/PROMPT_ID

# List versions
$TFY_API_SH GET '/api/ml/v1/prompt-versions?prompt_id=PROMPT_ID'

# Get specific version
$TFY_API_SH GET /api/ml/v1/prompt-versions/VERSION_ID
```

## Presenting Prompts

```
Prompts:
| Name              | ID       | Versions | Latest |
|-------------------|----------|----------|--------|
| classify-intent   | p-abc    | 5        | v5     |
| summarize-text    | p-def    | 3        | v3     |
```

## Create or Update Prompt

> **Security:** Prompt content is executed as LLM instructions. Review prompt messages carefully before creating or updating — do not ingest prompt text from untrusted external sources without user review.

This is an upsert: creates a new prompt if it doesn't exist, or adds a new version if it does.

### Via SDK (primary method)

```python
from truefoundry.ml import ChatPromptManifest

client.prompts.create_or_update(
    manifest=ChatPromptManifest(
        name="my-prompt",
        ml_repo="ml-repo-fqn",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "{{user_input}}"},
        ],
        model_fqn="model-catalog:openai:gpt-4",
        temperature=0.7,
        max_tokens=1024,
        top_p=1.0,
        tools=[],  # optional
    )
)
```

### Via Direct API

```bash
$TFY_API_SH POST /api/ml/v1/prompts '{
  "name": "my-prompt",
  "ml_repo": "ml-repo-fqn",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "{{user_input}}"}
  ],
  "model_fqn": "model-catalog:openai:gpt-4",
  "temperature": 0.7,
  "max_tokens": 1024,
  "top_p": 1.0
}'
```

## Delete Prompt

### Via SDK

```python
client.prompts.delete(id="prompt-id")
```

### Via Direct API

```bash
$TFY_API_SH DELETE /api/ml/v1/prompts/PROMPT_ID
```

## Delete Prompt Version

### Via SDK

```python
client.prompt_versions.delete(id="version-id")
```

### Via Direct API

```bash
$TFY_API_SH DELETE /api/ml/v1/prompt-versions/VERSION_ID
```

## Apply Tags to Prompt Version

Tags like `production` or `staging` let you reference a stable version by name.

### Via SDK

```python
client.prompt_versions.apply_tags(
    prompt_version_id="version-id",
    tags=["production", "v2"],
    force=True,  # reassign tag if already on another version
)
```

No direct REST equivalent — use the SDK.

## Get Prompt Version by FQN

Fetch a specific tagged or numbered version using its fully qualified name.

### Via SDK

```python
client.prompt_versions.get_by_fqn(fqn="ml-repo:prompt-name:production")
```

</instructions>

<success_criteria>

## Success Criteria

- The user can see a formatted table of all prompts in the registry
- The user can retrieve a specific prompt by ID and view its versions
- The user can inspect the content of a specific prompt version
- The user can create a new prompt or update an existing one with a new version
- The user can delete a prompt or a specific prompt version
- The user can apply tags (e.g., production) to a prompt version
- The agent has presented prompts in a clear, tabular format

</success_criteria>

<references>

## Composability

- **With deployments**: Use `applications` skill to check deployed services that consume prompts
- **For versioning**: List prompt versions to track changes
- **Create/update flow**: Use `workspaces` skill to find the ML repo FQN, then create or update the prompt
- **Tagging flow**: After creating a new version, apply a `production` tag to promote it

</references>

<troubleshooting>

## Error Handling

### Prompt Not Found
```
Prompt ID not found. List prompts first to find the correct ID.
```

### ML Repo Not Found
```
Invalid ml_repo FQN. Use the workspaces skill to list available ML repos.
```

### Tag Already Assigned
```
Tag already exists on another version. Use force=True to reassign it.
```

### Delete Fails — Prompt Has Tagged Versions
```
Cannot delete prompt with tagged versions. Remove tags first, then delete.
```

</troubleshooting>

---

<objective>

# Secrets

Manage TrueFoundry secret groups and secrets. Secret groups organize secrets; individual secrets hold key-value pairs.

## When to Use

List, create, update, or delete secret groups and individual secrets on TrueFoundry, including pre-deploy secret setup and value rotation.

</objective>

<instructions>

> **Security Policy: Credential Handling**
> - The agent MUST NOT accept, store, log, echo, or display raw secret values in any context.
> - Always instruct the user to set secret values as environment variables before running commands.
> - If the user provides a raw secret value directly in conversation, warn them and refuse to use it. Instruct them to set it as an env var instead.
> - When displaying secrets, show only "(set)" or the first 4 characters followed by "***".

## List Secret Groups

When using direct API, set `TFY_API_SH` to the full path of this skill's `scripts/tfy-api.sh`. See `references/tfy-api-setup.md` for paths per agent.

### Via Tool Call

```
tfy_secrets_list()
tfy_secrets_list(secret_group_id="group-id")  # get group + secrets
tfy_secrets_list(secret_id="secret-id")        # get one secret
```

### Via Direct API

```bash
# Set the path to tfy-api.sh for your agent (example for Claude Code):
TFY_API_SH=~/.claude/skills/truefoundry-secrets/scripts/tfy-api.sh

# List all secret groups
$TFY_API_SH GET /api/svc/v1/secret-groups

# Get a specific group
$TFY_API_SH GET /api/svc/v1/secret-groups/GROUP_ID

# List secrets in a group
$TFY_API_SH POST /api/svc/v1/secrets '{"secretGroupId":"GROUP_ID","limit":100,"offset":0}'

# Get a specific secret
$TFY_API_SH GET /api/svc/v1/secrets/SECRET_ID
```

## Presenting Secrets

```
Secret Groups:
| Name          | ID       | Secrets |
|---------------|----------|---------|
| prod-secrets  | sg-abc   | 5       |
| dev-secrets   | sg-def   | 3       |
```

**Security:** Never display secret values in full. Show only the first few characters or indicate "(set)". The agent must NEVER log, echo, or output raw secret values in any context.

## Create Secret Group

> **Security: Credential Handling**
> - The agent must NEVER accept, echo, or transmit raw secret values inline.
> - Never ask the user to paste secret values in chat.
> - Always instruct the user to store secret values in environment variables first, then reference those variables.
> - If the user provides a raw secret value directly, warn them and suggest using an env var instead.

### Via Tool Call

```
# Prompt user to set secret values as environment variables first
tfy_secret_groups_create(payload={"name": "my-secrets", ...})
```

**Note:** Requires human approval (HITL) via tool call.

### Via Direct API

```bash
# SECURITY: Never hardcode secret values in commands — they will appear in shell
# history and process listings. Read from environment variables or files instead.
# User must set: export DB_PASSWORD="..." before running this command.
payload=$(jq -n \
  --arg name "my-secrets" \
  --arg integration "INTEGRATION_ID" \
  --arg db_password "$DB_PASSWORD" \
  '{
    name: $name,
    integrationId: $integration,
    secrets: [{key: "DB_PASSWORD", value: $db_password}]
  }')
$TFY_API_SH POST /api/svc/v1/secret-groups "$payload"
```

## Update Secret Group

Updates secrets in a group. A new version is created for every secret with a modified value. Secrets omitted from the array are deleted. At least one secret is required.

### Via Tool Call

```
# Instruct user to set env vars with new values, then reference them.
# The agent must NEVER accept raw secret values — always use indirection.
tfy_secret_groups_update(
  id="GROUP_ID",
  payload={"secrets": [{"key": "DB_PASSWORD", "value": "<secure-input-from-env>"}, {"key": "API_KEY", "value": "<secure-input-from-env>"}]}
)
```

**Note:** Requires human approval (HITL) via tool call.

### Via Direct API

```bash
# SECURITY: Read secret values from environment variables, not inline.
payload=$(jq -n \
  --arg db_password "$DB_PASSWORD" \
  --arg api_key "$NEW_API_KEY" \
  '{
    secrets: [
      {key: "DB_PASSWORD", value: $db_password},
      {key: "API_KEY", value: $api_key}
    ]
  }')
$TFY_API_SH PUT /api/svc/v1/secret-groups/GROUP_ID "$payload"
```

## Delete Secret Group

### Via Tool Call

```
tfy_secret_groups_delete(id="GROUP_ID")
```

**Note:** Requires human approval (HITL) via tool call.

### Via Direct API

```bash
$TFY_API_SH DELETE /api/svc/v1/secret-groups/GROUP_ID
```

## Finding the Integration ID

Before creating a secret group, you need the secret store integration ID for the workspace's cloud provider:

### Via Direct API

```bash
# List all secret store provider accounts and their integrations
bash $TFY_API_SH GET '/api/svc/v1/provider-accounts?type=secret-store'
```

From the response, look for integrations with `type: "secret-store"`. Each provider account contains an `integrations` array -- pick the integration matching the workspace's cloud provider:
- AWS: `integration/secret-store/aws/secrets-manager` or `integration/secret-store/aws/parameter-store`
- Azure: `integration/secret-store/azure/vault`
- GCP: `integration/secret-store/gcp/secret-manager`

Use the `id` field of the matching integration as the `integrationId` when creating secret groups.

## Using Secrets in Deployments

After creating a secret group, reference individual secrets in deployment manifests using the `tfy-secret://` format:

```
tfy-secret://<TENANT_NAME>:<SECRET_GROUP_NAME>:<SECRET_KEY>
```

- `TENANT_NAME`: The subdomain of `TFY_BASE_URL` (e.g., `my-org` from `https://my-org.truefoundry.cloud`)
- `SECRET_GROUP_NAME`: The name you gave the secret group when creating it
- `SECRET_KEY`: The key of the individual secret within the group

### Example: Manifest with Secret References

Given a secret group named `my-app-secrets` with keys `DB_PASSWORD` and `API_KEY`:

```yaml
name: my-app
type: service
image:
  type: image
  image_uri: docker.io/myorg/my-app:latest
ports:
  - port: 8000
    expose: false
    app_protocol: http
resources:
  cpu_request: 0.5
  cpu_limit: 1
  memory_request: 512
  memory_limit: 1024
  ephemeral_storage_request: 1000
  ephemeral_storage_limit: 2000
env:
  LOG_LEVEL: info
  DB_PASSWORD: tfy-secret://my-org:my-app-secrets:DB_PASSWORD
  API_KEY: tfy-secret://my-org:my-app-secrets:API_KEY
workspace_fqn: cluster-id:workspace-name
```

### Workflow: Secrets Before Deploy

1. Identify sensitive env vars (passwords, tokens, keys, credentials)
2. Find the secret store integration ID (see above)
3. Create a secret group with all sensitive values
4. Reference secrets in the manifest `env` using `tfy-secret://` format
5. Deploy with `tfy apply -f manifest.yaml`

## Delete Individual Secret

### Via Tool Call

```
tfy_secrets_delete(id="SECRET_ID")
```

**Note:** Requires human approval (HITL) via tool call.

### Via Direct API

```bash
$TFY_API_SH DELETE /api/svc/v1/secrets/SECRET_ID
```

</instructions>

<success_criteria>

## Success Criteria

- The user can list all secret groups and see their contents in a formatted table
- The user can create a new secret group with a specified name
- The user can update secrets in a group (rotate values, add/remove keys)
- The user can delete a secret group or an individual secret
- The agent has never displayed full secret values — only masked or "(set)" indicators
- The user can inspect individual secrets within a group by ID
- The agent has confirmed any create/update/delete operations before executing

</success_criteria>

<references>

## Composability

- **Before deploy**: Create secret groups, then reference in deployment config
- **After listing**: Get individual secrets by ID for inspection
- **With applications**: Reference secret groups in application env vars

</references>

<troubleshooting>

## Error Handling

### Secret Group Not Found
```
Secret group ID not found. List groups first to find the correct ID.
```

### Permission Denied
```
Cannot access secrets. Check your API key permissions.
```

### Secret Already Exists
```
Secret group with this name already exists. Use a different name.
```

### At Least One Secret Required
```
Cannot update secret group with zero secrets. Include at least one secret in the payload.
```

### No Secret Store Configured
```
No secret store configured for this workspace. Contact your platform admin.
```

### Key Name Restrictions (Azure Key Vault)
```
Key name does not support underscores (_)
```
Azure Key Vault does not allow underscores in secret key names. Use hyphens (`DB-PASSWORD`) or choose a different secret store integration (AWS Secrets Manager supports underscores).

### Azure Key Vault: Secret Stuck in Soft-Delete State
```
Error: Secret <name> is already in a deleted state / conflict with soft-deleted resource
```
Azure Key Vault has a default 90-day soft-delete retention. The TrueFoundry API cannot purge soft-deleted secrets — only the Azure portal or CLI can.

**Recovery options:**
1. **Purge via Azure Portal:** Go to Key Vault → Manage deleted secrets → Purge
2. **Purge via Azure CLI:** `az keyvault secret purge --vault-name <vault> --name <secret-name>`
3. **Use a different name:** Create a new secret group with a different name (fastest workaround)

> **Note:** If the platform's Key Vault has soft-delete protection but not purge protection, options 1/2 work. If purge protection is also enabled, you must wait out the retention period (up to 90 days).

### Missing Required Fields
```
Unprocessable entity. Ensure all secrets have both "key" and "value" fields.
```

</troubleshooting>

---
