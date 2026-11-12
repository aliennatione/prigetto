<script lang="ts">
  import { createId } from '../lib/genogram/model';
  import type { Project, TimelineEvent, Place } from '../lib/genogram/model';
  export let project: Project;
  export let onApply: (p: Project) => void = () => {};
  let open = true;
  let expanded = false;
  let view: 'global'|'person'|'editor' = 'global';
  let selectedPersonId = project.people[0]?.id || '';
  let newEvent: {date:string; title:string; description:string; kind:string; place:string; linkedPersonIds:string[]} = {date:'',title:'',description:'',kind:'',place:'',linkedPersonIds:[]};
  let newPlace = '';

  function allEvents(){
    const rows: Array<{personId:string; personName:string; ev:TimelineEvent}> = [];
    for(const p of project.people){
      for(const ev of (p.timelineEvents||[])){
        rows.push({personId:p.id, personName:p.name||'Senza nome', ev});
      }
      if(p.birthYear) rows.push({personId:p.id, personName:p.name||'Senza nome', ev:{id:'b-'+p.id,date:String(p.birthYear),title:'Nascita'}});
      if(p.deathYear || p.deceased) rows.push({personId:p.id, personName:p.name||'Senza nome', ev:{id:'d-'+p.id,date:p.deathYear?String(p.deathYear):'',title:'Decesso'}});
    }
    return rows.sort((a,b)=> (a.ev.date||'').localeCompare(b.ev.date||''));
  }
  function personEvents(pid:string){ return allEvents().filter(r=>r.personId===pid || (r.ev.linkedPersonIds||[]).includes(pid)); }
  function addPlace(){
    const name = newPlace.trim(); if(!name) return;
    const places = [...(project.places||[])];
    if(!places.find(pl=>pl.name.toLowerCase()===name.toLowerCase())) places.push({id:createId('place'), name});
    project = {...project, places, updatedAt:new Date().toISOString()}; onApply(project); newPlace='';
  }
  function toggleLinked(pid:string){
    const s = new Set(newEvent.linkedPersonIds);
    if(s.has(pid)) s.delete(pid); else s.add(pid);
    newEvent = {...newEvent, linkedPersonIds:[...s]};
  }
  function addEvent(){
    if(!newEvent.date || !newEvent.title) return;
    const targetId = selectedPersonId || project.people[0]?.id;
    if(!targetId) return;
    const ev: TimelineEvent = { id:createId('event'), date:newEvent.date, title:newEvent.title, description:newEvent.description||undefined, kind:newEvent.kind||undefined, place:newEvent.place||undefined, linkedPersonIds:newEvent.linkedPersonIds.length?newEvent.linkedPersonIds:undefined };
    const people = project.people.map(p=> p.id===targetId ? {...p, timelineEvents:[...(p.timelineEvents||[]), ev]} : p);
    project = {...project, people, updatedAt:new Date().toISOString()}; onApply(project);
    newEvent = {date:'',title:'',description:'',kind:'',place:'',linkedPersonIds:[]};
  }
  $: rows = view==='global' ? allEvents() : (selectedPersonId ? personEvents(selectedPersonId) : []);
</script>

<div class="panel">
  <div class="head">
    <button on:click={() => open=!open}>{open?'Chiudi':'Apri'} Timeline</button>
    {#if open}<button on:click={() => expanded=!expanded}>{expanded?'Compatta':'Espandi'}</button>{/if}
  </div>
  {#if open}
    <div class="tabs">
      <button class:active={view==='global'} on:click={()=>view='global'}>Globale</button>
      <button class:active={view==='person'} on:click={()=>view='person'}>Persona</button>
      <button class:active={view==='editor'} on:click={()=>view='editor'}>Editor timeline</button>
    </div>
    {#if view!=='global'}
      <label>Persona <select bind:value={selectedPersonId}>{#each project.people as p}<option value={p.id}>{p.name||p.id}</option>{/each}</select></label>
    {/if}

    {#if view==='editor'}
      <div class="editor">
        <strong>Nuovo evento (collegato a persone/luoghi)</strong>
        <div class="grid">
          <label>Data <input bind:value={newEvent.date} placeholder="YYYY o YYYY-MM-DD" /></label>
          <label>Titolo <input bind:value={newEvent.title} /></label>
          <label>Tipo <input bind:value={newEvent.kind} placeholder="matrimonio, trasferimento..." /></label>
          <label>Luogo <input bind:value={newEvent.place} placeholder="città/luogo" /></label>
        </div>
        <label>Descrizione <textarea rows="2" bind:value={newEvent.description}></textarea></label>
        <div>
          <div>Collega persone:</div>
          <div class="chips">
            {#each project.people as p}
              <label class="chip"><input type="checkbox" checked={newEvent.linkedPersonIds.includes(p.id)} on:change={()=>toggleLinked(p.id)} /> {p.name||p.id}</label>
            {/each}
          </div>
        </div>
        <button on:click={addEvent}>Aggiungi evento</button>
        <hr/>
        <strong>Luoghi</strong>
        <div class="row"><input bind:value={newPlace} placeholder="Nuovo luogo" /><button on:click={addPlace}>Aggiungi luogo</button></div>
        <ul>{#each (project.places||[]) as pl}<li>{pl.name}</li>{/each}</ul>
      </div>
    {/if}

    <div class:expanded class="list">
      {#each rows as r}
        <div class="ev">
          <div class="when">{r.ev.date || '—'}</div>
          <div>
            <div class="title">{r.ev.title} <span class="who">({r.personName})</span></div>
            {#if expanded || view==='editor'}
              {#if r.ev.kind}<div class="meta">Tipo: {r.ev.kind}</div>{/if}
              {#if r.ev.place}<div class="meta">Luogo: {r.ev.place}</div>{/if}
              {#if r.ev.linkedPersonIds?.length}<div class="meta">Persone collegate: {r.ev.linkedPersonIds.length}</div>{/if}
              {#if r.ev.description}<div class="desc">{r.ev.description}</div>{/if}
            {/if}
          </div>
        </div>
      {/each}
      {#if rows.length===0}<em>Nessun evento.</em>{/if}
    </div>
  {/if}
</div>

<style>
  .panel{border:1px solid #ddd;background:#fff;border-radius:8px;padding:8px;margin:8px 0}
  .head,.tabs,.row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .tabs button.active{font-weight:700}
  .list{margin-top:8px;max-height:220px;overflow:auto;border-top:1px solid #eee}
  .list.expanded{max-height:520px}
  .ev{display:flex;gap:10px;padding:6px 0;border-bottom:1px solid #f0f0f0}
  .when{min-width:90px;color:#555;font-variant-numeric:tabular-nums}
  .title{font-weight:600}.who{font-weight:400;color:#666}
  .meta,.desc{font-size:.9em;color:#444}
  .editor{padding:8px;background:#faf7f2;border-radius:6px;margin:8px 0;display:flex;flex-direction:column;gap:6px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px}
  .chips{display:flex;flex-wrap:wrap;gap:6px}
  .chip{font-size:.9em;border:1px solid #ddd;padding:2px 6px;border-radius:999px}
  label{display:flex;flex-direction:column;font-size:.9em;gap:2px}
</style>
