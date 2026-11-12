import { NextResponse } from 'next/server';

import { validateProject, type Project } from '../../../lib/genogram/model';
import { isAuthorized } from '../../../lib/genogram/http-auth';

function parseProject(body: unknown): Project | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as { project?: unknown };
  const input = b.project ?? body;
  try { return validateProject(input); } catch { return null; }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const project = parseProject(body);
  if (!project) return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
  const rel = (body as { relationship?: unknown })?.relationship;
  if (!rel || typeof rel !== 'object') return NextResponse.json({ error: 'Missing relationship' }, { status: 400 });
  project.relationships.push(rel as any);
  const validated = validateProject(project);
  return NextResponse.json({ project: validated });
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const project = parseProject(body);
  if (!project) return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
  const rel = (body as { relationship?: unknown })?.relationship as { id?: string } | undefined;
  if (!rel?.id) return NextResponse.json({ error: 'Missing relationship.id' }, { status: 400 });
  const idx = project.relationships.findIndex((x: any) => x.id === rel.id);
  if (idx < 0) return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
  project.relationships[idx] = { ...project.relationships[idx], ...rel } as any;
  const validated = validateProject(project);
  return NextResponse.json({ project: validated });
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const project = parseProject(body);
  if (!project) return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
  const id = (body as { id?: string })?.id;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  project.relationships = project.relationships.filter((r: any) => r.id !== id);
  const validated = validateProject(project);
  return NextResponse.json({ project: validated });
}
