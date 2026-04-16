CREATE OR REPLACE FUNCTION public.can_manage_user_roles(_actor_id uuid, _target_user_id uuid, _target_role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _actor_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.has_role(_actor_id, 'admin'::public.app_role) THEN
    RETURN _target_role IN ('admin'::public.app_role, 'staff'::public.app_role);
  END IF;

  RETURN (
    _target_role = 'admin'::public.app_role
    AND _actor_id = _target_user_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.role = 'admin'::public.app_role
    )
  );
END;
$$;