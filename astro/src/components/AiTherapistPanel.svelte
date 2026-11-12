<script lang="ts">
  import { onMount } from 'svelte';
  import { createId } from '../lib/genogram/model';
  import { generateGenogramProject } from '../lib/genogram/generation-spec';
  import type { Project, Person, TimelineEvent } from '../lib/genogram/model';

  export let project: Project;
  export let onApply: (p: Project) => void = () => {};

  type ChatMessage = { role: 'user'|'assistant'|'system'; content: string };
  let input = '';
  let loading = false;
  let errorMsg = '';
  let testMsg = '';
  let testing = false;
  let models: string[] = [];
  let loadingModels = false;
  let open = true;
  let configOpen = true;

  let settings = {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o-mini',
    provider: 'openai',
    corsProxy: '',
  };
  const presets: Record<string,{name:string;baseUrl:string;needsKey:boolean}> = {
    openai: {name:'OpenAI', baseUrl:'https://api.openai.com/v1', needsKey:true},
    groq: {name:'Groq', baseUrl:'https://api.groq.com/openai/v1', needsKey:true},
    together: {name:'Together', baseUrl:'https://api.together.xyz/v1', needsKey:true},
    ollama: {name:'Ollama locale', baseUrl:'http://localhost:11434/v1', needsKey:false},
    opencodego: {name:'OpenCodeGo', baseUrl:'', needsKey:true},
    custom: {name:'Custom', baseUrl:'', needsKey:true},
  };

  let messages: ChatMessage[] = [
    { role: 'assistant', content: 'Ciao, sono qui per aiutarti a raccogliere la storia familiare. Dimmi chi fa parte della tua famiglia e quali eventi importanti ci sono stati.' }
  ];

  onMount(() => {
    try {
      const raw = localStorage.getItem('prigetto_ai_settings');
      if (raw) settings = { ...settings, ...JSON.parse(raw) };
      const rawM = localStorage.getItem('prigetto_ai_models');
      if (rawM) models = JSON.parse(rawM);
    } catch {}
  });
  function saveSettings(){ try{ localStorage.setItem('prigetto_ai_settings', JSON.stringify(settings)); }catch{} }
  function normBase(u:string){ return u.replace(/\/$/,''); }
  function apiUrl(path:string){
    const url = normBase(settings.baseUrl) + path;
    const proxy = (settings.corsProxy||'').trim();
    if(!proxy) return url;
    if(proxy.includes('{url}')) return proxy.replace('{url}', encodeURIComponent(url));
    return proxy.replace(/\/$/,'') + (proxy.includes('?') ? '' : '/') + encodeURIComponent(url);
  }

  async function fetchModels(){
    if(!settings.baseUrl) return;
    loadingModels = true;
    try{
      const res = await fetch(apiUrl('/models'), {
        headers: settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {}
      });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      models = arr.map((m:any)=>m?.id).filter(Boolean);
      localStorage.setItem('prigetto_ai_models', JSON.stringify(models));
    }catch(e:any){ /* fallback silent */ }
    loadingModels = false;
  }

  async function testConnection(){
    testMsg=''; errorMsg=''; testing=true;
    try{
      const res = await fetch(apiUrl('/models'), {
        headers: settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {}
      });
      if(!res.ok){ testMsg = `Errore connessione: HTTP ${res.status}. Verifica URL/API key.`; }
      else { testMsg = 'Connessione OK.'; await fetchModels(); }
    }catch(e:any){
      const msg = e?.message||String(e);
      const isCors = /Failed to fetch|NetworkError|Load failed|CORS/i.test(msg) || e?.name === 'TypeError';
      testMsg = isCors
        ? `CORS/rete: il browser blocca la richiesta (anche con endpoint pubblici come https://api.opencode.ai/v1 se il server non invia Access-Control-Allow-Origin per questa origine). Imposta "Proxy CORS" (es. https://corsproxy.io/?url={url}) o usa un endpoint/proxy con CORS abilitato. Dettaglio: ${msg}`
        : `Connessione fallita: ${msg}.`;
    }
    testing=false;
  }

  function extractSpec(text:string): any | null {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = m ? m[1] : text;
    const i = candidate.indexOf('{');
    const j = candidate.lastIndexOf('}');
    if(i===-1||j===-1) return null;
    try { return JSON.parse(candidate.slice(i,j+1)); } catch { return null; }
  }

  function mergeGenerated(current: Project, incoming: Project): Project {
    const byName = new Map(current.people.map(p=>[p.name.trim().toLowerCase(), p]));
    const idMap = new Map<string,string>();
    const people = [...current.people.map(p=>structuredClone(p))];
    for(const p of incoming.people){
      const key = p.name.trim().toLowerCase();
      const existing = byName.get(key);
      if(existing){
        idMap.set(p.id, existing.id);
        existing.birthYear = existing.birthYear ?? p.birthYear;
        existing.deathYear = existing.deathYear ?? p.deathYear;
        existing.deceased = existing.deceased || p.deceased;
        existing.gender = existing.gender || p.gender;
        const evs = existing.timelineEvents ?? [];
        const seen = new Set(evs.map(e=>`${e.date}|${e.title}`));
        for(const ev of (p.timelineEvents||[])){
          const k = `${ev.date}|${ev.title}`;
          if(!seen.has(k)){ evs.push({ ...ev, id: createId('event') }); seen.add(k); }
        }
        existing.timelineEvents = evs;
      } else {
        const np = structuredClone(p);
        np.id = createId('person');
        idMap.set(p.id, np.id);
        people.push(np);
        byName.set(key,np);
      }
    }
    const rels = [...current.relationships.map(r=>structuredClone(r))];
    const relKey = (r:any)=>`${r.type}|${r.source}|${r.target}`;
    const seenR = new Set(rels.map(relKey));
    for(const r of incoming.relationships){
      const nr = structuredClone(r);
      nr.source = idMap.get(r.source) || r.source;
      nr.target = idMap.get(r.target) || r.target;
      nr.id = createId('rel');
      const k = relKey(nr);
      if(!seenR.has(k)){ rels.push(nr); seenR.add(k); }
    }
    return { ...current, people, relationships: rels, places: current.places ?? [], updatedAt: new Date().toISOString() };
  }

  async function send(){
    const text = input.trim();
    if(!text || loading) return;
    errorMsg=''; testMsg='';
    messages = [...messages, {role:'user', content:text}];
    input=''; loading=true;
    const system = `Sei un assistente terapeutico per la raccolta di informazioni familiari (genogramma).
Fai domande empatiche e chiare. Quando hai informazioni sufficienti o l'utente chiede di aggiornare il genogramma, includi nella risposta un blocco JSON con una spec compatibile:
{"name":"...","people":[{"key":"p1","name":"...","gender":"male|female|...","birthYear":1980,"deathYear":null,"deceased":false,"notes":"","timelineEvents":[{"date":"2000","title":"Evento","description":"","linkedPersonIds":[]}]}],"relationships":[{"type":"biological-parent","source":"p1","target":"p2"}]}
Aggiorna/aggiungi solo ciò che emerge dalla conversazione.`;
    try{
      const res = await fetch(apiUrl('/chat/completions'), {
        method:'POST',
        headers: {
          'Content-Type':'application/json',
          ...(settings.apiKey ? {Authorization:`Bearer ${settings.apiKey}`} : {})
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [{role:'system', content: system}, ...messages.filter(m=>m.role!=='system').map(m=>({role:m.role, content:m.content}))]
        })
      });
      if(!res.ok){
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t.slice(0,200)}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '(nessuna risposta)';
      messages = [...messages, {role:'assistant', content}];
      const spec = extractSpec(content);
      if(spec && typeof spec === 'object'){
        try{
          const incoming = generateGenogramProject(spec as any);
          const merged = mergeGenerated(project, incoming.project ?? incoming);
          onApply(merged);
          messages = [...messages, {role:'assistant', content:'✅ Dati integrati nel genogramma (merge incrementale).'}];
        }catch(e:any){ /* spec non valida o merge fallito: ignora silenziosamente */ }
      }
    }catch(e:any){
      const msg = e?.message || String(e);
      const isCors = /Failed to fetch|NetworkError|Load failed|CORS/i.test(msg) || e?.name === 'TypeError';
      errorMsg = isCors
        ? `Errore di rete/CORS: il browser non riesce a contattare l'endpoint. Se l'app è su GitHub Pages o altro dominio, il server LLM deve inviare header CORS (Access-Control-Allow-Origin) oppure usa un endpoint raggiungibile dal browser/proxy. Dettaglio: ${msg}`
        : `${msg} — se usi GitHub Pages, verifica CORS/raggiungibilità dell'endpoint.`;
      messages = [...messages, {role:'assistant', content:'Non sono riuscito a contattare il modello. Controlla impostazioni, CORS e connessione.'}];
    }
    loading=false;
  }
</script>

<div class="panel">
  <button class="toggle" on:click={() => open = !open}>{open ? 'Chiudi' : 'Apri'} Assistente AI</button>
  {#if open}
    <div class="box">
      <div class="cfg">
        <button on:click={() => configOpen = !configOpen}>⚙ Configurazione {configOpen ? '▾':'▸'}</button>
        {#if configOpen}
          <label>Preset
            <select bind:value={settings.provider} on:change={() => { const p=presets[settings.provider]; if(p?.baseUrl) settings.baseUrl=p.baseUrl; saveSettings(); }}>
              {#each Object.entries(presets) as [k,v]}<option value={k}>{v.name}</option>{/each}
            </select>
          </label>
          <label>Base URL <input bind:value={settings.baseUrl} on:change={saveSettings} placeholder="https://.../v1" /></label>
          <label>API Key <input bind:value={settings.apiKey} on:change={saveSettings} type="password" placeholder="sk-..." /></label>
          <label>Proxy CORS (opzionale) <input bind:value={settings.corsProxy} on:change={saveSettings} placeholder="https://corsproxy.io/?url={url}" /></label>
          <label>Modello
            <input list="models" bind:value={settings.model} on:change={saveSettings} placeholder="gpt-4o-mini" />
            <datalist id="models">{#each models as m}<option value={m}></option>{/each}</datalist>
          </label>
          <div class="row">
            <button on:click={fetchModels} disabled={loadingModels}>{loadingModels?'Carico...':'Carica modelli'}</button>
            <button on:click={testConnection} disabled={testing}>{testing?'Test...':'Test connessione'}</button>
          </div>
          {#if testMsg}<div class="hint">{testMsg}</div>{/if}
        {/if}
      </div>
      <div class="chat">
        {#each messages as m}
          <div class="msg {m.role}"><strong>{m.role==='user'?'Tu':'Assistente'}:</strong> <pre>{m.content}</pre></div>
        {/each}
        {#if loading}<div class="msg assistant"><em>Sto pensando...</em></div>{/if}
      </div>
      {#if errorMsg}<div class="err">{errorMsg}</div>{/if}
      <div class="row">
        <textarea bind:value={input} rows="3" placeholder="Racconta della tua famiglia..."></textarea>
        <button on:click={send} disabled={loading}>Invia</button>
      </div>
      <small>API dirette dal browser. CORS: anche endpoint pubblici possono bloccare richieste se non inviano Access-Control-Allow-Origin per questa origine. In tal caso imposta un Proxy CORS.</small>
    </div>
  {/if}
</div>

<style>
  .panel{border:1px solid #ddd;background:#fff;border-radius:8px;padding:8px;margin:8px 0}
  .box{display:flex;flex-direction:column;gap:8px}
  .cfg{display:flex;flex-direction:column;gap:6px;padding:8px;background:#faf7f2;border-radius:6px}
  .chat{max-height:260px;overflow:auto;border:1px solid #eee;padding:8px;border-radius:6px;background:#fcfcfc}
  .msg{margin:6px 0} .msg pre{white-space:pre-wrap;margin:4px 0;font:inherit}
  .msg.user{color:#1f2937} .msg.assistant{color:#374151}
  .row{display:flex;gap:6px;align-items:flex-start}
  textarea{flex:1}
  .err{color:#b91c1c;font-size:.9em}
  .hint{font-size:.9em;color:#374151}
  label{display:flex;flex-direction:column;font-size:.9em;gap:2px}
</style>
