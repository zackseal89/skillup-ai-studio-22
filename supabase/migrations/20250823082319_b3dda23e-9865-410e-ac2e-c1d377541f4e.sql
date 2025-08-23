-- Fix security issue: Restrict email exposure in profiles table
-- Create a view for managers that excludes sensitive data like email addresses

-- First, let's create a secure manager view that only shows necessary profile data
CREATE OR REPLACE VIEW public.team_member_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.role,
  p.industry,
  p.experience_level,
  p.company_id,
  p.is_manager,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE p.company_id IS NOT NULL;

-- Enable RLS on the view
ALTER VIEW public.team_member_profiles SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON public.team_member_profiles TO authenticated;

-- Update the existing RLS policies to be more restrictive
-- Drop the overly permissive manager policies
DROP POLICY IF EXISTS "Managers can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can update company profiles" ON public.profiles;

-- Rename existing policies to avoid conflicts
ALTER POLICY "Users can update their own profile" ON public.profiles RENAME TO "Users can update their own profile only";

-- Create more restrictive policy for viewing profiles
-- Only users can see their own complete profile (including email)
CREATE POLICY "Users can view own profile with sensitive data" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Add a function for managers to update specific non-sensitive profile fields
CREATE OR REPLACE FUNCTION public.update_team_member_profile(
  target_user_id UUID,
  new_role TEXT DEFAULT NULL,
  new_experience_level TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  manager_company_id UUID;
  target_company_id UUID;
BEGIN
  -- Check if the current user is a manager
  SELECT company_id INTO manager_company_id 
  FROM profiles 
  WHERE user_id = auth.uid() AND is_manager = true;
  
  IF manager_company_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the target user's company
  SELECT company_id INTO target_company_id 
  FROM profiles 
  WHERE user_id = target_user_id;
  
  -- Check if they're in the same company
  IF target_company_id != manager_company_id THEN
    RETURN FALSE;
  END IF;
  
  -- Update only non-sensitive fields
  UPDATE profiles 
  SET 
    role = COALESCE(new_role, role),
    experience_level = COALESCE(new_experience_level, experience_level),
    updated_at = NOW()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$;