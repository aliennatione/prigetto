'use client';
import { useState } from 'react';
import { loadSettings, saveSettings } from '../lib/ai/settings';
import { sendChat } from '../lib/ai/chat-client';

export default function SettingsPage() {
  const [s, setS] = useState(loadSettings());
  const [testResult, setTestResult] = useState('');
  return (
    <main style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h1>Impostazioni LLM</h1>
      <input placeholder="Base URL" value={s.baseUrl} onChange={(e) => setS({ ...s, baseUrl: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
      <input placeholder="API Key" value={s.apiKey} onChange={(e) => setS({ ...s, apiKey: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
      <input placeholder="Model" value={s.model} onChange={(e) => setS({ ...s, model: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
      <button onClick={() => saveSettings(s)}>Salva</button>
      <button onClick={async () => { try { const r = await sendChat(s.baseUrl, s.apiKey, s.model, [{ role: 'user', content: 'ping' }]); setTestResult(r || 'OK'); } catch (e: unknown) { setTestResult(e instanceof Error ? e.message : String(e)); } }}>Test connessione</button>
      <p>{testResult}</p>
    </main>
  );
}
