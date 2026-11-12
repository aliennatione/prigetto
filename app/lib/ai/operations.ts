export type AiOperation = { type: 'addEvent'; payload: unknown } | { type: 'updateEvent'; id: string; payload: unknown };

export function parseOperations(raw: string): AiOperation[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
