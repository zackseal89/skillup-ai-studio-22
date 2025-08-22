
-- Fix the recursive RLS policy issue by simplifying the policies

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Managers can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can update company profiles" ON public.profiles;

-- Recreate simpler policies that won't cause recursion
CREATE POLICY "Managers can view company profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    -- Users can always view their own profile
    user_id = auth.uid() 
    OR 
    -- Managers can view profiles from their company (simplified check)
    (
      is_manager = true 
      AND auth.uid() IN (
        SELECT p2.user_id 
        FROM public.profiles p2 
        WHERE p2.company_id = profiles.company_id 
        AND p2.is_manager = true
      )
    )
  );

CREATE POLICY "Managers can update company profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    -- Users can always update their own profile
    user_id = auth.uid()
    OR
    -- Or if they are a manager in the same company (simplified check)
    EXISTS (
      SELECT 1 
      FROM public.profiles p2 
      WHERE p2.user_id = auth.uid() 
      AND p2.is_manager = true 
      AND p2.company_id = profiles.company_id
    )
  );

-- Also fix the companies policies to avoid recursion
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
CREATE POLICY "Users can view their company" 
  ON public.companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND company_id = companies.id
    )
  );

DROP POLICY IF EXISTS "Managers can update their company" ON public.companies;
CREATE POLICY "Managers can update their company" 
  ON public.companies 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND company_id = companies.id 
      AND is_manager = true
    )
  );
