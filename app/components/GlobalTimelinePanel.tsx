'use client';

import { useMemo, useState } from 'react';
import { useGenogramStore } from '../lib/genogram/store';

export default function GlobalTimelinePanel() {
  const project = useGenogramStore((s) => s.project);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const events = useMemo(() => {
    const list: Array<{ id: string; date: string; title: string; description?: string; people: string[] }> = [];
    project.people.forEach((p) => {
      if (p.birthYear != null) list.push({ id: `${p.id}-birth`, date: String(p.birthYear), title: `Nascita: ${p.name}`, people: [p.name] });
      (p.timelineEvents ?? []).forEach((e) => list.push({ ...e, id: `${p.id}-${e.id}`, people: [p.name] }));
      if (p.deceased && p.deathYear != null) list.push({ id: `${p.id}-death`, date: String(p.deathYear), title: `Decesso: ${p.name}`, people: [p.name] });
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [project]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ position: 'fixed', left: 16, bottom: 60, zIndex: 1000, padding: '8px 12px', borderRadius: 999, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
        Timeline globale
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', left: 16, bottom: 60, width: expanded ? 640 : 360, height: expanded ? 420 : 300, zIndex: 1000, background: '#fff', border: '1px solid #ddd', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 10, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Timeline globale</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setExpanded((v) => !v)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>{expanded ? 'Riduci' : 'Espandi'}</button>
          <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>×</button>
        </div>
      </div>
      <div style={{ padding: 10, overflow: 'auto', display: 'flex', flexDirection: expanded ? 'row' : 'column', gap: 12 }}>
        {events.length === 0 && <div style={{ color: '#666' }}>Nessun evento.</div>}
        {events.map((e) => (
          <div key={e.id} style={{ minWidth: expanded ? 160 : undefined, borderLeft: expanded ? 'none' : '3px solid #059669', borderTop: expanded ? '3px solid #059669' : 'none', paddingLeft: expanded ? 0 : 8, paddingTop: expanded ? 8 : 0 }}>
            <div style={{ fontWeight: 600 }}>{e.date}</div>
            <div>{e.title}</div>
            <div style={{ fontSize: 12, color: '#555' }}>{e.people.join(', ')}</div>
            {e.description && <div style={{ fontSize: 12, color: '#555' }}>{e.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
