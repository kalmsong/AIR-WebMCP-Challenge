export type Author = 'user' | 'agent';
export type ToolMode = 'draw' | 'area';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  author: Author;
  points: Point[];
  color: string;
  width: number;
}

export interface Label {
  id: string;
  author: Author;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface AreaRect {
  id: string;
  author: Author;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExecutionRecord {
  id: string;
  request: string;
  createdAt: number;
  area: AreaRect | null;
}

export interface ChallengeState {
  mode: ToolMode;
  strokes: Stroke[];
  labels: Label[];
  areas: AreaRect[];
  approved: boolean;
  executions: ExecutionRecord[];
}

export interface ToolResult {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent?: Record<string, unknown>;
}

export interface ModelContextTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (input: Record<string, unknown>) => ToolResult | Promise<ToolResult>;
}

export interface ModelContext {
  registerTool: (tool: ModelContextTool, options?: { signal?: AbortSignal }) => Promise<void> | void;
}
