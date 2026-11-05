-- ============================================================================
-- MIGRATION: 20261105000000_performance_indices_and_rpcs.sql
-- Description: Foreign key indexes, composite query filters, and performance RPCs
-- ============================================================================

-- 1. FOREIGN KEY B-TREE INDEXES (Eliminates Seq Scans on Joins, Deletes & RLS)
-- ----------------------------------------------------------------------------
-- Products -> Categories
CREATE INDEX IF NOT EXISTS idx_products_category_id 
  ON public.products(category_id);

-- Product Images -> Products
CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
  ON public.product_images(product_id);

-- Customers -> auth.users (Critical for accelerating RLS policies)
CREATE INDEX IF NOT EXISTS idx_customers_user_id 
  ON public.customers(user_id);

-- Orders -> Customers
CREATE INDEX IF NOT EXISTS idx_orders_customer_id 
  ON public.orders(customer_id);

-- Order Items -> Orders & Products
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
  ON public.order_items(product_id);

-- Product Variants -> Products
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id 
  ON public.product_variants(product_id);

-- Product Variant Options -> Product Variants
CREATE INDEX IF NOT EXISTS idx_product_variant_options_variant_id 
  ON public.product_variant_options(variant_id);


-- 2. COMPOSITE & FILTERING INDEXES (Frequent Frontend Queries)
-- ----------------------------------------------------------------------------
-- Public Shop Catalog: filtered by active and ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_products_active_sort 
  ON public.products(is_active, sort_order) 
  WHERE is_active = true;

-- Public Active Categories ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_categories_active_sort 
  ON public.categories(is_active, sort_order) 
  WHERE is_active = true;

-- Public News published ordered by published_at DESC
CREATE INDEX IF NOT EXISTS idx_news_published_at 
  ON public.news(is_published, published_at DESC) 
  WHERE is_published = true;

-- Admin Orders ordered by created_at DESC
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc 
  ON public.orders(created_at DESC);

-- Orders status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON public.orders(status);

-- Active discounts by target and type
CREATE INDEX IF NOT EXISTS idx_discounts_target_active 
  ON public.discounts(target_id, type) 
  WHERE is_active = true;

-- Product images ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_product_images_sort 
  ON public.product_images(product_id, sort_order);

-- Variant options ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_variant_options_sort 
  ON public.product_variant_options(variant_id, sort_order);


-- 3. RPC FUNCTIONS FOR SET-BASED AGGREGATION & TRANSACTIONS
-- ----------------------------------------------------------------------------

-- Dashboard Metrics RPC (replaces full orders table scan and client-side reduce)
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'products_count', (SELECT count(*)::int FROM public.products),
    'orders_count', (SELECT count(*)::int FROM public.orders),
    'customers_count', (SELECT count(*)::int FROM public.customers),
    'total_revenue', COALESCE((SELECT sum(total)::numeric FROM public.orders), 0)
  );
$$;

REVOKE ALL ON FUNCTION public.get_dashboard_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics() TO authenticated, service_role;


-- Atomic Checkout Order Creation RPC (ACID multi-table insert with automatic rollback)
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_customer jsonb,
  p_order jsonb,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_order_id UUID;
  v_order_number INT;
  v_payment_method public.payment_method;
  v_order_status public.order_status;
  v_payment_status public.payment_status;
BEGIN
  -- 1. Insert customer
  INSERT INTO public.customers (
    email,
    full_name,
    phone,
    address,
    city,
    province,
    postal_code,
    notes,
    user_id
  ) VALUES (
    p_customer->>'email',
    p_customer->>'full_name',
    p_customer->>'phone',
    p_customer->>'address',
    p_customer->>'city',
    p_customer->>'province',
    p_customer->>'postal_code',
    p_customer->>'notes',
    auth.uid()
  )
  RETURNING id INTO v_customer_id;

  -- Cast enum values with safe defaults
  v_payment_method := (p_order->>'payment_method')::public.payment_method;
  v_order_status := COALESCE((p_order->>'status')::public.order_status, 'pending'::public.order_status);
  v_payment_status := COALESCE((p_order->>'payment_status')::public.payment_status, 'pending'::public.payment_status);

  -- 2. Insert order
  INSERT INTO public.orders (
    customer_id,
    payment_method,
    subtotal,
    tax,
    total,
    shipping_address,
    notes,
    status,
    payment_status
  ) VALUES (
    v_customer_id,
    v_payment_method,
    COALESCE((p_order->>'subtotal')::numeric, 0),
    COALESCE((p_order->>'tax')::numeric, 0),
    COALESCE((p_order->>'total')::numeric, 0),
    p_order->>'shipping_address',
    p_order->>'notes',
    v_order_status,
    v_payment_status
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- 3. Set-based bulk insert for order items
  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    total
  )
  SELECT
    v_order_id,
    (item->>'product_id')::uuid,
    item->>'product_name',
    (item->>'quantity')::int,
    (item->>'unit_price')::numeric,
    (item->>'total')::numeric
  FROM jsonb_array_elements(p_items) AS item;

  -- 4. Return consolidated success response
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'customer_id', v_customer_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_atomic(jsonb, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(jsonb, jsonb, jsonb) TO anon, authenticated, service_role;
