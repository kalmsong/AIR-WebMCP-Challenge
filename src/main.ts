import './styles.css';
import { addStroke, approveArea, clearMarkup, setMode, setUserArea, snapshot, subscribe } from './store';
import type { AreaRect, ChallengeState, Point } from './types';
import { registerChallengeWebMcp } from './webmcp';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app');

app.innerHTML = `
  <header class="topbar">
    <div>
      <div class="eyebrow">WebMCP Challenge Edition</div>
      <h1>AIR <span>× WebMCP</span></h1>
    </div>
    <div id="webmcp-status" class="connection" data-connected="false">Waiting for WebMCP…</div>
  </header>
  <main class="layout">
    <aside class="panel">
      <section>
        <div class="section-label">Shared canvas</div>
        <h2>Human + agent design dialogue</h2>
        <p>Draw and AREA are communication surfaces first. Generation only happens after the design intent is agreed.</p>
      </section>
      <section>
        <div class="section-label">Manual controls</div>
        <div class="segmented">
          <button id="mode-draw" class="active">Draw</button>
          <button id="mode-area">AREA</button>
        </div>
        <div class="button-stack">
          <button id="approve-area" class="primary" disabled>Approve visible AREA</button>
          <button id="clear-markup">Clear markup</button>
        </div>
        <p class="hint">These buttons are for human interaction. The agent uses WebMCP capabilities instead of clicking them.</p>
      </section>
      <section>
        <div class="section-label">Live structured context</div>
        <div id="context-summary" class="context-card"></div>
      </section>
      <section>
        <div class="section-label">Reference execution</div>
        <div id="history" class="history"></div>
      </section>
    </aside>

    <section class="workspace">
      <div class="workspace-head">
        <div>
          <div class="section-label">Architectural canvas</div>
          <h2>Facade rhythm study</h2>
        </div>
        <div class="legend">
          <span><i class="dot agent"></i>Agent</span>
          <span><i class="dot human"></i>Human</span>
          <span><i class="dot area"></i>AREA</span>
        </div>
      </div>

      <div id="canvas-shell" class="canvas-shell" data-air-challenge-canvas="true">
        <svg class="base" viewBox="0 0 1000 620" role="img" aria-label="Abstract architectural facade">
          <defs>
            <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#dbeafe"/><stop offset="1" stop-color="#f8fafc"/></linearGradient>
            <linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#334155"/><stop offset="0.5" stop-color="#64748b"/><stop offset="1" stop-color="#1e293b"/></linearGradient>
          </defs>
          <rect width="1000" height="620" fill="url(#sky)"/>
          <rect y="500" width="1000" height="120" fill="#d6d3d1"/>
          <polygon points="80,500 790,500 930,552 205,552" fill="#a8a29e" opacity=".55"/>
          <rect x="115" y="150" width="750" height="345" rx="4" fill="#f5f5f4" stroke="#a8a29e" stroke-width="2"/>
          <rect x="160" y="190" width="470" height="250" fill="url(#glass)"/>
          <rect x="655" y="190" width="165" height="250" fill="#e7e5e4"/>
          <rect x="130" y="445" width="700" height="38" fill="#78716c"/>
          ${Array.from({ length: 18 }, (_, i) => `<rect x="${174 + i * 25}" y="178" width="5" height="278" fill="#e7e5e4" opacity=".92"/>`).join('')}
          ${Array.from({ length: 6 }, (_, i) => `<rect x="${670 + i * 24}" y="205" width="7" height="220" fill="#a8a29e" opacity=".7"/>`).join('')}
          <rect x="705" y="395" width="115" height="50" fill="#44403c"/>
          <line x1="95" x2="890" y1="500" y2="500" stroke="#57534e" stroke-width="4"/>
        </svg>
        <svg id="markup-layer" class="markup" viewBox="0 0 1000 620" aria-label="Shared human-agent markup layer"></svg>
      </div>

      <div class="flow-strip">
        <span>Understand</span><b>→</b><span>Mark up</span><b>→</b><span>Discuss</span><b>→</b><span>Agree</span><b>→</b><span>Execute</span>
      </div>
    </section>
  </main>
`;

const markup = document.querySelector<SVGSVGElement>('#markup-layer');
const shell = document.querySelector<HTMLDivElement>('#canvas-shell');
const contextSummary = document.querySelector<HTMLDivElement>('#context-summary');
const history = document.querySelector<HTMLDivElement>('#history');
const approveButton = document.querySelector<HTMLButtonElement>('#approve-area');
const drawButton = document.querySelector<HTMLButtonElement>('#mode-draw');
const areaButton = document.querySelector<HTMLButtonElement>('#mode-area');
const status = document.querySelector<HTMLDivElement>('#webmcp-status');
if (!markup || !shell || !contextSummary || !history || !approveButton || !drawButton || !areaButton || !status) {
  throw new Error('Challenge UI failed to mount.');
}

let draftPoints: Point[] = [];
let draftArea: AreaRect | null = null;
let pointerActive = false;

const svgPoint = (event: PointerEvent): Point => {
  const rect = markup.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
  };
};

const polylinePoints = (points: Point[]) => points.map((point) => `${point.x * 1000},${point.y * 620}`).join(' ');
const rectAttrs = (area: Pick<AreaRect, 'x' | 'y' | 'width' | 'height'>) => ({
  x: area.x * 1000,
  y: area.y * 620,
  width: area.width * 1000,
  height: area.height * 620,
});

const svgElement = <K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
};

const renderCanvas = (state: ChallengeState): void => {
  markup.replaceChildren();

  state.executions.forEach((execution) => {
    if (!execution.area) return;
    const attrs = rectAttrs(execution.area);
    markup.append(svgElement('rect', {
      ...attrs,
      fill: '#d6b98c',
      opacity: 0.56,
      rx: 8,
      'data-executed-treatment': execution.id,
    }));
  });

  state.strokes.forEach((stroke) => {
    markup.append(svgElement('polyline', {
      points: polylinePoints(stroke.points),
      fill: 'none',
      stroke: stroke.author === 'agent' ? stroke.color : '#2563eb',
      'stroke-width': Math.max(2, stroke.width * 620),
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      opacity: 0.94,
      'data-author': stroke.author,
    }));
  });

  state.labels.forEach((label) => {
    const text = svgElement('text', {
      x: label.x * 1000,
      y: label.y * 620,
      fill: label.author === 'agent' ? label.color : '#2563eb',
      'font-size': 18,
      'font-weight': 700,
      'data-author': label.author,
    });
    text.textContent = label.text;
    markup.append(text);
  });

  state.areas.forEach((area) => {
    const attrs = rectAttrs(area);
    markup.append(svgElement('rect', {
      ...attrs,
      fill: area.author === 'agent' ? '#ef4444' : '#2563eb',
      'fill-opacity': 0.18,
      stroke: area.author === 'agent' ? '#ef4444' : '#2563eb',
      'stroke-width': 3,
      'stroke-dasharray': '12 8',
      rx: 6,
      'data-area-author': area.author,
    }));
  });

  if (draftPoints.length > 1) {
    markup.append(svgElement('polyline', {
      points: polylinePoints(draftPoints),
      fill: 'none',
      stroke: '#2563eb',
      'stroke-width': 4,
      'stroke-linecap': 'round',
      opacity: 0.75,
    }));
  }
  if (draftArea) {
    markup.append(svgElement('rect', {
      ...rectAttrs(draftArea),
      fill: '#2563eb',
      'fill-opacity': 0.12,
      stroke: '#2563eb',
      'stroke-width': 3,
      'stroke-dasharray': '10 7',
    }));
  }
};

const renderSidePanel = (state: ChallengeState): void => {
  const hasAgent = [...state.strokes, ...state.labels].some((item) => item.author === 'agent');
  const hasUser = [...state.strokes, ...state.labels].some((item) => item.author === 'user');
  const author = hasAgent && hasUser ? 'shared' : hasAgent ? 'agent' : hasUser ? 'human' : 'empty';
  contextSummary.innerHTML = `
    <div><strong>Sketch</strong><span>${author}</span></div>
    <div><strong>Annotations</strong><span>${state.strokes.length + state.labels.length}</span></div>
    <div><strong>AREA</strong><span>${state.areas.length ? `${state.areas.length} visible` : 'none'}</span></div>
    <div><strong>Approval</strong><span>${state.approved ? 'confirmed' : 'waiting'}</span></div>
  `;

  approveButton.disabled = state.areas.length === 0 || state.approved;
  approveButton.textContent = state.approved ? 'AREA approved' : 'Approve visible AREA';
  drawButton.classList.toggle('active', state.mode === 'draw');
  areaButton.classList.toggle('active', state.mode === 'area');
  shell.dataset.mode = state.mode;

  history.innerHTML = state.executions.length
    ? state.executions.slice().reverse().map((item) => `<div class="history-item"><strong>Executed</strong><span>${item.request}</span></div>`).join('')
    : '<div class="empty">No execution yet. Markup does not generate anything.</div>';
};

subscribe((state) => {
  renderCanvas(state);
  renderSidePanel(state);
});

drawButton.addEventListener('click', () => setMode('draw'));
areaButton.addEventListener('click', () => setMode('area'));
approveButton.addEventListener('click', approveArea);
document.querySelector('#clear-markup')?.addEventListener('click', clearMarkup);

markup.addEventListener('pointerdown', (event) => {
  pointerActive = true;
  markup.setPointerCapture(event.pointerId);
  const point = svgPoint(event);
  if (snapshot().mode === 'draw') {
    draftPoints = [point];
  } else {
    draftArea = { id: 'draft', author: 'user', x: point.x, y: point.y, width: 0, height: 0 };
  }
  renderCanvas(snapshot());
});

markup.addEventListener('pointermove', (event) => {
  if (!pointerActive) return;
  const point = svgPoint(event);
  if (snapshot().mode === 'draw') {
    draftPoints.push(point);
  } else if (draftArea) {
    const startX = draftArea.x;
    const startY = draftArea.y;
    draftArea = {
      ...draftArea,
      x: Math.min(startX, point.x),
      y: Math.min(startY, point.y),
      width: Math.abs(point.x - startX),
      height: Math.abs(point.y - startY),
    };
  }
  renderCanvas(snapshot());
});

const finishPointer = (event: PointerEvent) => {
  if (!pointerActive) return;
  pointerActive = false;
  if (markup.hasPointerCapture(event.pointerId)) markup.releasePointerCapture(event.pointerId);
  if (snapshot().mode === 'draw' && draftPoints.length > 1) {
    addStroke('user', draftPoints, '#2563eb', 0.006);
  } else if (snapshot().mode === 'area' && draftArea && draftArea.width > 0.01 && draftArea.height > 0.01) {
    setUserArea(draftArea);
  }
  draftPoints = [];
  draftArea = null;
  renderCanvas(snapshot());
};

markup.addEventListener('pointerup', finishPointer);
markup.addEventListener('pointercancel', finishPointer);

void registerChallengeWebMcp((message, connected) => {
  status.textContent = message;
  status.dataset.connected = String(connected);
});
