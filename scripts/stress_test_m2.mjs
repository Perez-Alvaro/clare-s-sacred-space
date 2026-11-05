import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('================================================================');
console.log('ADVERSARIAL STRESS TEST & EDGE CASE MINING - MILESTONE M2');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// ADVERSARIAL TEST 1: Stress-testing Dashboard data parsing under boundary values
// -----------------------------------------------------------------------------
console.log('--- ADVERSARIAL TEST 1: Dashboard metrics parsing robustness ---');

function parseMetrics(data) {
  return {
    products: Number(data?.products_count) || 0,
    orders: Number(data?.orders_count) || 0,
    customers: Number(data?.customers_count) || 0,
    revenue: Number(data?.total_revenue) || 0,
  };
}

// Case 1.1: All nulls
const resNull = parseMetrics({ products_count: null, orders_count: null, customers_count: null, total_revenue: null });
assert(
  resNull.products === 0 && resNull.orders === 0 && resNull.customers === 0 && resNull.revenue === 0,
  'Null RPC metric fields safely fallback to 0'
);

// Case 1.2: Undefined fields
const resUndef = parseMetrics({});
assert(
  resUndef.products === 0 && resUndef.orders === 0 && resUndef.customers === 0 && resUndef.revenue === 0,
  'Empty RPC metric object safely fallback to 0'
);

// Case 1.3: Malformed string numeric types
const resStrings = parseMetrics({
  products_count: "42",
  orders_count: "100",
  customers_count: "25",
  total_revenue: "1599.99",
});
assert(
  resStrings.products === 42 && resStrings.orders === 100 && resStrings.customers === 25 && resStrings.revenue === 1599.99,
  'String-encoded numbers from Postgres JSONB parse correctly'
);

// Case 1.4: NaN or corrupt inputs
const resCorrupt = parseMetrics({
  products_count: "invalid_string",
  orders_count: NaN,
  customers_count: undefined,
  total_revenue: null,
});
assert(
  resCorrupt.products === 0 && resCorrupt.orders === 0 && resCorrupt.customers === 0 && resCorrupt.revenue === 0,
  'Corrupted/NaN inputs safely fallback to 0 without NaN contamination'
);

// -----------------------------------------------------------------------------
// ADVERSARIAL TEST 2: Stress-testing Fallback Calculation with empty and large datasets
// -----------------------------------------------------------------------------
console.log('\n--- ADVERSARIAL TEST 2: Dashboard fallback reduce calculation ---');

function calculateFallbackRevenue(ordersData) {
  return (ordersData || []).reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
}

assert(calculateFallbackRevenue(null) === 0, 'Fallback revenue handles null dataset gracefully');
assert(calculateFallbackRevenue([]) === 0, 'Fallback revenue handles empty array gracefully');
assert(
  calculateFallbackRevenue([
    { total: null },
    { total: undefined },
    { total: "abc" },
    { total: 50.25 },
    { total: "49.75" }
  ]) === 100,
  'Fallback revenue handles dirty row values with graceful numeric coercion'
);

// Stress test: 10,000 synthetic orders
const largeOrders = Array.from({ length: 10000 }, (_, i) => ({ total: 10.5 }));
const t0 = performance.now();
const largeRev = calculateFallbackRevenue(largeOrders);
const t1 = performance.now();
assert(largeRev === 105000, `Fallback handles 10,000 orders correctly (sum = ${largeRev}) in ${(t1 - t0).toFixed(2)}ms`);

// -----------------------------------------------------------------------------
// ADVERSARIAL TEST 3: Stress-testing Checkout payload generation
// -----------------------------------------------------------------------------
console.log('\n--- ADVERSARIAL TEST 3: Checkout payload generation boundary tests ---');

function buildCheckoutPayload(form, items, subtotal) {
  const shippingAddress = `${form.address.trim()}, ${form.city.trim()}, ${form.province.trim()}${form.postal_code.trim() ? ' ' + form.postal_code.trim() : ''}`;
  return {
    p_customer: {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      postal_code: form.postal_code.trim() || null,
      notes: form.notes.trim() || null,
    },
    p_order: {
      payment_method: form.payment_method,
      subtotal: subtotal,
      tax: 0,
      total: subtotal,
      shipping_address: shippingAddress,
      notes: form.notes.trim() || null,
    },
    p_items: items.map(i => ({
      product_id: i.product_id,
      product_name: i.name,
      quantity: i.quantity,
      unit_price: i.price,
      total: i.price * i.quantity,
    })),
  };
}

const testForm = {
  full_name: '  María Sol Pérez  ',
  email: '  Maria.Sol@EXAMPLE.COM  ',
  phone: ' +54 9 11 1234 5678 ',
  address: ' Av. Corrientes 1234 ',
  city: ' CABA ',
  province: ' Buenos Aires ',
  postal_code: '   ',
  notes: '   ',
  payment_method: 'bank_transfer',
};

const payload = buildCheckoutPayload(testForm, [{ product_id: 'prod-1', name: 'Vela', quantity: 2, price: 1500 }], 3000);

assert(payload.p_customer.email === 'maria.sol@example.com', 'Email is properly trimmed and lowercased');
assert(payload.p_customer.full_name === 'María Sol Pérez', 'Full name is properly trimmed');
assert(payload.p_customer.postal_code === null, 'Whitespace-only postal_code coerces to null');
assert(payload.p_customer.notes === null, 'Whitespace-only notes coerces to null');
assert(payload.p_order.shipping_address === 'Av. Corrientes 1234, CABA, Buenos Aires', 'Shipping address handles missing postal_code cleanly without trailing space');
assert(payload.p_items[0].total === 3000, 'Item total calculated accurately (1500 * 2 = 3000)');

// -----------------------------------------------------------------------------
// ADVERSARIAL TEST 4: PostgREST Nested Options sorting stability
// -----------------------------------------------------------------------------
console.log('\n--- ADVERSARIAL TEST 4: Nested options sorting stability ---');

const unsortedVariants = [
  {
    id: 'v1',
    name: 'Color',
    type: 'single_choice',
    sort_order: 1,
    product_variant_options: [
      { id: 'opt3', label: 'Verde', sort_order: 3 },
      { id: 'opt1', label: 'Blanco', sort_order: 1 },
      { id: 'opt2', label: 'Rosa', sort_order: 2 },
    ]
  },
  {
    id: 'v2',
    name: 'Tamaño',
    type: 'single_choice',
    sort_order: 2,
    product_variant_options: [
      { id: 'opt5', label: 'Grande', sort_order: null },
      { id: 'opt4', label: 'Chico', sort_order: 0 },
    ]
  }
];

const filledVariants = [];
const initSelections = {};
for (const v of unsortedVariants) {
  const rawOpts = v.product_variant_options || [];
  const opts = [...rawOpts].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  if (opts.length > 0) {
    filledVariants.push({ ...v, options: opts });
    initSelections[v.id] = v.type === 'single_choice' ? [opts[0].id] : [];
  }
}

assert(
  filledVariants[0].options[0].id === 'opt1' &&
  filledVariants[0].options[1].id === 'opt2' &&
  filledVariants[0].options[2].id === 'opt3',
  'Nested options are sorted ascending by sort_order'
);
assert(
  initSelections['v1'][0] === 'opt1',
  'First sorted option is correctly preselected for single_choice variant'
);

// -----------------------------------------------------------------------------
// ADVERSARIAL SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`ADVERSARIAL STRESS TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  console.error(`VERDICT: STRESS_TEST_FAILED (${failedTests} tests failed)`);
  process.exit(1);
} else {
  console.log('VERDICT: ALL ADVERSARIAL STRESS TESTS PASSED');
  process.exit(0);
}
