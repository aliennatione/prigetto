import { NextResponse } from 'next/server';
import { validateProject, type Project } from '../../../lib/genogram/model';
import { isAuthorized } from '../../../lib/genogram/http-auth';

function parseProject(body: unknown): Project | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as { project?: unknown };
  try { return validateProject(b.project ?? body); } catch { return null; }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const project = parseProject(body);
  if (!project) return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
  const key = 'events' as keyof Project;
  const item = (body as any)?.item;
  if (!item || typeof item !== 'object') return NextResponse.json({ error: 'Missing item' }, { status: 400 });
  (project as any)[key].push(item);
  const validated = validateProject(project);
  return NextResponse.json({ project: validated });
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const project = parseProject(body);
  if (!project) return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
  const key = 'events' as keyof Project;
  const item = (body as any)?.item as { id?: string } | undefined;
  if (!item?.id) return NextResponse.json({ error: 'Missing item.id' }, { status: 400 });
  const arr = (project as any)[key] as any[];
  const idx = arr.findIndex((x: any) => x.id === item.id);
  if (idx < 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  arr[idx] = { ...arr[idx], ...item };
  const validated = validateProject(project);
  return NextResponse.json({ project: validated });
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const project = parseProject(body);
  if (!project) return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
  const key = 'events' as keyof Project;
  const id = (body as any)?.id;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  (project as any)[key] = (project as any)[key].filter((x: any) => x.id !== id);
  const validated = validateProject(project);
  return NextResponse.json({ project: validated });
}
