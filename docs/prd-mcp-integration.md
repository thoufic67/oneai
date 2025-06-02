# PRD: User-Specified MCP Server Integration & LLM Tool Calling

## Overview

This document details the requirements and technical plan for enabling users to register their own MCP (Multi-Call Plugin) servers and allowing LLM models (via OpenRouter) to call these tools during chat on the Aiflo platform.

- **Chat streaming endpoint:** `app/api/chat/stream/route.ts` (integration point)
- **LLM API:** OpenRouter (function/tool calling)
- **Scope:** Only user-created MCP servers are supported. Tool logs are visible to users. Always use the latest version of each tool.

---

## 1. Goals & Objectives

- Users can add/manage their own MCP server endpoints.
- LLMs can discover and call user-specified MCP tools during chat.
- Secure, auditable, and reliable tool invocation.
- UI for MCP server management, tool status, and tool call logs.
- Support for synchronous and asynchronous tool calls.

---

## 2. User Stories

- As a user, I can add, edit, and remove MCP server endpoints in my account settings.
- As a user, I can see a list of available tools from my MCP server(s).
- As a user, I can enable/disable specific tools for LLM use.
- As a user, I can see logs/history of tool calls in my account.
- As a user, I can see tool call activity inline in chat.

---

## 3. Functional Requirements

### 3.1 MCP Server Management

- Users can add MCP server endpoints (URL, auth, description, etc.).
- Validate MCP server on add (ping, fetch tool manifest/schema).
- Store MCP server config securely (per user).
- Allow edit/delete of MCP servers.

### 3.2 Tool Discovery & Registration

- On MCP server add/update, fetch and cache tool manifest (OpenAPI or custom schema).
- List available tools per user in UI and API.
- Allow user to enable/disable specific tools.
- Always use the latest version of each tool (no version selection UI).

### 3.3 LLM Tool Calling (Chat Integration)

- During chat, LLM can see user's enabled MCP tools as available functions.
- When LLM calls a tool, platform acts as proxy: validates, forwards request to MCP server, returns result to LLM/chat.
- Support both sync (immediate result) and async (polling/callback) tool calls.
- Log all tool calls (inputs, outputs, errors, timestamps).
- Tool call logs are visible to users (UI/API).

### 3.4 Security & Permissions

- Store MCP server credentials securely (encrypted at rest).
- Only allow LLM to call tools for the current user.
- Rate limit tool calls per user/server.
- Audit log of all tool invocations.

### 3.5 UI/UX

- **Settings Page:**
  - Add/Edit/Delete MCP server
  - List tools, enable/disable toggle
  - Show server/tool status (online/offline, last checked)
- **Chat UI:**
  - Indicate when a tool is called (loading, result, error)
  - Show tool call logs/history (inline and in user account)

---

## 4. Non-Functional Requirements

- **Performance:** Tool calls should not block chat UI; use async where possible.
- **Reliability:** Handle MCP server downtime gracefully.
- **Security:** No leakage of user secrets; strict auth checks.
- **Scalability:** Support many users, each with multiple MCP servers.

---

## 5. Technical Design & Integration Plan

### 5.1 Database Changes

- `mcp_servers` table:
  - id, user_id, name, endpoint_url, auth_type, auth_data (encrypted), status, last_checked, created_at, updated_at
- `mcp_tools` table:
  - id, mcp_server_id, tool_id, name, description, enabled, manifest_json, last_synced
- `mcp_tool_calls` table:
  - id, user_id, mcp_tool_id, conversation_id, message_id, input_json, output_json, status, error, created_at

### 5.2 API Endpoints

- `/api/user/mcp-servers` (CRUD for MCP servers)
- `/api/user/mcp-servers/[id]/tools` (list, enable/disable tools)
- `/api/chat/tool-call` (LLM triggers tool call; backend proxies to MCP server)
- `/api/user/mcp-tool-calls` (list tool call logs/history)

### 5.3 Backend Logic

- **MCP Server Management:**
  - On add/edit, validate endpoint, fetch manifest, store tools.
- **Tool Call Proxy:**
  - When LLM requests tool call, validate user/tool, forward request, handle response/errors, log call.
- **LLM Integration:**
  - When building LLM context, inject user's enabled tools as available functions (OpenAI function-calling schema).
- **Security:**
  - Use per-user encryption for auth data; never expose secrets to LLM or frontend.

### 5.4 Frontend Changes

- **Settings UI:**
  - Add/Edit/Delete MCP server form (with validation)
  - List tools, enable/disable toggle, status indicators
- **Chat UI:**
  - Show tool call activity inline in chat (loading, result, error)
  - Allow user to view tool call logs

### 5.5 LLM Model Integration (OpenRouter)

- Update `app/api/chat/stream/route.ts`:
  - Before each chat session, fetch user's enabled tools and pass as function definitions to OpenRouter.
  - When OpenRouter calls a tool, route via `/api/chat/tool-call` (proxy to MCP server, return result to LLM/chat stream).
  - Log all tool calls in `mcp_tool_calls`.

### 5.6 Testing

- Unit tests for MCP server CRUD, tool manifest parsing, tool call proxying.
- Integration tests: Add MCP server, call tool via chat, error handling, security checks.
- UI tests: Add/edit/delete server, enable/disable tool, chat tool call flow, tool call logs.

---

## 6. Rollout Plan

1. **Phase 1:** Backend DB tables, API for MCP server CRUD, tool manifest sync.
2. **Phase 2:** Tool call proxy endpoint, logging, security. Frontend: tool enable/disable, tool status, basic chat integration.
3. **Phase 3:** LLM integration: pass tools to LLM, handle tool calls in chat. UI: tool call activity in chat, tool call logs.
4. **Phase 4:** Advanced: async tool calls, admin monitoring, rate limiting, audit logs.

---

## 7. Risks & Mitigations

- **Security:** Encrypt all secrets, strict access control, audit logs.
- **Reliability:** Graceful error handling, retries, user notifications.
- **LLM Prompt Injection:** Sanitize tool schemas, validate tool call inputs/outputs.

---

## 8. Documentation

- Update README and user docs: How to add MCP servers, enable tools, use in chat.
- API docs: Endpoints, request/response formats, error codes.

---

## 9. Open Questions (Resolved)

- Only user-created MCP servers are supported (no global/shared servers).
- Tool call logs are visible to users.
- Always use the latest version of each tool (no version selection).

---

## 10. Integration Point Reference

- **Chat streaming endpoint:** `app/api/chat/stream/route.ts` is where tool calling logic must be integrated. This is responsible for:

  - Fetching user's enabled MCP tools before chat session.
  - Passing tool schemas to OpenRouter as function definitions.
  - Handling tool call requests from OpenRouter (via `/api/chat/tool-call`).
  - Streaming tool call results/errors back to the chat UI.

- **OpenRouter APIs:** Used for LLM chat and function/tool calling. Ensure all tool schemas are compatible with OpenRouter's function-calling format.

---

**This PRD provides a comprehensive plan for secure, extensible, and user-friendly MCP tool integration with LLM chat on the Aiflo platform.**
