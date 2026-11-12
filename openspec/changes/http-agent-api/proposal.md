# Proposal: http-agent-api

## Goal
Expose HTTP endpoints allowing an AI agent to generate and validate genogram projects, reusing the existing generation spec and validation logic.

## Scope
- POST /api/genogram/generate
- POST /api/genogram/validate
- Token-based auth via `Authorization: Bearer <token>` or `x-api-key`
- No server-side persistence in v1 (returns importable project JSON)

## Out of scope
- Saving projects server-side
- Replacing MCP stdio
