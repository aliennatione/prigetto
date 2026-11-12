# Proposal: http-agent-api-complete

## Goal
Rendere l'API HTTP completa per permettere a un agente AI di impostare tutto ciò che si imposta dalla GUI web (CRUD persone, famiglie, relazioni, eventi, luoghi, timeline, impostazioni), con autenticazione via GENOGRAM_API_TOKEN.

## Approach
Endpoint stateless: l'agente invia un project (o spec) e riceve il project validato/aggiornato. Nessuna persistenza server-side in v1. Riuso della logica di model/store dove possibile.
