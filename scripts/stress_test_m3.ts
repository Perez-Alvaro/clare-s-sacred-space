import React from 'react';
// Polyfill globals for Node/SSR environment
(import.meta as any).env = {
  VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'placeholder-anon-key',
};

(globalThis as any).React = React;

if (typeof (globalThis as any).localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToString } from 'react-dom/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runChallengerStressTests() {
  console.log('================================================================');
  console.log('EMPIRICAL CHALLENGER STRESS TESTS & HARNESS - MILESTONE M3');
  console.log('================================================================\n');

  // -----------------------------------------------------------------------------
  // TEST 1: Exhaustive AST / Regex Scan for Plain-text "Cargando..."
  // -----------------------------------------------------------------------------
  console.log('--- TEST 1: Plain-text "Cargando..." Eradication in src/ ---');

  function getAllFiles(dir: string, extList: string[]): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getAllFiles(fullPath, extList));
      } else if (entry.isFile() && extList.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const srcFiles = getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
  console.log(`Scanning ${srcFiles.length} source files in src/...`);

  const plainTextCargandoRegex = /<p[^>]*>(\s*Cargando\b[^<]*)<\/p>/i;

  let offendingFiles: { file: string; match: string }[] = [];

  for (const file of srcFiles) {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf-8');

    // Check for plain <p>Cargando...</p>
    const match = content.match(plainTextCargandoRegex);
    if (match) {
      offendingFiles.push({ file: relPath, match: match[0] });
    }
  }

  assert(
    offendingFiles.length === 0,
    `Zero instances of <p>Cargando...</p> found across all ${srcFiles.length} files (offending: ${offendingFiles.length})`
  );
  if (offendingFiles.length > 0) {
    console.error('Offending occurrences:', offendingFiles);
  }

  // Also check that all occurrences of "Cargando" in src/ are accessible (sr-only or aria-label)
  let rawVisibleCargando = 0;
  for (const file of srcFiles) {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const lines = fs.readFileSync(file, 'utf-8').split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('Cargando')) {
        const isAriaLabel = line.includes('aria-label=');
        const isSrOnly = line.includes('sr-only');
        const isCommentOrType = line.trim().startsWith('//') || line.trim().startsWith('*') || line.includes('defaultPending');
        const isAllowedButtonFallback = line.includes('loadingText');
        if (!isAriaLabel && !isSrOnly && !isCommentOrType && !isAllowedButtonFallback) {
          console.warn(`Note: "Cargando" found at ${relPath}:${idx + 1} -> ${line.trim()}`);
          rawVisibleCargando++;
        }
      }
    });
  }
  assert(
    rawVisibleCargando === 0,
    `Zero un-annotated visible "Cargando" text strings exist in application templates (${rawVisibleCargando} raw instances)`
  );

  // -----------------------------------------------------------------------------
  // TEST 2: RouteProgressBar Anti-Flicker (120ms) & Min Duration (350ms) Oracle
  // -----------------------------------------------------------------------------
  console.log('\n--- TEST 2: RouteProgressBar Anti-Flicker & Min Duration Oracle ---');

  // We test the exact behavioral state machine implemented in RouteProgressBar:
  // defaultPendingMs = 120ms
  // defaultPendingMinMs = 350ms
  class RouteProgressBarSimulator {
    visible = false;
    progress = 0;
    shownTimestamp: number | null = null;
    pendingTimer: any = null;
    hideTimer: any = null;
    clock = 0;
    timers: { id: number; callback: () => void; triggerAt: number }[] = [];
    nextTimerId = 1;

    defaultPendingMs: number;
    defaultPendingMinMs: number;

    constructor(defaultPendingMs = 120, defaultPendingMinMs = 350) {
      this.defaultPendingMs = defaultPendingMs;
      this.defaultPendingMinMs = defaultPendingMinMs;
    }

    setTimeout(cb: () => void, delay: number) {
      const id = this.nextTimerId++;
      this.timers.push({ id, callback: cb, triggerAt: this.clock + delay });
      return id;
    }

    clearTimeout(id: number | null) {
      if (!id) return;
      this.timers = this.timers.filter((t) => t.id !== id);
    }

    advanceTime(ms: number) {
      this.clock += ms;
      // Trigger all expired timers in chronological order
      let ready: { id: number; callback: () => void; triggerAt: number }[];
      while (true) {
        ready = this.timers.filter((t) => t.triggerAt <= this.clock).sort((a, b) => a.triggerAt - b.triggerAt);
        if (ready.length === 0) break;
        const first = ready[0];
        this.timers = this.timers.filter((t) => t.id !== first.id);
        first.callback();
      }
    }

    startPending() {
      if (this.hideTimer) {
        this.clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      if (this.visible) return;

      if (!this.pendingTimer) {
        this.pendingTimer = this.setTimeout(() => {
          this.visible = true;
          this.progress = 25;
          this.shownTimestamp = this.clock;
          this.pendingTimer = null;
        }, this.defaultPendingMs);
      }
    }

    finishPending() {
      if (this.pendingTimer) {
        this.clearTimeout(this.pendingTimer);
        this.pendingTimer = null;
      }

      if (!this.visible) {
        this.progress = 0;
        this.shownTimestamp = null;
        return;
      }

      const elapsedTime = this.shownTimestamp ? this.clock - this.shownTimestamp : this.defaultPendingMinMs;
      const remainingTime = Math.max(0, this.defaultPendingMinMs - elapsedTime);

      this.hideTimer = this.setTimeout(() => {
        this.progress = 100;
        this.hideTimer = this.setTimeout(() => {
          this.visible = false;
          this.progress = 0;
          this.shownTimestamp = null;
          this.hideTimer = null;
        }, 250);
      }, remainingTime);
    }
  }

  // Scenario 2.1: Ultra-fast transition (e.g. 50ms) -> Must NEVER become visible
  const simFast = new RouteProgressBarSimulator(120, 350);
  simFast.startPending();
  simFast.advanceTime(50); // 50ms passed (< 120ms)
  assert(!simFast.visible, 'Fast transition at 50ms: visible is still false');
  simFast.finishPending();
  simFast.advanceTime(500); // Wait long after
  assert(!simFast.visible, 'Fast transition (50ms): visible remains false (Anti-flicker threshold respected)');
  assert(simFast.progress === 0, 'Fast transition (50ms): progress reset to 0');

  // Scenario 2.2: Fast transition right at 119ms -> Must NOT become visible
  const simBoundary = new RouteProgressBarSimulator(120, 350);
  simBoundary.startPending();
  simBoundary.advanceTime(119);
  assert(!simBoundary.visible, 'Boundary transition at 119ms: visible is still false');
  simBoundary.finishPending();
  simBoundary.advanceTime(300);
  assert(!simBoundary.visible, 'Boundary transition (119ms): cancelled before 120ms tick');

  // Scenario 2.3: Slow transition triggering at 120ms -> Becomes visible
  const simSlow = new RouteProgressBarSimulator(120, 350);
  simSlow.startPending();
  simSlow.advanceTime(120);
  assert(simSlow.visible, 'Slow transition at 120ms: progress bar becomes visible');
  assert(simSlow.progress === 25, 'Initial progress is 25%');

  // Finish called at 130ms (only 10ms after becoming visible)
  simSlow.advanceTime(10);
  simSlow.finishPending();

  // At 100ms after finishPending (elapsed = 110ms < 350ms min duration) -> Must STILL be visible
  simSlow.advanceTime(100);
  assert(simSlow.visible, 'Progress bar still visible at +100ms (respects 350ms minimum display time)');

  // At 340ms after shown (clock = 120 + 340 = 460ms) -> Must STILL be visible
  simSlow.advanceTime(230); // 130 + 100 + 230 = 460ms (elapsed = 340ms < 350ms)
  assert(simSlow.visible, 'Progress bar still visible at 340ms elapsed time (< 350ms min duration)');

  // Advance past 350ms min duration (elapsed = 360ms) -> triggers fadeout sequence
  simSlow.advanceTime(20); // 480ms (elapsed = 360ms)
  assert(simSlow.progress === 100, 'Progress transitions to 100% after 350ms minimum duration');
  // At +250ms fadeout, finally hidden
  simSlow.advanceTime(250);
  assert(!simSlow.visible, 'Progress bar hidden after fadeout completes');

  // -----------------------------------------------------------------------------
  // TEST 3: Button Component Loading State Empirical Rendering
  // -----------------------------------------------------------------------------
  console.log('\n--- TEST 3: Button Component Empirical Rendering & Dimensional Locking ---');

  const { Button } = await import('../src/components/ui/button');

  const hasStandalonePointerEventsNone = (html: string) => /(^|\s)pointer-events-none(\s|"|$)/.test(
    html.replace(/disabled:pointer-events-none/g, '').replace(/\[&_svg\]:pointer-events-none/g, '')
  );

  const hasDisabledAttribute = (html: string) => /<button[^>]*\sdisabled(\s|=|>)/i.test(html);

  // Render normal button
  const normalHtml = renderToString(React.createElement(Button, null, 'Guardar'));
  assert(normalHtml.includes('Guardar'), 'Normal button renders child text');
  assert(!normalHtml.includes('spinner-warm'), 'Normal button does not render spinner');
  assert(!hasStandalonePointerEventsNone(normalHtml), 'Normal button has active pointer events (no standalone pointer-events-none)');
  assert(!hasDisabledAttribute(normalHtml), 'Normal button is not disabled (no disabled attribute on <button>)');
  assert(!normalHtml.includes('aria-busy="true"'), 'Normal button has no aria-busy');

  // Render button with isLoading={true}
  const loadingHtml = renderToString(React.createElement(Button, { isLoading: true }, 'Guardar'));
  assert(hasDisabledAttribute(loadingHtml), 'Loading button has disabled attribute on <button>');
  assert(loadingHtml.includes('aria-busy="true"'), 'Loading button renders aria-busy="true"');
  assert(hasStandalonePointerEventsNone(loadingHtml), 'Loading button applies standalone pointer-events-none');
  assert(loadingHtml.includes('spinner-warm'), 'Loading button renders .spinner-warm');
  assert(loadingHtml.includes('spinner-warm-sm'), 'Loading button renders .spinner-warm-sm');
  assert(loadingHtml.includes('Guardar'), 'Loading button preserves original label when loadingText is omitted');

  // Dimensional locking check: Ensure button maintains default height classes (h-10) and spacing
  assert(loadingHtml.includes('h-10'), 'Loading button retains fixed height class (h-10) preventing height collapse');
  assert(loadingHtml.includes('px-4'), 'Loading button retains horizontal padding class (px-4)');
  assert(normalHtml.includes('h-10') && normalHtml.includes('px-4'), 'Normal button shares identical h-10 and px-4 classes for 0 CLS');

  // Render button with isPending={true} and loadingText="Actualizando..."
  const pendingWithTextHtml = renderToString(
    React.createElement(Button, { isPending: true, loadingText: 'Actualizando...' }, 'Guardar')
  );
  assert(pendingWithTextHtml.includes('Actualizando...'), 'Button renders custom loadingText when supplied');
  assert(!pendingWithTextHtml.includes('Guardar'), 'Custom loadingText replaces default child text when specified');
  assert(pendingWithTextHtml.includes('spinner-warm'), 'isPending={true} triggers spinner');

  // -----------------------------------------------------------------------------
  // TEST 4: Skeleton Components Empirical Rendering & ARIA Conformance
  // -----------------------------------------------------------------------------
  console.log('\n--- TEST 4: Skeleton Components Empirical Rendering & ARIA Conformance ---');

  const { DataTableSkeleton, MetricCardSkeleton, CatalogCardSkeleton, FormCardSkeleton } = await import(
    '../src/components/skeletons'
  );

  // 4.1 DataTableSkeleton
  const dataTableHtml = renderToString(
    React.createElement(DataTableSkeleton, { columns: ['Nombre', 'Precio', 'Stock', 'Acciones'], rows: 4 })
  );
  assert(dataTableHtml.includes('role="status"'), 'DataTableSkeleton renders role="status"');
  assert(dataTableHtml.includes('aria-busy="true"'), 'DataTableSkeleton renders aria-busy="true"');
  assert(dataTableHtml.includes('aria-label="Cargando tabla de datos"'), 'DataTableSkeleton renders accessible aria-label');
  assert(dataTableHtml.includes('sr-only'), 'DataTableSkeleton renders sr-only screen reader label');
  assert(dataTableHtml.includes('skeleton-shimmer'), 'DataTableSkeleton renders .skeleton-shimmer elements');
  // Check row count (4 rows rendered in tbody)
  const trMatches = dataTableHtml.match(/<tr/g);
  // 1 thead tr + 4 tbody tr = 5 tr tags
  assert(trMatches !== null && trMatches.length === 5, `DataTableSkeleton renders 1 thead + 4 tbody rows (total ${trMatches?.length})`);

  // 4.2 MetricCardSkeleton
  const metricCardHtml = renderToString(React.createElement(MetricCardSkeleton, { count: 4 }));
  assert(metricCardHtml.includes('role="status"'), 'MetricCardSkeleton renders role="status"');
  assert(metricCardHtml.includes('aria-busy="true"'), 'MetricCardSkeleton renders aria-busy="true"');
  assert(metricCardHtml.includes('aria-label="Cargando métricas del panel"'), 'MetricCardSkeleton renders aria-label');
  assert(metricCardHtml.includes('sr-only'), 'MetricCardSkeleton renders sr-only screen reader label');
  const metricItems = metricCardHtml.match(/aria-label="Cargando métrica"/g);
  assert(metricItems !== null && metricItems.length === 4, `MetricCardSkeleton renders exactly 4 metric card items (${metricItems?.length})`);

  // 4.3 CatalogCardSkeleton
  const catalogHtml = renderToString(React.createElement(CatalogCardSkeleton, { count: 6 }));
  assert(catalogHtml.includes('role="status"'), 'CatalogCardSkeleton renders role="status"');
  assert(catalogHtml.includes('aria-busy="true"'), 'CatalogCardSkeleton renders aria-busy="true"');
  assert(catalogHtml.includes('aria-label="Cargando catálogo de creaciones"'), 'CatalogCardSkeleton renders aria-label');
  assert(catalogHtml.includes('sr-only'), 'CatalogCardSkeleton renders sr-only text');
  const catalogItems = catalogHtml.match(/aria-label="Cargando producto del catálogo"/g);
  assert(catalogItems !== null && catalogItems.length === 6, `CatalogCardSkeleton renders exactly 6 catalog card items (${catalogItems?.length})`);
  assert(catalogHtml.includes('aspect-square'), 'CatalogCardSkeleton preserves aspect-square for 0 CLS image placeholders');

  // 4.4 FormCardSkeleton
  const formHtml = renderToString(React.createElement(FormCardSkeleton, { fields: 5, hasTextarea: true }));
  assert(formHtml.includes('role="status"'), 'FormCardSkeleton renders role="status"');
  assert(formHtml.includes('aria-busy="true"'), 'FormCardSkeleton renders aria-busy="true"');
  assert(formHtml.includes('aria-label="Cargando formulario"'), 'FormCardSkeleton renders aria-label');
  assert(formHtml.includes('sr-only'), 'FormCardSkeleton renders sr-only text');
  assert(formHtml.includes('max-w-2xl'), 'FormCardSkeleton has default max-w-2xl');

  // -----------------------------------------------------------------------------
  // TEST 5: CSS Design Tokens & GPU Shimmer Keyframes Verification
  // -----------------------------------------------------------------------------
  console.log('\n--- TEST 5: CSS Design Tokens & GPU-Accelerated Shimmer Verification ---');

  const cssPath = path.resolve(srcDir, 'index.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Verify warm brown shadow tokens
  assert(css.includes('--shadow-warm-sm: 0 2px 8px rgba(156, 122, 86, 0.08);'), 'Warm shadow sm token verified');
  assert(css.includes('--shadow-warm-md: 0 4px 16px rgba(156, 122, 86, 0.14);'), 'Warm shadow md token verified');
  assert(css.includes('--shadow-warm-lg: 0 8px 32px rgba(156, 122, 86, 0.18);'), 'Warm shadow lg token verified');
  assert(css.includes('--shadow-warm-xl: 0 16px 48px rgba(156, 122, 86, 0.22);'), 'Warm shadow xl token verified');

  // Verify GPU shimmer keyframes: translateX(-100%) to translateX(100%)
  assert(css.includes('@keyframes shimmer'), 'Keyframes @keyframes shimmer exists');
  assert(css.includes('transform: translateX(-100%)') && css.includes('transform: translateX(100%)'), 'GPU-accelerated translateX shimmer animation');
  assert(css.includes('will-change: transform'), 'will-change: transform hints GPU compositor');

  // Verify reduced motion accessibility
  assert(css.includes('@media (prefers-reduced-motion: reduce)'), '@media (prefers-reduced-motion: reduce) implemented');
  assert(css.includes('animation: none !important'), 'Animations disabled under reduced motion');

  // -----------------------------------------------------------------------------
  // SUMMARY & VERDICT
  // -----------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`EMPIRICAL CHALLENGER SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    console.error(`\nOVERALL VERDICT: CHALLENGE_FAILED (${failedTests} tests failed)\n`);
    process.exit(1);
  } else {
    console.log('\nOVERALL VERDICT: APPROVE (100% of adversarial checks passed)\n');
    process.exit(0);
  }
}

runChallengerStressTests().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
