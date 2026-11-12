export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }

export async function sendChat(baseUrl: string, apiKey: string, model: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}
