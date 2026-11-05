import { queryKeys } from '../lib/queryClient';
import type { Variant, VariantOption, DashboardMetrics } from './useQueries';

console.log('=== TEST 1: Variant Transformation & Edge Case Stress Testing ===');

// Simulate the mapping logic from useProductVariants / useProductDetail
function transformRawVariants(rawVariants: any[]): Variant[] {
  return rawVariants
    .map((v: any) => ({
      id: v.id,
      name: v.name,
      type: v.type,
      sort_order: v.sort_order ?? 0,
      options: ([...(v.product_variant_options || [])] as VariantOption[]).sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      ),
    }))
    .filter((v: Variant) => v.options.length > 0);
}

// Edge Case 1: Variant with unordered options and null sort_orders
const rawVariantsCase1 = [
  {
    id: 'var-1',
    name: 'Talle',
    type: 'single_choice',
    sort_order: 1,
    product_variant_options: [
      { id: 'opt-c', label: 'L', price_modifier: 100, sort_order: 3 },
      { id: 'opt-a', label: 'S', price_modifier: 0, sort_order: null },
      { id: 'opt-b', label: 'M', price_modifier: 50, sort_order: 2 },
    ],
  },
];

const transformed1 = transformRawVariants(rawVariantsCase1);
console.log('Case 1 Transformed length (expected 1):', transformed1.length);
console.log('Case 1 Options ordering:', transformed1[0].options.map(o => o.label));

if (transformed1[0].options[0].label !== 'S' || transformed1[0].options[1].label !== 'M' || transformed1[0].options[2].label !== 'L') {
  console.error('FAILED: Variant options not sorted properly with null sort_order fallback!');
  process.exit(1);
}
console.log('PASSED: Null sort_order gracefully treated as 0 and sorted ascending.');

// Edge Case 2: Variant with null product_variant_options or empty array
const rawVariantsCase2 = [
  { id: 'var-empty-1', name: 'Color', type: 'single_choice', sort_order: 0, product_variant_options: null },
  { id: 'var-empty-2', name: 'Material', type: 'single_choice', sort_order: 1, product_variant_options: [] },
  {
    id: 'var-valid',
    name: 'Diseño',
    type: 'single_choice',
    sort_order: 2,
    product_variant_options: [{ id: 'opt-1', label: 'Default', price_modifier: 0, sort_order: 1 }],
  },
];

const transformed2 = transformRawVariants(rawVariantsCase2);
console.log('Case 2 Filtered variants count (expected 1):', transformed2.length);
if (transformed2.length !== 1 || transformed2[0].id !== 'var-valid') {
  console.error('FAILED: Empty or null variant options were not filtered out!');
  process.exit(1);
}
console.log('PASSED: Empty/null variant options filtered out, preventing empty UI selectors.');


// Test 2: Dashboard Metrics Parsing Robustness
console.log('\n=== TEST 2: Dashboard Metrics Parsing Robustness ===');

function parseMetricsResponse(data: any): DashboardMetrics {
  return {
    products_count: Number(data.products_count) || 0,
    orders_count: Number(data.orders_count) || 0,
    customers_count: Number(data.customers_count) || 0,
    total_revenue: Number(data.total_revenue) || 0,
  };
}

// Case A: String numbers from Postgres SQL
const pgResponse = {
  products_count: '42',
  orders_count: '180',
  customers_count: '95',
  total_revenue: '12540.50',
};
const parsedA = parseMetricsResponse(pgResponse);
console.log('Parsed PG response:', parsedA);
if (parsedA.products_count !== 42 || parsedA.total_revenue !== 12540.5) {
  console.error('FAILED: String number conversion failed!');
  process.exit(1);
}
console.log('PASSED: SQL stringified integers and decimals correctly parsed.');

// Case B: Null / corrupt values
const corruptResponse = {
  products_count: null,
  orders_count: undefined,
  customers_count: 'invalid',
  total_revenue: NaN,
};
const parsedB = parseMetricsResponse(corruptResponse);
console.log('Parsed corrupt response:', parsedB);
if (parsedB.products_count !== 0 || parsedB.orders_count !== 0 || parsedB.customers_count !== 0 || parsedB.total_revenue !== 0) {
  console.error('FAILED: Corrupt values did not fallback to 0!');
  process.exit(1);
}
console.log('PASSED: Corrupt/null/NaN metrics safely defaulted to 0.');

// Test 3: Dashboard Fallback Reduction
console.log('\n=== TEST 3: Dashboard Client-Side Fallback Total Calculation ===');
const mockOrders = [
  { id: '1', total: '150.50' },
  { id: '2', total: 200 },
  { id: '3', total: null },
  { id: '4', total: 'invalid' },
];
const fallbackRevenue = mockOrders.reduce(
  (sum: number, o: any) => sum + (Number(o.total) || 0),
  0
);
console.log('Fallback computed revenue:', fallbackRevenue, '(expected 350.5)');
if (fallbackRevenue !== 350.5) {
  console.error('FAILED: Fallback total calculation returned wrong result or NaN!');
  process.exit(1);
}
console.log('PASSED: Fallback revenue calculation handles mixed types, nulls, and strings.');

console.log('\n=== ALL HOOK & TRANSFORMATION TESTS PASSED! ===');
process.exit(0);
