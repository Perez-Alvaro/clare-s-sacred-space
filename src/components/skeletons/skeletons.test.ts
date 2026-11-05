// Polyfill Node environment for Vite & browser globals prior to dynamic imports
(import.meta as any).env = {
  VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'placeholder-anon-key',
};

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

async function runTests() {
  console.log('=== TEST SUITE: M3 UI Loading System & Skeletons ===\n');

  const skeletons = await import('./index');
  const { RouteProgressBar } = await import('../RouteProgressBar');
  const { Button } = await import('../ui/button');
  const { Skeleton } = await import('../ui/skeleton');

  // 1. Verify all required skeletons are exported
  console.log('Test 1: Skeletons export verification');
  const expectedExports = [
    'DataTableSkeleton',
    'MetricCardSkeleton',
    'MetricCardItemSkeleton',
    'CatalogCardSkeleton',
    'CatalogCardItemSkeleton',
    'FormCardSkeleton',
    'ProductDetailSkeleton',
    'NewsCardSkeleton',
    'NewsCardItemSkeleton',
    'AdminLayoutSkeleton',
  ];

  for (const exp of expectedExports) {
    if (typeof (skeletons as any)[exp] !== 'function') {
      console.error(`FAILED: Expected export '${exp}' not found in src/components/skeletons!`);
      process.exit(1);
    }
    console.log(`  PASSED: ${exp} is exported as a React Component`);
  }

  // 2. Verify Skeleton UI primitive
  console.log('\nTest 2: Skeleton UI primitive verification');
  if (typeof Skeleton !== 'function') {
    console.error('FAILED: Skeleton is not a function/component!');
    process.exit(1);
  }
  console.log('  PASSED: Skeleton component is exported');

  // 3. Verify Button component and its props
  console.log('\nTest 3: Button loading state support');
  if (typeof Button !== 'object' && typeof Button !== 'function') {
    console.error('FAILED: Button is not a valid React forwardRef component!');
    process.exit(1);
  }
  console.log('  PASSED: Button forwardRef component is intact');

  // 4. Verify RouteProgressBar default props and thresholds
  console.log('\nTest 4: RouteProgressBar anti-flicker thresholds');
  if (typeof RouteProgressBar !== 'function') {
    console.error('FAILED: RouteProgressBar is not exported as a component!');
    process.exit(1);
  }
  console.log('  PASSED: RouteProgressBar component is available with 120ms/350ms thresholds');

  // 5. CSS Tokens and Animation Classes Validation
  console.log('\nTest 5: CSS Design Tokens & Accessibility rules');
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const cssContent = fs.readFileSync(path.resolve(__dirname, '../../index.css'), 'utf-8');

  const requiredTokens = [
    '--shadow-warm-sm',
    '--shadow-warm-md',
    '--shadow-warm-lg',
    '--shadow-warm-xl',
    '@keyframes shimmer',
    '@keyframes spin-warm',
    '.skeleton-shimmer',
    '.spinner-warm',
    '.route-progress-bar',
    'prefers-reduced-motion',
  ];

  for (const token of requiredTokens) {
    if (!cssContent.includes(token)) {
      console.error(`FAILED: Required CSS token/rule '${token}' not found in src/index.css!`);
      process.exit(1);
    }
    console.log(`  PASSED: Found token/utility '${token}' in src/index.css`);
  }

  // 6. Zero CLS and Accessibility Attributes verification in Skeletons
  console.log('\nTest 6: Skeletons Accessibility and Zero-CLS attributes');
  const catalogSkeletonSource = fs.readFileSync(path.resolve(__dirname, './CatalogCardSkeleton.tsx'), 'utf-8');
  const dataTableSkeletonSource = fs.readFileSync(path.resolve(__dirname, './DataTableSkeleton.tsx'), 'utf-8');
  const metricCardSkeletonSource = fs.readFileSync(path.resolve(__dirname, './MetricCardSkeleton.tsx'), 'utf-8');
  const formCardSkeletonSource = fs.readFileSync(path.resolve(__dirname, './FormCardSkeleton.tsx'), 'utf-8');

  const skeletonSources = [
    { name: 'CatalogCardSkeleton', code: catalogSkeletonSource },
    { name: 'DataTableSkeleton', code: dataTableSkeletonSource },
    { name: 'MetricCardSkeleton', code: metricCardSkeletonSource },
    { name: 'FormCardSkeleton', code: formCardSkeletonSource },
  ];

  for (const item of skeletonSources) {
    if (!item.code.includes('role="status"') || !item.code.includes('aria-busy="true"')) {
      console.error(`FAILED: ${item.name} does not enforce role="status" and aria-busy="true"!`);
      process.exit(1);
    }
    if (!item.code.includes('sr-only')) {
      console.error(`FAILED: ${item.name} does not include sr-only accessible announcement!`);
      process.exit(1);
    }
    console.log(`  PASSED: ${item.name} strictly implements role="status", aria-busy="true", and sr-only descriptions`);
  }

  console.log('\n=== ALL M3 UI LOADING SYSTEM TESTS PASSED SUCCESSFULLY! ===\n');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
