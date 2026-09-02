import {
  addLabel,
  addStroke,
  approveArea,
  executeRequest,
  setAgentAreas,
  snapshot,
} from './store';
import type { ModelContext, ModelContextTool, Point, ToolResult } from './types';

const result = (value: Record<string, unknown>): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
  structuredContent: value,
});

const objectSchema = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: 'object',
  additionalProperties: false,
  properties,
  ...(required.length ? { required } : {}),
});

const pointSchema = objectSchema({
  x: { type: 'number', minimum: 0, maximum: 1 },
  y: { type: 'number', minimum: 0, maximum: 1 },
}, ['x', 'y']);

const rectSchema = objectSchema({
  x: { type: 'number', minimum: 0, maximum: 1 },
  y: { type: 'number', minimum: 0, maximum: 1 },
  width: { type: 'number', minimum: 0.01, maximum: 1 },
  height: { type: 'number', minimum: 0.01, maximum: 1 },
}, ['x', 'y', 'width', 'height']);

const modelContext = (): ModelContext | undefined => {
  const doc = document as Document & { modelContext?: ModelContext };
  if (doc.modelContext?.registerTool) return doc.modelContext;
  const nav = navigator as Navigator & { modelContext?: ModelContext };
  return nav.modelContext?.registerTool ? nav.modelContext : undefined;
};

const waitForModelContext = async (signal: AbortSignal): Promise<ModelContext | undefined> => {
  const deadline = Date.now() + 12000;
  while (!signal.aborted && Date.now() < deadline) {
    const current = modelContext();
    if (current) return current;
    await new Promise((resolve) => window.setTimeout(resolve, 80));
  }
  return modelContext();
};

const parsePoint = (value: unknown): Point => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Point must be an object.');
  const point = value as Record<string, unknown>;
  const x = Number(point.x);
  const y = Number(point.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Point needs numeric x and y.');
  return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
};

const tools = (): ModelContextTool[] => [
  {
    name: 'air_get_canvas_context',
    description: 'Read the shared AIR Challenge canvas as structured design context: Draw annotations, AREA proposal, approval state and execution history.',
    inputSchema: objectSchema({}),
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: () => {
      const state = snapshot();
      const authors = new Set([
        ...state.strokes.map((item) => item.author),
        ...state.labels.map((item) => item.author),
      ]);
      const sketchAuthor = authors.size > 1 ? 'shared' : authors.has('agent') ? 'agent' : authors.has('user') ? 'user' : null;
      return result({
        schemaVersion: 1,
        surface: 'air-shared-canvas-reference',
        coordinateSpace: 'normalized-image',
        mode: state.mode,
        sketch: {
          author: sketchAuthor,
          strokes: state.strokes,
          labels: state.labels,
        },
        area: {
          regions: state.areas,
          approved: state.approved,
        },
        recentExecutions: state.executions.slice(-4),
        actions: {
          markup: 'air_apply_canvas_markup',
          execute: 'air_execute_design_request',
        },
      });
    },
  },
  {
    name: 'air_apply_canvas_markup',
    description: 'Place agent-authored Draw or AREA markup on the shared architectural canvas for communication only. This tool never generates an image. Coordinates are normalized from 0 to 1.',
    inputSchema: objectSchema({
      surface: { type: 'string', enum: ['draw', 'area'] },
      strokes: {
        type: 'array',
        maxItems: 24,
        items: objectSchema({
          points: { type: 'array', minItems: 2, maxItems: 96, items: pointSchema },
          color: { type: 'string', maxLength: 32 },
          width: { type: 'number', minimum: 0.001, maximum: 0.05 },
        }, ['points']),
      },
      labels: {
        type: 'array',
        maxItems: 24,
        items: objectSchema({
          x: { type: 'number', minimum: 0, maximum: 1 },
          y: { type: 'number', minimum: 0, maximum: 1 },
          text: { type: 'string', minLength: 1, maxLength: 160 },
          color: { type: 'string', maxLength: 32 },
        }, ['x', 'y', 'text']),
      },
      rectangles: { type: 'array', maxItems: 12, items: rectSchema },
    }, ['surface']),
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: (input) => {
      const surface = String(input.surface || '');
      if (surface === 'draw') {
        const strokes = Array.isArray(input.strokes) ? input.strokes : [];
        const labels = Array.isArray(input.labels) ? input.labels : [];
        strokes.forEach((raw) => {
          if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Stroke must be an object.');
          const item = raw as Record<string, unknown>;
          if (!Array.isArray(item.points)) throw new Error('Stroke needs points.');
          const points = item.points.slice(0, 96).map(parsePoint);
          if (points.length < 2) throw new Error('Stroke needs at least two points.');
          addStroke('agent', points, String(item.color || '#ef4444'), Number(item.width || 0.006));
        });
        labels.forEach((raw) => {
          if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Label must be an object.');
          const item = raw as Record<string, unknown>;
          const text = String(item.text || '').trim();
          if (!text) throw new Error('Label needs text.');
          addLabel('agent', Number(item.x), Number(item.y), text, String(item.color || '#ef4444'));
        });
        return result({ ok: true, applied: true, generated: false, surface: 'draw', visibleInCanvas: true });
      }

      if (surface === 'area') {
        const rectangles = Array.isArray(input.rectangles) ? input.rectangles : [];
        if (!rectangles.length) throw new Error('AREA markup needs at least one rectangle.');
        setAgentAreas(rectangles.slice(0, 12).map((raw) => {
          if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('AREA rectangle must be an object.');
          const item = raw as Record<string, unknown>;
          return {
            x: Number(item.x),
            y: Number(item.y),
            width: Number(item.width),
            height: Number(item.height),
          };
        }));
        return result({ ok: true, applied: true, generated: false, surface: 'area', visibleInCanvas: true });
      }

      throw new Error(`Unsupported markup surface: ${surface}`);
    },
  },
  {
    name: 'air_execute_design_request',
    description: 'Execute the agreed localized design request in this public reference app. If an AREA is active, confirmed=true represents explicit human approval. The reference implementation applies a visible material treatment instead of calling AIR commercial image providers.',
    inputSchema: objectSchema({
      request: { type: 'string', minLength: 1, maxLength: 4000 },
      confirmed: { type: 'boolean' },
    }, ['request', 'confirmed']),
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: (input) => {
      const request = String(input.request || '').trim();
      const confirmed = input.confirmed === true;
      if (!request) throw new Error('A design request is required.');
      const state = snapshot();
      if (state.areas.length && !state.approved && !confirmed) {
        return result({ ok: false, executed: false, requiresApproval: true, message: 'Confirm the visible AREA before execution.' });
      }
      if (state.areas.length && confirmed) approveArea();
      const record = executeRequest(request);
      return result({
        ok: true,
        executed: true,
        request,
        area: record.area,
        visibleInCanvas: true,
        referenceImplementation: true,
        providerCalled: false,
      });
    },
  },
];

export const registerChallengeWebMcp = async (onStatus: (status: string, connected: boolean) => void): Promise<() => void> => {
  const controller = new AbortController();
  onStatus('Waiting for WebMCP…', false);
  const context = await waitForModelContext(controller.signal);
  if (!context) {
    onStatus('WebMCP not detected — manual canvas still works.', false);
    return () => controller.abort();
  }

  for (const tool of tools()) {
    await Promise.resolve(context.registerTool(tool, { signal: controller.signal }));
  }
  onStatus('WebMCP connected · 3 capabilities registered', true);
  return () => controller.abort();
};
