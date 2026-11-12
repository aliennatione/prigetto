import { NextResponse } from 'next/server';

import { validateProject, type Project } from '../../../lib/genogram/model';
import { isAuthorized } from '../../../lib/genogram/http-auth';

function parseProject(body: unknown): Project | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as { project?: unknown };
  const input = b.project ?? body;
  try {
    return validateProject(input);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const project = parseProject(body);
  if (!project) return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
  const person = (body as { person?: unknown })?.person;
  if (!person || typeof person !== 'object') return NextResponse.json({ error: 'Missing person' }, { status: 400 });
  const p = person as { id?: string; name?: string; gender?: string };
  if (!p.id || !p.name) return NextResponse.json({ error: 'person requires id and name' }, { status: 400 });
  project.people.push({ id: p.id, name: p.name, gender: (p.gender as any) ?? 'unknown', ...person } as any);
  const validated = validateProject(project);
  return NextResponse.json({ project: validated });
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const project = parseProject(body);
  if (!project) return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
  const person = (body as { person?: unknown })?.person as { id?: string } | undefined;
  if (!person?.id) return NextResponse.json({ error: 'Missing person.id' }, { status: 400 });
  const idx = project.people.findIndex((x) => x.id === person.id);
  if (idx < 0) return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  project.people[idx] = { ...project.people[idx], ...person } as any;
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
  project.people = project.people.filter((p) => p.id !== id);
  const validated = validateProject(project);
  return NextResponse.json({ project: validated });
}
