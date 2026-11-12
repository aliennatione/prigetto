'use client';

import { useMemo, useState } from 'react';
import { useGenogramStore } from '../lib/genogram/store';
import { selectTimelineForPerson } from '../components/TimelineWidget';

export default function TimelinePage() {
  const project = useGenogramStore((s) => s.project);
  const [personId, setPersonId] = useState<string>(project.people[0]?.id ?? '');
  const [kind, setKind] = useState<string>('all');

  const events = useMemo(() => {
    const base = personId ? selectTimelineForPerson(project, personId) : project.events.slice().sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
    return kind === 'all' ? base : base.filter((e) => e.kind === kind);
  }, [project, personId, kind]);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Timeline</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={personId} onChange={(e) => setPersonId(e.target.value)}>
          <option value="">Tutte le persone</option>
          {project.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">Tutti i tipi</option>
          {['birth','death','marriage','illness','achievement','custom'].map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <ul>
        {events.map((e) => (
          <li key={e.id}>{e.startDate || '—'} — {e.kind}: {e.title}</li>
        ))}
      </ul>
    </main>
  );
}
