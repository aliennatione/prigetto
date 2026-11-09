import { renderGenogram } from '@famtree/renderer';
import { GenogramGraph, GenerationalLayout, NODE, R } from '@famtree/core';
import type { Genogram, Person, Relationship } from '@famtree/schema';
import type { Project } from './types';

export function render(doc: Genogram): { svg: string; stats: { people: number; unions: number; emotions: number; width: number; height: number } } {
  return renderGenogram(doc) as any;
}

export function positions(doc: Genogram) {
  const graph = new GenogramGraph(doc as any);
  const pos = new GenerationalLayout().layout(graph);
  return { graph, pos, bounds: pos.bounds() };
}

export function personPosition(doc: Genogram, id: string) {
  const { pos } = positions(doc);
  return { x: pos.cx(id), y: pos.cy(id) };
}

export const NODE_SIZE = NODE;
export const NODE_R = R;

export function upsertPerson(doc: Genogram, person: Person) {
  const idx = doc.people.findIndex((p) => p.id === person.id);
  if (idx >= 0) doc.people[idx] = person;
  else doc.people.push(person);
}

export function removePerson(doc: Genogram, id: string) {
  doc.people = doc.people.filter((p) => p.id !== id);
  // remove relationships referencing person
  doc.relationships = doc.relationships.filter((r: any) => {
    if (r.type === 'union') return !(r.partnerIds || []).includes(id);
    if (r.type === 'parent-child') return r.childId !== id && !(r.parentIds || []).includes(id);
    if (r.type === 'emotional') return r.fromId !== id && r.toId !== id;
    return true;
  });
}

export function addUnion(doc: Genogram, partnerIds: string[], unionType = 'married', status = 'current'): Relationship {
  const rel: any = {
    id: crypto.randomUUID(),
    type: 'union',
    partnerIds,
    unionType,
    status,
  };
  doc.relationships.push(rel);
  return rel;
}

export function addChild(doc: Genogram, childId: string, parentIdsOrUnionId: { parentIds?: string[]; unionId?: string }, biological = 'biological') {
  const rel: any = {
    id: crypto.randomUUID(),
    type: 'parent-child',
    childId,
    biological,
  };
  if (parentIdsOrUnionId.unionId) rel.unionId = parentIdsOrUnionId.unionId;
  if (parentIdsOrUnionId.parentIds) rel.parentIds = parentIdsOrUnionId.parentIds;
  doc.relationships.push(rel);
  return rel;
}

export function addEmotional(doc: Genogram, aId: string, bId: string, bond: string) {
  const rel: any = {
    id: crypto.randomUUID(),
    type: 'emotional',
    personIds: [aId, bId],
    bond,
  };
  doc.relationships.push(rel);
  return rel;
}

export function exportProjectJson(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function parseProjectJson(text: string): Project {
  const obj = JSON.parse(text);
  // accept raw Genogram
  if (obj && obj.version && Array.isArray(obj.people) && !obj.genogram) {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      name: obj.metadata?.title || 'Importato',
      createdAt: now,
      updatedAt: now,
      genogram: obj as Genogram,
      timelines: {},
    };
  }
  return obj as Project;
}
