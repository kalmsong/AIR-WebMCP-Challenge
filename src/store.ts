import type { AreaRect, ChallengeState, ExecutionRecord, Label, Point, Stroke, ToolMode } from './types';

type Listener = (state: ChallengeState) => void;

const state: ChallengeState = {
  mode: 'draw',
  strokes: [],
  labels: [],
  areas: [],
  approved: false,
  executions: [],
};

const listeners = new Set<Listener>();
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const emit = () => listeners.forEach((listener) => listener(snapshot()));
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const snapshot = (): ChallengeState => ({
  ...state,
  strokes: state.strokes.map((stroke) => ({ ...stroke, points: stroke.points.map((point) => ({ ...point })) })),
  labels: state.labels.map((label) => ({ ...label })),
  areas: state.areas.map((area) => ({ ...area })),
  executions: state.executions.map((record) => ({ ...record, area: record.area ? { ...record.area } : null })),
});

export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  listener(snapshot());
  return () => listeners.delete(listener);
};

export const setMode = (mode: ToolMode): void => {
  state.mode = mode;
  emit();
};

export const addStroke = (author: Stroke['author'], points: Point[], color = '#ef4444', width = 0.006): Stroke => {
  const stroke: Stroke = {
    id: uid('stroke'),
    author,
    points: points.map((point) => ({ x: clamp01(point.x), y: clamp01(point.y) })),
    color,
    width: Math.max(0.001, Math.min(0.05, width)),
  };
  state.strokes.push(stroke);
  if (author === 'user') state.approved = false;
  emit();
  return stroke;
};

export const addLabel = (author: Label['author'], x: number, y: number, text: string, color = '#ef4444'): Label => {
  const label: Label = { id: uid('label'), author, x: clamp01(x), y: clamp01(y), text: text.slice(0, 160), color };
  state.labels.push(label);
  emit();
  return label;
};

export const setAgentAreas = (areas: Array<Omit<AreaRect, 'id' | 'author'>>): void => {
  state.areas = areas.map((area) => ({
    id: uid('area'),
    author: 'agent',
    x: clamp01(area.x),
    y: clamp01(area.y),
    width: Math.max(0.01, Math.min(1 - clamp01(area.x), area.width)),
    height: Math.max(0.01, Math.min(1 - clamp01(area.y), area.height)),
  }));
  state.approved = false;
  emit();
};

export const setUserArea = (area: Omit<AreaRect, 'id' | 'author'>): void => {
  state.areas = [{
    id: uid('area'),
    author: 'user',
    x: clamp01(area.x),
    y: clamp01(area.y),
    width: Math.max(0.01, Math.min(1 - clamp01(area.x), area.width)),
    height: Math.max(0.01, Math.min(1 - clamp01(area.y), area.height)),
  }];
  state.approved = false;
  emit();
};

export const approveArea = (): void => {
  if (!state.areas.length) return;
  state.approved = true;
  emit();
};

export const executeRequest = (request: string): ExecutionRecord => {
  const activeArea = state.areas.at(-1) ?? null;
  const record: ExecutionRecord = {
    id: uid('execution'),
    request,
    createdAt: Date.now(),
    area: activeArea ? { ...activeArea } : null,
  };
  state.executions.push(record);
  state.approved = false;
  emit();
  return record;
};

export const clearMarkup = (): void => {
  state.strokes = [];
  state.labels = [];
  state.areas = [];
  state.approved = false;
  emit();
};
