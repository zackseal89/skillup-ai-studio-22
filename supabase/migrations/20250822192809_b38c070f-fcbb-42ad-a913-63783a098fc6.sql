
-- Create companies table
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  company_code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add company_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN company_id uuid REFERENCES public.companies(id);

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow managers to view companies they belong to
CREATE POLICY "Users can view their company" 
  ON public.companies 
  FOR SELECT 
  USING (id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  ));

-- Allow managers to create companies (we'll control this via application logic)
CREATE POLICY "Managers can create companies" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (true);

-- Allow managers to update their company
CREATE POLICY "Managers can update their company" 
  ON public.companies 
  FOR UPDATE 
  USING (id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() AND is_manager = true
  ));

-- Update teams table to be company-specific
ALTER TABLE public.teams 
ADD COLUMN company_id uuid REFERENCES public.companies(id);

-- Update team policies to be company-specific
DROP POLICY IF EXISTS "Managers can view their own teams" ON public.teams;
CREATE POLICY "Managers can view company teams" 
  ON public.teams 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM public.profiles 
      WHERE is_manager = true 
      AND company_id = teams.company_id
    )
  );

DROP POLICY IF EXISTS "Managers can create teams" ON public.teams;
CREATE POLICY "Managers can create company teams" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id 
      FROM public.profiles 
      WHERE is_manager = true 
      AND company_id = teams.company_id
    )
  );

-- Update UserRoleManagement to only show users from the same company
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow managers to view profiles from their company
CREATE POLICY "Managers can view company profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.profiles p2 
      WHERE p2.user_id = auth.uid() 
      AND p2.is_manager = true
    )
  );

-- Allow managers to update profiles from their company
CREATE POLICY "Managers can update company profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.profiles p2 
      WHERE p2.user_id = auth.uid() 
      AND p2.is_manager = true
    )
  );
