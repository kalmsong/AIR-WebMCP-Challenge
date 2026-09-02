import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const webmcp = read('src/webmcp.ts');
const main = read('src/main.ts');

const fail = (message) => {
  console.error(`Challenge Edition verification failed: ${message}`);
  process.exit(1);
};

for (const name of ['air_get_canvas_context', 'air_apply_canvas_markup', 'air_execute_design_request']) {
  if (!webmcp.includes(`name: '${name}'`)) fail(`missing ${name}`);
}
if (!webmcp.includes('registerTool(tool')) fail('WebMCP tools must be registered through registerTool');
if (!webmcp.includes('generated: false')) fail('markup must remain communication-only before execution');
if (!webmcp.includes('requiresApproval: true')) fail('localized reference execution must preserve the approval boundary');
if (webmcp.includes('.click()') || webmcp.includes('MouseEvent(') || webmcp.includes('PointerEvent(')) {
  fail('agent capabilities must not imitate browser pointer interaction');
}
if (!main.includes("addStroke('user'")) fail('human must be able to add Draw context on the same canvas');
if (!main.includes('setUserArea(draftArea)')) fail('human must be able to edit AREA on the same canvas');
if (!main.includes('data-air-challenge-canvas')) fail('shared canvas marker missing');

console.log('AIR × WebMCP Challenge Edition verification passed: shared canvas, structured context, communication-only markup, approval boundary and direct registerTool capabilities are present.');
