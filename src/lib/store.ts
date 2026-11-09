import { writable } from 'svelte/store';
import type { Project } from './types';

export const currentProject = writable<Project | null>(null);
