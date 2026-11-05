# Project: Clare's Sacred Space - Performance Audit & Blank Screen Eradication

## Architecture
- **Frontend Stack**: React 18, TypeScript, Vite, React Router DOM v6.30.1, TanStack Query v5.83.0, Tailwind CSS, Lucide React.
- **Backend & Database**: Supabase PostgreSQL 14+, Row Level Security (RLS), Supabase Storage (`product-images` bucket), Supabase Edge Functions.
- **Data Flow**:
  1. Frontend routes utilize TanStack Query custom hooks (`useQuery`, `useMutation`) with standard query keys.
  2. TanStack Query manages caching (`staleTime: 2m`, `gcTime: 15m`), preventing repeated network roundtrips during internal navigation.
  3. Relational data is fetched via embedded PostgREST joins in a single HTTP request (resolving products, variants, options, and images).
  4. Complex calculations (dashboard revenue and order counts) and transactional multi-table writes (checkout) execute server-side via PostgreSQL RPC functions (`get_dashboard_metrics`, `create_order_atomic`).
  5. During query execution and route transitions, UI renders zero-CLS, accessible skeleton layouts with warm shimmer keyframes (`translateX`), warm shadows, and `aria-busy="true"`.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Git Synchronization | Execute `git pull origin main` to pull 19 remote commits | M1 | R1.1, survey |
| 2 | Local Branch Isolation | Create and switch to local branch `feature/perf-ui-optimization` without auto-pushing to main | M1 | R1.2, survey |
| 3 | Database Foreign Key Indexes | Generate SQL migration creating B-Tree indexes on 8 foreign keys across business tables | M2 | R2.2, survey |
| 4 | Composite & Filter Indexes | Generate SQL indexes on high-concurrency filters (`products.is_active`, `categories.is_active`, `orders.created_at`, etc.) | M2 | R2.2, survey |
| 5 | PostgREST Nested Query Optimization | Eliminate N+1 variant options loop in `ProductDetail`, `ProductModal`, `AdminProducts` | M2 | R2.1, R2.3, survey |
| 6 | Dashboard Metrics RPC | Create `public.get_dashboard_metrics` set-based RPC to replace full table scan and JS reduce | M2 | R2.3, survey |
| 7 | Atomic Checkout RPC | Create `public.create_order_atomic` RPC for transactional order creation with automatic rollback | M2 | R2.3, survey |
| 8 | Storage Assets Verification | Verify synchronous `getPublicUrl` resolution and configure aggressive cacheControl headers | M2 | R2.4, survey |
| 9 | Global TanStack Query Configuration | Configure `QueryClient` with `staleTime: 2min`, `gcTime: 15min`, `refetchOnWindowFocus: false` | M2 | R2.5, survey |
| 10 | Route & Feature TanStack Hooks | Implement centralized hooks (`useProducts`, `useCategories`, `useNews`, `useDashboardMetrics`, etc.) | M2 | R2.5, survey |
| 11 | Performance Metrics Benchmark | Measure latencies before/after database & query optimizations and document in markdown report | M2 | R2.6, survey |
| 12 | Visual Animation Tokens | Define warm shimmer keyframes, warm brown shadows (`rgba(156, 122, 86, ...)`), and reduced-motion rules | M3 | R3.1, survey |
| 13 | DataTableSkeleton | Reusable table skeleton with animated header and row placeholders in `src/components/skeletons/` | M3 | R3.2, survey |
| 14 | MetricCardSkeleton | Reusable KPI/metric card skeleton for dashboard and totals in `src/components/skeletons/` | M3 | R3.2, survey |
| 15 | CatalogCardSkeleton | Reusable grid card skeleton for products and catalog in `src/components/skeletons/` | M3 | R3.2, survey |
| 16 | FormCardSkeleton | Reusable form skeleton for product, news, category editing in `src/components/skeletons/` | M3 | R3.2, survey |
| 17 | Global Route Progress Bar | Progress bar in root layout with anti-flicker thresholds (`defaultPendingMs: 120ms`, `defaultPendingMinMs: 350ms`) | M3 | R3.3, survey |
| 18 | Button Mutation States | Add `isLoading` / `isPending` prop with micro-spinner and auto-disable to `Button` without dimension changes | M3 | R3.4, survey |
| 19 | Route-Wide Skeleton Replacement | Eradicate all 9 `<p>Cargando...</p>` and blank views across all application routes | M3 | R3.5, survey |
| 20 | Zero CLS & Accessibility | Verify `Cumulative Layout Shift = 0.0px` and `aria-busy="true"` on all loading states | M3 | R3.1, R3.5, survey |
| 21 | TypeScript Verification | Ensure `npx tsc --noEmit` passes with 0 errors | M4 | R4.1, survey |
| 22 | Automated Test Suite | Setup test runner (Vitest) in `package.json` and ensure 100% test pass rate | M4 | R4.2, survey |
| 23 | Production Build Verification | Ensure `npm run build` succeeds cleanly | M4 | R4.3, survey |
| 24 | Final Quality & Readiness Audit | Verify changes remain isolated in local branch ready for user review | M4 | R4.4, survey |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Git Synchronization & Branch Setup | R1.1, R1.2: `git pull origin main`, branch `feature/perf-ui-optimization` | none | DONE |
| M2 | Database, Backend & Query Optimization | R2.1 - R2.6: SQL migration (indexes + RPCs), Storage cache, TanStack Query client & hooks, N+1 fix, benchmark report | M1 | DONE |
| M3 | UI Loading System & Blank Screen Eradication | R3.1 - R3.5: CSS tokens, keyframes, 4+ skeleton components, route progress bar, button micro-spinners, route-wide replacement, zero CLS | M2 | DONE |
| M4 | Quality Verification & Test Suite | R4.1 - R4.4: `tsc --noEmit`, test suite execution, `npm run build`, isolation audit | M3 | DONE |

---

## Interface Contracts

### 1. Database RPC Contracts
#### `public.get_dashboard_metrics()`
- **Parameters**: None
- **Returns**: `jsonb`
  ```json
  {
    "products_count": 42,
    "orders_count": 180,
    "customers_count": 95,
    "total_revenue": 12540.00
  }
  ```
- **Security**: `SECURITY DEFINER`, `GRANT EXECUTE TO authenticated`

#### `public.create_order_atomic(p_customer jsonb, p_order jsonb, p_items jsonb)`
- **Parameters**:
  - `p_customer`: `{ email, full_name, phone, address, city, province, postal_code, notes }`
  - `p_order`: `{ payment_method, subtotal, tax, total, shipping_address, notes }`
  - `p_items`: `[{ product_id, product_name, quantity, unit_price, total }]`
- **Returns**: `jsonb`
  ```json
  {
    "success": true,
    "order_id": "uuid",
    "order_number": 1001,
    "customer_id": "uuid"
  }
  ```
- **Security**: `SECURITY DEFINER`, `GRANT EXECUTE TO anon, authenticated`

### 2. TanStack Query Client Contract (`src/lib/queryClient.ts`)
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,    // 2 minutes
      gcTime: 1000 * 60 * 15,      // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});
```

### 3. Skeletons Contract (`src/components/skeletons/`)
- `DataTableSkeleton`: props `{ columns: number, rows?: number, className?: string }`
- `MetricCardSkeleton`: props `{ count?: number, className?: string }`
- `CatalogCardSkeleton`: props `{ count?: number, className?: string }`
- `FormCardSkeleton`: props `{ fields?: number, className?: string }`
- Common: All skeleton components render with `role="status"` and `aria-busy="true"`.

### 4. Button Component Contract (`src/components/ui/button.tsx`)
- Extended `ButtonProps`:
  ```typescript
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    // When isLoading is true: disabled=true, renders micro-spinner without altering width/height
  }
  ```

---

## Code Layout
- `supabase/migrations/`:
  - `20261105000000_performance_indices_and_rpcs.sql`
- `src/lib/`:
  - `src/lib/queryClient.ts`: TanStack QueryClient setup and standardized query keys.
  - `src/lib/queries.ts` or `src/hooks/useQueries.ts`: Custom query hooks for products, categories, news, metrics.
- `src/components/skeletons/`:
  - `src/components/skeletons/DataTableSkeleton.tsx`
  - `src/components/skeletons/MetricCardSkeleton.tsx`
  - `src/components/skeletons/CatalogCardSkeleton.tsx`
  - `src/components/skeletons/FormCardSkeleton.tsx`
  - `src/components/skeletons/index.ts`
- `src/components/ui/`:
  - `src/components/ui/button.tsx`: Updated with `isLoading` micro-spinner.
  - `src/components/ui/skeleton.tsx`: Enhanced with warm shimmer styling.
- `src/components/`:
  - `src/components/RouteProgressBar.tsx`: Global route transition indicator.
- `src/pages/`:
  - Updated views replacing `<p>Cargando...</p>` with skeletons and TanStack Query hooks.
- `docs/` or root:
  - `PERFORMANCE_REPORT.md`: Quantitative latency measurements before/after.
