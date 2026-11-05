import { queryClient, queryKeys } from './queryClient';

// Test 1: Verify QueryClient Default Options
console.log('=== TEST 1: QueryClient Default Options ===');
const defaultOptions = queryClient.getDefaultOptions().queries;
console.log('Default queries options:', JSON.stringify(defaultOptions, null, 2));

const expectedDefaults = {
  staleTime: 120000,
  gcTime: 900000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 1,
};

let pass = true;
for (const [key, val] of Object.entries(expectedDefaults)) {
  const actual = (defaultOptions as any)?.[key];
  if (actual !== val) {
    console.error(`FAILED: ${key} expected ${val}, got ${actual}`);
    pass = false;
  } else {
    console.log(`PASSED: ${key} === ${val}`);
  }
}

if (!pass) {
  process.exit(1);
}

// Test 2: Verify QueryKeys Factory
console.log('\n=== TEST 2: QueryKeys Factory Integrity & Uniqueness ===');
const keySamples = [
  { path: 'products.all', key: queryKeys.products.all, expected: ['products'] },
  { path: 'products.active', key: queryKeys.products.active(), expected: ['products', 'active'] },
  { path: 'products.detail("p-1")', key: queryKeys.products.detail('p-1'), expected: ['products', 'detail', 'p-1'] },
  { path: 'products.variants("p-1")', key: queryKeys.products.variants('p-1'), expected: ['products', 'variants', 'p-1'] },
  { path: 'categories.all', key: queryKeys.categories.all, expected: ['categories'] },
  { path: 'categories.active', key: queryKeys.categories.active(), expected: ['categories', 'active'] },
  { path: 'news.all', key: queryKeys.news.all, expected: ['news'] },
  { path: 'news.published', key: queryKeys.news.published(), expected: ['news', 'published'] },
  { path: 'news.setting("datos-bancarios")', key: queryKeys.news.setting('datos-bancarios'), expected: ['news', 'setting', 'datos-bancarios'] },
  { path: 'orders.all', key: queryKeys.orders.all, expected: ['orders'] },
  { path: 'orders.recent', key: queryKeys.orders.recent(), expected: ['orders', 'recent'] },
  { path: 'orders.list()', key: queryKeys.orders.list(), expected: ['orders', 'list', 'all'] },
  { path: 'orders.list("pending")', key: queryKeys.orders.list('pending'), expected: ['orders', 'list', 'pending'] },
  { path: 'customers.all', key: queryKeys.customers.all, expected: ['customers'] },
  { path: 'admin.metrics', key: queryKeys.admin.metrics, expected: ['admin', 'metrics'] },
];

const serializedSet = new Set<string>();
for (const sample of keySamples) {
  const serialized = JSON.stringify(sample.key);
  const expectedSerialized = JSON.stringify(sample.expected);
  if (serialized !== expectedSerialized) {
    console.error(`FAILED: ${sample.path} generated ${serialized}, expected ${expectedSerialized}`);
    process.exit(1);
  }
  if (serializedSet.has(serialized)) {
    console.error(`FAILED: Duplicate key generated across paths: ${serialized}`);
    process.exit(1);
  }
  serializedSet.add(serialized);
  console.log(`PASSED: ${sample.path} -> ${serialized}`);
}

// Test 3: Cache Invalidation Hierarchy Behavior
console.log('\n=== TEST 3: Cache Invalidation Hierarchy Behavior ===');
queryClient.setQueryData(queryKeys.products.active(), [{ id: 'p1' }]);
queryClient.setQueryData(queryKeys.products.detail('p1'), { id: 'p1' });
queryClient.setQueryData(queryKeys.products.variants('p1'), [{ id: 'v1' }]);
queryClient.setQueryData(queryKeys.categories.active(), [{ id: 'c1' }]);

queryClient.invalidateQueries({ queryKey: queryKeys.products.all });

const pActive = queryClient.getQueryState(queryKeys.products.active());
const pDetail = queryClient.getQueryState(queryKeys.products.detail('p1'));
const pVariants = queryClient.getQueryState(queryKeys.products.variants('p1'));
const cActive = queryClient.getQueryState(queryKeys.categories.active());

console.log('products.active isInvalidated:', pActive?.isInvalidated, '(expected: true)');
console.log('products.detail isInvalidated:', pDetail?.isInvalidated, '(expected: true)');
console.log('products.variants isInvalidated:', pVariants?.isInvalidated, '(expected: true)');
console.log('categories.active isInvalidated:', cActive?.isInvalidated, '(expected: false)');

if (!pActive?.isInvalidated || !pDetail?.isInvalidated || !pVariants?.isInvalidated || cActive?.isInvalidated) {
  console.error('FAILED: Hierarchical query invalidation failed!');
  process.exit(1);
}

// Test 4: Stale Time & Cache Lifetime Verification
console.log('\n=== TEST 4: Query State Freshness Check ===');
queryClient.setQueryData(queryKeys.categories.active(), [{ id: 'c2' }]);
const catState = queryClient.getQueryState(queryKeys.categories.active());
const dataUpdatedAt = catState?.dataUpdatedAt || 0;
const now = Date.now();
const age = now - dataUpdatedAt;
const isStale = age > (defaultOptions?.staleTime as number);
console.log(`Data age: ${age}ms, stale threshold: ${defaultOptions?.staleTime}ms, isStale: ${isStale} (expected: false)`);

if (isStale) {
  console.error('FAILED: Cache immediately marked stale!');
  process.exit(1);
}

console.log('\n=== ALL QUERY CLIENT EMPIRICAL TESTS PASSED! ===');
process.exit(0);
