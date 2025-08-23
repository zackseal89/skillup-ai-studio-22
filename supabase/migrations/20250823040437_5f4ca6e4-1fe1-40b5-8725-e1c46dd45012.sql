
-- 1) Create a SECURITY DEFINER helper function to check if the current user
--    is a manager in a given company. Using SECURITY DEFINER avoids the
--    profiles->profiles recursive policy evaluation.
CREATE OR REPLACE FUNCTION public.is_manager_in_company(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.is_manager = true
      AND p.company_id = _company_id
  );
$$;

-- Allow authenticated users to execute the helper function
GRANT EXECUTE ON FUNCTION public.is_manager_in_company(uuid) TO authenticated;

-- 2) Replace the self-referential profiles policies with versions that use the helper
DROP POLICY IF EXISTS "Managers can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can update company profiles" ON public.profiles;

-- Managers can view company profiles (or users can view their own)
CREATE POLICY "Managers can view company profiles"
  ON public.profiles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_manager_in_company(company_id)
  );

-- Managers can update company profiles (or users can update their own)
CREATE POLICY "Managers can update company profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.is_manager_in_company(company_id)
  );
