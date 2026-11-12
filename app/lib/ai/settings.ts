export interface LlmSettings { baseUrl: string; apiKey: string; model: string; }
const KEY = 'genogram-llm-settings';
export function loadSettings(): LlmSettings { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return { baseUrl: '', apiKey: '', model: '' }; } }
export function saveSettings(s: LlmSettings) { localStorage.setItem(KEY, JSON.stringify(s)); }
