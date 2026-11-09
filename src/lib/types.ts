import type { Genogram, Person, Relationship } from '@famtree/schema';

export type { Genogram, Person, Relationship };

export interface TimelineEvent {
  id: string;
  personId: string;
  start: string; // ISO date or 'YYYY-MM-DD'
  end?: string;
  content: string;
  type?: 'birth' | 'death' | 'marriage' | 'illness' | 'event' | 'milestone';
  group?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  genogram: Genogram;
  timelines: Record<string, TimelineEvent[]>;
}

export const emptyGenogram = (title = 'Nuovo genogramma'): Genogram => ({
  version: '1.0.0',
  metadata: { title },
  people: [],
  relationships: [],
});

export const newProject = (name = 'Nuovo progetto'): Project => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    genogram: emptyGenogram(name),
    timelines: {},
  };
};
