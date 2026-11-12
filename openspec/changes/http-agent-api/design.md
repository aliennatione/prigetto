# Design: http-agent-api

## Approach
Next.js App Router route handlers in `app/api/genogram/*`. Reuse `generateGenogramProject` and `validateProject` from `app/lib/genogram`. Auth via env `GENOGRAM_API_TOKEN`. Return JSON with same structured output as MCP tools.

## Files
- app/api/genogram/generate/route.ts
- app/api/genogram/validate/route.ts
