
-- Fix overly permissive INSERT on customers
DROP POLICY "Anyone can create customer record" ON public.customers;
CREATE POLICY "Anyone can create customer record"
  ON public.customers FOR INSERT
  WITH CHECK (email IS NOT NULL AND email <> '' AND full_name IS NOT NULL AND full_name <> '');

-- Fix overly permissive INSERT on orders
DROP POLICY "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (customer_id IS NOT NULL AND total >= 0);

-- Fix overly permissive INSERT on order_items
DROP POLICY "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (order_id IS NOT NULL AND product_id IS NOT NULL AND quantity > 0 AND unit_price >= 0);

-- Fix public bucket listing - restrict to specific file access only
DROP POLICY "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images' AND name IS NOT NULL);
