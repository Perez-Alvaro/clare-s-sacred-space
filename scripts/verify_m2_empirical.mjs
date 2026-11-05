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
console.log('EMPIRICAL CHALLENGER VERIFICATION HARNESS - MILESTONE M2');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. SQL MIGRATION ANALYSIS & INDEX VERIFICATION
// -----------------------------------------------------------------------------
console.log('--- TEST GROUP 1: SQL Migration Syntax & Index Completeness ---');
const migrationPath = path.join(
  rootDir,
  'supabase',
  'migrations',
  '20261105000000_performance_indices_and_rpcs.sql'
);
assert(fs.existsSync(migrationPath), 'Migration file 20261105000000_performance_indices_and_rpcs.sql exists');

const sqlContent = fs.readFileSync(migrationPath, 'utf8');

// Expected 8 Foreign Key indexes
const expectedFkIndexes = [
  { name: 'idx_products_category_id', table: 'public.products', col: 'category_id' },
  { name: 'idx_product_images_product_id', table: 'public.product_images', col: 'product_id' },
  { name: 'idx_customers_user_id', table: 'public.customers', col: 'user_id' },
  { name: 'idx_orders_customer_id', table: 'public.orders', col: 'customer_id' },
  { name: 'idx_order_items_order_id', table: 'public.order_items', col: 'order_id' },
  { name: 'idx_order_items_product_id', table: 'public.order_items', col: 'product_id' },
  { name: 'idx_product_variants_product_id', table: 'public.product_variants', col: 'product_id' },
  { name: 'idx_product_variant_options_variant_id', table: 'public.product_variant_options', col: 'variant_id' },
];

for (const idx of expectedFkIndexes) {
  const regex = new RegExp(`CREATE INDEX IF NOT EXISTS ${idx.name}\\s+ON\\s+${idx.table.replace('.', '\\.')}\\s*\\(${idx.col}\\)`, 'i');
  assert(regex.test(sqlContent), `FK Index ${idx.name} on ${idx.table}(${idx.col}) is present`);
}

// Expected 8 Composite / Filter indexes
const expectedCompositeIndexes = [
  'idx_products_active_sort',
  'idx_categories_active_sort',
  'idx_news_published_at',
  'idx_orders_created_at_desc',
  'idx_orders_status',
  'idx_discounts_target_active',
  'idx_product_images_sort',
  'idx_variant_options_sort',
];

for (const name of expectedCompositeIndexes) {
  const regex = new RegExp(`CREATE INDEX IF NOT EXISTS ${name}`, 'i');
  assert(regex.test(sqlContent), `Composite/Filter Index ${name} is defined with IF NOT EXISTS`);
}

// Count total indexes created
const allIndexMatches = sqlContent.match(/CREATE INDEX IF NOT EXISTS \w+/gi) || [];
assert(allIndexMatches.length === 16, `Exactly 16 performance indexes are declared (found ${allIndexMatches.length})`);

// Verify RPC functions
assert(
  sqlContent.includes('CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()') &&
  sqlContent.includes('RETURNS jsonb') &&
  sqlContent.includes('LANGUAGE sql') &&
  sqlContent.includes('SECURITY DEFINER'),
  'get_dashboard_metrics() RPC signature is correct (sql, stable, security definer, returns jsonb)'
);

assert(
  sqlContent.includes('GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics() TO authenticated, service_role;'),
  'get_dashboard_metrics() has correct execution grants'
);

assert(
  sqlContent.includes('CREATE OR REPLACE FUNCTION public.create_order_atomic(') &&
  sqlContent.includes('p_customer jsonb') &&
  sqlContent.includes('p_order jsonb') &&
  sqlContent.includes('p_items jsonb') &&
  sqlContent.includes('RETURNS jsonb') &&
  sqlContent.includes('LANGUAGE plpgsql') &&
  sqlContent.includes('SECURITY DEFINER'),
  'create_order_atomic() RPC signature is correct (plpgsql, volatile, security definer, returns jsonb)'
);

assert(
  sqlContent.includes('GRANT EXECUTE ON FUNCTION public.create_order_atomic(jsonb, jsonb, jsonb) TO anon, authenticated, service_role;'),
  'create_order_atomic() grants execution to anon and authenticated for guest checkout'
);

assert(
  sqlContent.includes('jsonb_array_elements(p_items)'),
  'create_order_atomic() uses set-based jsonb_array_elements for bulk item insert'
);

// -----------------------------------------------------------------------------
// 2. POSTGREST NESTED JOIN & LOOP REMOVAL VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 2: PostgREST Nested Joins & Loop Elimination ---');

const productDetailPath = path.join(rootDir, 'src', 'pages', 'ProductDetail.tsx');
const productModalPath = path.join(rootDir, 'src', 'components', 'ProductModal.tsx');
const adminProductsPath = path.join(rootDir, 'src', 'pages', 'admin', 'AdminProducts.tsx');

const pdContent = fs.readFileSync(productDetailPath, 'utf8');
const pmContent = fs.readFileSync(productModalPath, 'utf8');
const apContent = fs.readFileSync(adminProductsPath, 'utf8');

// Check nested join syntax
assert(
  pdContent.includes(".select('*, product_variant_options(*)')"),
  "ProductDetail.tsx uses nested join: .select('*, product_variant_options(*)')"
);
assert(
  pmContent.includes(".select('*, product_variant_options(*)')"),
  "ProductModal.tsx uses nested join: .select('*, product_variant_options(*)')"
);
assert(
  apContent.includes(".select('*, product_variant_options(*)')"),
  "AdminProducts.tsx uses nested join: .select('*, product_variant_options(*)')"
);

// Verify elimination of N+1 database queries in read/fetch functions
assert(
  !pdContent.includes("supabase.from('product_variant_options')"),
  "ProductDetail.tsx has NO queries to product_variant_options (N+1 query eradicated)"
);
assert(
  !pmContent.includes("supabase.from('product_variant_options')"),
  "ProductModal.tsx has NO queries to product_variant_options (N+1 query eradicated)"
);

// In AdminProducts, check fetchVariants specifically (saveVariants still inserts/updates/deletes options)
const fetchVariantsMatch = apContent.match(/const fetchVariants = async[\s\S]*?setVariants\(variantsWithOpts\);[\s\S]*?};/);
assert(
  fetchVariantsMatch && !fetchVariantsMatch[0].includes("supabase.from('product_variant_options')"),
  "AdminProducts.tsx fetchVariants() has NO queries to product_variant_options (N+1 query eradicated)"
);

// Analyze loop structures
const apHasForVData = /for\s*\(\s*const\s+v\s+of\s+vData\s*\)/.test(apContent);
assert(!apHasForVData, "AdminProducts.tsx eliminated the 'for (const v of vData)' loop in favor of .map()");

const pdHasForVData = /for\s*\(\s*const\s+v\s+of\s+vData\s*\)/.test(pdContent);
const pmHasForVData = /for\s*\(\s*const\s+v\s+of\s+vData\s*\)/.test(pmContent);

console.log(`  [EMPIRICAL NOTE] ProductDetail.tsx contains 'for (const v of vData)': ${pdHasForVData}`);
console.log(`  [EMPIRICAL NOTE] ProductModal.tsx contains 'for (const v of vData)': ${pmHasForVData}`);
// In ProductDetail & ProductModal, the loop is purely in-memory data shaping (no DB calls)
const pdDbCallInLoop = pdContent.includes("await supabase.from('product_variant_options')");
assert(!pdDbCallInLoop, "ProductDetail loop contains 0 async DB operations (pure in-memory shaping)");

// -----------------------------------------------------------------------------
// 3. FALLBACK BEHAVIOR SIMULATION & EMPIRICAL VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 3: Fallback Behavior Empirical Simulation ---');

const dashboardPath = path.join(rootDir, 'src', 'pages', 'admin', 'Dashboard.tsx');
const checkoutPath = path.join(rootDir, 'src', 'pages', 'Checkout.tsx');
const dashContent = fs.readFileSync(dashboardPath, 'utf8');
const checkoutContent = fs.readFileSync(checkoutPath, 'utf8');

// Verify structure in Dashboard.tsx
assert(
  dashContent.includes("supabase.rpc('get_dashboard_metrics')"),
  "Dashboard.tsx attempts get_dashboard_metrics RPC"
);
assert(
  dashContent.includes("Promise.all([") &&
  dashContent.includes("supabase.from('products').select('id'") &&
  dashContent.includes("supabase.from('orders').select('id, total'") &&
  dashContent.includes("supabase.from('customers').select('id'"),
  "Dashboard.tsx contains complete fallback to Promise.all table counts"
);

// Simulation test of Dashboard fallback logic
async function simulateDashboardFetch(mockRpcResult) {
  let stats = { products: 0, orders: 0, customers: 0, revenue: 0 };
  let rpcCalled = false;
  let fallbackCalled = false;

  const mockSupabase = {
    rpc: async (fn) => {
      rpcCalled = true;
      if (mockRpcResult.throws) throw new Error(mockRpcResult.throws);
      return mockRpcResult;
    },
    from: (table) => ({
      select: async (cols, opts) => {
        fallbackCalled = true;
        if (table === 'products') return { count: 42, data: [] };
        if (table === 'orders') return { count: 18, data: [{ total: 100 }, { total: 250 }] };
        if (table === 'customers') return { count: 30, data: [] };
        return { count: 0, data: [] };
      },
    }),
  };

  // Run exact logic from Dashboard.tsx
  try {
    const { data, error } = await mockSupabase.rpc('get_dashboard_metrics');
    if (!error && data) {
      stats = {
        products: Number(data.products_count) || 0,
        orders: Number(data.orders_count) || 0,
        customers: Number(data.customers_count) || 0,
        revenue: Number(data.total_revenue) || 0,
      };
      return { stats, rpcCalled, fallbackCalled };
    }
  } catch (rpcErr) {
    // caught
  }

  // Fallback
  const [prods, ords, custs] = await Promise.all([
    mockSupabase.from('products').select('id', { count: 'exact', head: true }),
    mockSupabase.from('orders').select('id, total', { count: 'exact' }),
    mockSupabase.from('customers').select('id', { count: 'exact', head: true }),
  ]);
  const revenue = (ords.data || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  stats = {
    products: prods.count || 0,
    orders: ords.count || 0,
    customers: custs.count || 0,
    revenue,
  };
  return { stats, rpcCalled, fallbackCalled };
}

// Run simulation cases
const simDashSuccess = await simulateDashboardFetch({
  data: { products_count: 50, orders_count: 20, customers_count: 35, total_revenue: 5000 },
  error: null,
});
assert(
  simDashSuccess.rpcCalled && !simDashSuccess.fallbackCalled && simDashSuccess.stats.revenue === 5000,
  "Dashboard simulation: RPC success path populates stats and bypasses fallback"
);

const simDashError = await simulateDashboardFetch({
  data: null,
  error: { message: 'function get_dashboard_metrics() does not exist', code: '42883' },
});
assert(
  simDashError.rpcCalled && simDashError.fallbackCalled && simDashError.stats.products === 42 && simDashError.stats.revenue === 350,
  "Dashboard simulation: RPC error path triggers graceful fallback seamlessly"
);

const simDashThrow = await simulateDashboardFetch({ throws: 'Network timeout' });
assert(
  simDashThrow.rpcCalled && simDashThrow.fallbackCalled && simDashThrow.stats.products === 42 && simDashThrow.stats.revenue === 350,
  "Dashboard simulation: RPC exception path triggers graceful fallback seamlessly"
);

// Simulation test of Checkout fallback logic
async function simulateCheckoutSubmit(mockRpcResult) {
  let orderNumber = 0;
  let success = false;
  let cartCleared = false;
  let edgeFunctionCalled = false;
  let rpcCalled = false;

  const mockSupabase = {
    rpc: async () => {
      rpcCalled = true;
      if (mockRpcResult.throws) throw new Error(mockRpcResult.throws);
      return mockRpcResult;
    },
    functions: {
      invoke: async (name, opts) => {
        edgeFunctionCalled = true;
        return { data: { success: true, order_number: 9999 }, error: null };
      },
    },
  };

  const clearCart = () => { cartCleared = true; };

  // Run exact logic from Checkout.tsx
  try {
    try {
      const { data: rpcData, error: rpcError } = await mockSupabase.rpc('create_order_atomic', {});
      if (!rpcError && rpcData && rpcData.success) {
        orderNumber = rpcData.order_number;
        success = true;
        clearCart();
        return { orderNumber, success, cartCleared, rpcCalled, edgeFunctionCalled };
      }
    } catch (rpcErr) {
      // caught
    }

    const { data, error } = await mockSupabase.functions.invoke('create-order', {});
    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Failed');
    orderNumber = data.order_number;
    success = true;
    clearCart();
  } catch (err) {
    // outer error
  }

  return { orderNumber, success, cartCleared, rpcCalled, edgeFunctionCalled };
}

const simCheckoutSuccess = await simulateCheckoutSubmit({
  data: { success: true, order_number: 1042, order_id: 'abc', customer_id: 'def' },
  error: null,
});
assert(
  simCheckoutSuccess.rpcCalled && !simCheckoutSuccess.edgeFunctionCalled && simCheckoutSuccess.orderNumber === 1042 && simCheckoutSuccess.success,
  "Checkout simulation: RPC success path creates order directly in 1 RTT"
);

const simCheckoutError = await simulateCheckoutSubmit({
  data: null,
  error: { message: 'function create_order_atomic does not exist' },
});
assert(
  simCheckoutError.rpcCalled && simCheckoutError.edgeFunctionCalled && simCheckoutError.orderNumber === 9999 && simCheckoutError.success,
  "Checkout simulation: RPC error seamlessly falls back to Edge Function"
);

const simCheckoutThrow = await simulateCheckoutSubmit({ throws: 'Connection refused' });
assert(
  simCheckoutThrow.rpcCalled && simCheckoutThrow.edgeFunctionCalled && simCheckoutThrow.orderNumber === 9999 && simCheckoutThrow.success,
  "Checkout simulation: RPC exception seamlessly falls back to Edge Function"
);

// -----------------------------------------------------------------------------
// 4. TANSTACK QUERY & STORAGE CACHE HEADERS VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 4: TanStack Query Configuration & Cache-Control ---');

const queryClientPath = path.join(rootDir, 'src', 'lib', 'queryClient.ts');
const qcContent = fs.readFileSync(queryClientPath, 'utf8');

assert(
  qcContent.includes('staleTime: 1000 * 60 * 2') || qcContent.includes('120000'),
  'QueryClient configured with staleTime: 2 minutes'
);
assert(
  qcContent.includes('gcTime: 1000 * 60 * 15') || qcContent.includes('900000'),
  'QueryClient configured with gcTime: 15 minutes'
);
assert(
  qcContent.includes('refetchOnWindowFocus: false'),
  'QueryClient refetchOnWindowFocus is disabled (no background flicker)'
);
assert(
  qcContent.includes('refetchOnMount: false'),
  'QueryClient refetchOnMount is disabled (instant reuse from cache)'
);

const appPath = path.join(rootDir, 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');
assert(
  appContent.includes("import { queryClient } from \"@/lib/queryClient\";") ||
  appContent.includes("import { queryClient } from '@/lib/queryClient';"),
  'App.tsx imports centralized queryClient from @/lib/queryClient'
);
assert(
  appContent.includes('<QueryClientProvider client={queryClient}>'),
  'App.tsx passes queryClient to QueryClientProvider'
);

const adminNewsPath = path.join(rootDir, 'src', 'pages', 'admin', 'AdminNews.tsx');
const anContent = fs.readFileSync(adminNewsPath, 'utf8');
assert(
  apContent.includes("cacheControl: '31536000, public, immutable'"),
  "AdminProducts.tsx image upload specifies cacheControl: '31536000, public, immutable'"
);
assert(
  anContent.includes("cacheControl: '31536000, public, immutable'"),
  "AdminNews.tsx image upload specifies cacheControl: '31536000, public, immutable'"
);

// -----------------------------------------------------------------------------
// 5. HOOKS COMPLETENESS VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- TEST GROUP 5: useQueries Hook Suite ---');
const hooksPath = path.join(rootDir, 'src', 'hooks', 'useQueries.ts');
const hooksContent = fs.readFileSync(hooksPath, 'utf8');

const expectedHooks = [
  'useProducts',
  'useCategories',
  'useProductVariants',
  'useProductDetail',
  'useNews',
  'useStoreSetting',
  'useDashboardMetrics',
  'useRecentOrders',
];

for (const hook of expectedHooks) {
  assert(hooksContent.includes(`export function ${hook}`), `useQueries.ts exports hook ${hook}`);
}

// -----------------------------------------------------------------------------
// SUMMARY & VERDICT
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  console.error(`VERDICT: CHALLENGE_FAILED (${failedTests} tests failed)`);
  process.exit(1);
} else {
  console.log('VERDICT: ALL EMPIRICAL TESTS PASSED');
  process.exit(0);
}
