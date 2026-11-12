'use client';

import { useEffect, useMemo, useState } from 'react';
import { generateGenogramProject, type GenogramGenerationSpec } from '../lib/genogram/generation-spec';
import { useGenogramStore } from '../lib/genogram/store';

type ProviderPreset = {
  id: string;
  label: string;
  baseUrl: string;
};

const presets: ProviderPreset[] = [
  { id: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  { id: 'groq', label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' },
  { id: 'together', label: 'Together', baseUrl: 'https://api.together.xyz/v1' },
  { id: 'ollama', label: 'Ollama (locale)', baseUrl: 'http://localhost:11434/v1' },
  { id: 'opencodego', label: 'OpenCodeGo', baseUrl: 'https://opencodego.ai/v1' },
  { id: 'custom', label: 'Custom', baseUrl: '' },
];

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

const systemPrompt = `Sei un assistente terapeutico empatico per la costruzione di un genogramma.
Fai una domanda alla volta, in italiano, per raccogliere informazioni su persone, relazioni familiari, eventi importanti.
Quando hai abbastanza informazioni, produci un blocco JSON fenced con uno spec GenogramGenerationSpec valido:
{
  "name": "Titolo progetto",
  "people": [{"key":"alex","name":"Alex","gender":"male","birthYear":1988}],
  "families": [{"parents":["alex","jordan"],"children":["sam"],"partnerRelationship":"marriage"}],
  "relationships": [{"type":"close","source":"alex","target":"jordan"}],
  "annotations": [{"kind":"note","text":"...","linkedTo":["alex"]}]
}
Non includere altro testo dopo il JSON. Se non hai abbastanza dati, continua a conversare.`;

export default function AiTherapistPanel() {
  const replaceProject = useGenogramStore((s) => s.replaceProject);
  const [open, setOpen] = useState(false);
  const [presetId, setPresetId] = useState('openai');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [models, setModels] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: 'Ciao, raccontami la famiglia che vuoi mappare.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ai-therapist-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPresetId(parsed.presetId ?? 'openai');
        setBaseUrl(parsed.baseUrl ?? 'https://api.openai.com/v1');
        setApiKey(parsed.apiKey ?? '');
        setModel(parsed.model ?? 'gpt-4o-mini');
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-therapist-settings', JSON.stringify({ presetId, baseUrl, apiKey, model }));
  }, [presetId, baseUrl, apiKey, model]);

  useEffect(() => {
    let cancelled = false;
    async function loadModels() {
      try {
        const res = await fetch(baseUrl.replace(/\/$/, '') + '/models', {
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        const list = (data?.data ?? data?.models ?? []).map((m: any) => m.id ?? m.name).filter(Boolean);
        if (!cancelled && list.length) {
          setModels(list);
          if (!list.includes(model)) setModel(list[0]);
        }
      } catch {}
    }
    loadModels();
    return () => { cancelled = true; };
  }, [baseUrl, apiKey]);

  const endpoint = useMemo(() => baseUrl.replace(/\/$/, '') + '/chat/completions', [baseUrl]);

  function onPresetChange(id: string) {
    setPresetId(id);
    const p = presets.find((x) => x.id === id);
    if (p && p.baseUrl) setBaseUrl(p.baseUrl);
  }

  async function testConnection() {
    setTesting(true);
    setStatus('');
    try {
      const res = await fetch(baseUrl.replace(/\/$/, '') + '/models', {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('Connessione OK.');
    } catch (e) {
      setStatus(`Errore connessione: ${e instanceof Error ? e.message : String(e)} (possibile CORS)`);
    } finally {
      setTesting(false);
    }
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...nextMessages.map((m) => ({ role: m.role, content: m.content }))],
          temperature: 0.4,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content ?? '';
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonText = match ? match[1] : content;
      let applied = false;
      try {
        const spec = JSON.parse(jsonText) as GenogramGenerationSpec;
        const { project } = generateGenogramProject(spec);
        if (useGenogramStore.getState().project.people.length > 1 && !window.confirm('Sostituire il progetto corrente con i dati raccolti?')) return;
        replaceProject(project);
        applied = true;
      } catch {}
      setMessages((prev) => [...prev, { role: 'assistant', content: applied ? 'Ho aggiornato il genogramma con le informazioni raccolte.' : content }]);
      if (applied) setStatus('Genogramma aggiornato.');
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Errore: ${e instanceof Error ? e.message : String(e)}` }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000, padding: '10px 14px', borderRadius: 999, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
      >
        Assistente AI
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, width: 360, height: 520, zIndex: 1000, background: '#fff', border: '1px solid #ddd', borderRadius: 12, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}>
      <div style={{ padding: 10, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Assistente terapeutico AI</strong>
        <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ padding: 10, borderBottom: '1px solid #eee', display: 'grid', gap: 6 }}>
        <select value={presetId} onChange={(e) => onPresetChange(e.target.value)}>
          {presets.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="Base URL" />
        <input list="model-list" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Modello" />
        <datalist id="model-list">
          {(models.length ? models : []).map((m) => <option key={m} value={m} />)}
        </datalist>
        <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API key (opzionale)" type="password" />
        <button onClick={testConnection} disabled={testing}>{testing ? 'Test...' : 'Test connessione'}</button>
        <button onClick={async () => {
          setConnectionStatus('Test in corso...');
          try {
            const res = await fetch(baseUrl.replace(/\/$/, '') + '/models', { headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {} });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const count = (data?.data ?? data?.models ?? []).length;
            setConnectionStatus(`OK: ${count} modelli disponibili`);
          } catch (e) {
            setConnectionStatus(`Errore: ${e instanceof Error ? e.message : String(e)} (possibile CORS)`);
          }
        }}>Test connessione</button>
        {connectionStatus && <div style={{ fontSize: 12, color: connectionStatus.startsWith('OK') ? 'green' : 'red' }}>{connectionStatus}</div>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#dbeafe' : '#f3f4f6', padding: 8, borderRadius: 8, maxWidth: '90%', whiteSpace: 'pre-wrap' }}>
            {m.content}
          </div>
        ))}
        {loading && <div>…</div>}
      </div>
      {status && <div style={{ padding: '4px 10px', color: 'green', fontSize: 12 }}>{status}</div>}
      <div style={{ padding: 10, borderTop: '1px solid #eee', display: 'flex', gap: 6 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} placeholder="Scrivi..." style={{ flex: 1 }} />
        <button onClick={send} disabled={loading}>Invia</button>
      </div>
    </div>
  );
}
