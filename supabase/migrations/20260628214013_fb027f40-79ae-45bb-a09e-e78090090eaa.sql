
-- 1) Bloquear creación pública directa de clientes/órdenes (ahora va por edge function con service role)
DROP POLICY IF EXISTS "Anyone can create customer record" ON public.customers;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Permitir que un usuario autenticado SOLO cree una fila de cliente vinculada a sí mismo
CREATE POLICY "Authenticated users can create own customer"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND email IS NOT NULL AND email <> ''
  AND full_name IS NOT NULL AND full_name <> ''
);

-- 2) Eliminar la rama de auto-promoción a admin
CREATE OR REPLACE FUNCTION public.can_manage_user_roles(_actor_id uuid, _target_user_id uuid, _target_role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF _actor_id IS NULL THEN
    RETURN false;
  END IF;
  IF public.has_role(_actor_id, 'admin'::public.app_role) THEN
    RETURN _target_role IN ('admin'::public.app_role, 'staff'::public.app_role);
  END IF;
  RETURN false;
END;
$function$;

-- 3) Restringir EXECUTE de funciones SECURITY DEFINER al backend
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.can_manage_user_roles(uuid, uuid, app_role) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_user_roles(uuid, uuid, app_role) TO service_role;
