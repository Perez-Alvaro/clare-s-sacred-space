import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number | null;
}

export interface VariantOption {
  id: string;
  label: string;
  price_modifier: number;
  sort_order: number;
}

export interface Variant {
  id: string;
  name: string;
  type: 'single_choice' | 'multiple_choice';
  sort_order: number;
  options: VariantOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  is_active?: boolean | null;
  sort_order?: number | null;
  category_id?: string | null;
  external_link?: string | null;
  product_images: ProductImage[];
  product_variants?: Variant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean | null;
  sort_order: number | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  image_url: string | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  products_count: number;
  orders_count: number;
  customers_count: number;
  total_revenue: number;
}

/**
 * Fetch active products with images for public shop catalog
 */
export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products.active(),
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return (data as Product[]) || [];
    },
  });
}

/**
 * Fetch active categories for public shop navigation
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.active(),
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return (data as Category[]) || [];
    },
  });
}

/**
 * Fetch product variants with nested options in a single PostgREST join (eliminating N+1)
 */
export function useProductVariants(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.variants(productId || ''),
    enabled: Boolean(productId),
    queryFn: async (): Promise<Variant[]> => {
      if (!productId) return [];

      const { data: vData, error } = await supabase
        .from('product_variants')
        .select('*, product_variant_options(*)')
        .eq('product_id', productId)
        .order('sort_order');

      if (error) throw error;
      if (!vData) return [];

      return vData.map((v: any) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        sort_order: v.sort_order ?? 0,
        options: ([...(v.product_variant_options || [])] as VariantOption[]).sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        ),
      })).filter((v: Variant) => v.options.length > 0);
    },
  });
}

/**
 * Fetch a single product with images and nested variants/options in one shot
 */
export function useProductDetail(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId || ''),
    enabled: Boolean(productId),
    queryFn: async (): Promise<{ product: Product; variants: Variant[] } | null> => {
      if (!productId) return null;

      const [productRes, variantsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('id', productId)
          .single(),
        supabase
          .from('product_variants')
          .select('*, product_variant_options(*)')
          .eq('product_id', productId)
          .order('sort_order'),
      ]);

      if (productRes.error) throw productRes.error;
      const product = productRes.data as Product;
      if (!product) return null;

      const rawVariants = variantsRes.data || [];
      const variants: Variant[] = rawVariants.map((v: any) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        sort_order: v.sort_order ?? 0,
        options: ([...(v.product_variant_options || [])] as VariantOption[]).sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        ),
      })).filter((v: Variant) => v.options.length > 0);

      return { product, variants };
    },
  });
}

/**
 * Fetch published news articles ordered chronologically
 */
export function useNews() {
  return useQuery({
    queryKey: queryKeys.news.published(),
    queryFn: async (): Promise<NewsArticle[]> => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return (data as NewsArticle[]) || [];
    },
  });
}

/**
 * Fetch store settings (like bank transfer details) stored in news table
 */
export function useStoreSetting(slug: string) {
  return useQuery({
    queryKey: queryKeys.news.setting(slug),
    queryFn: async (): Promise<string | null> => {
      const { data } = await supabase
        .from('news')
        .select('content')
        .eq('slug', slug)
        .single();

      return data?.content ?? null;
    },
  });
}

/**
 * Fetch admin dashboard metrics via set-based RPC with graceful client-side fallback
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.admin.metrics,
    queryFn: async (): Promise<DashboardMetrics> => {
      try {
        const { data, error } = await supabase.rpc('get_dashboard_metrics');
        if (!error && data) {
          return {
            products_count: Number(data.products_count) || 0,
            orders_count: Number(data.orders_count) || 0,
            customers_count: Number(data.customers_count) || 0,
            total_revenue: Number(data.total_revenue) || 0,
          };
        }
      } catch (rpcErr) {
        console.warn('get_dashboard_metrics RPC failed, activating fallback:', rpcErr);
      }

      // Graceful fallback if RPC is not yet deployed on remote database
      const [prods, ords, custs] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
      ]);

      const total_revenue = (ords.data || []).reduce(
        (sum: number, o: any) => sum + (Number(o.total) || 0),
        0
      );

      return {
        products_count: prods.count || 0,
        orders_count: ords.count || 0,
        customers_count: custs.count || 0,
        total_revenue,
      };
    },
  });
}

/**
 * Fetch recent orders for Admin Dashboard
 */
export function useRecentOrders(limit: number = 5) {
  return useQuery({
    queryKey: queryKeys.orders.recent(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}
