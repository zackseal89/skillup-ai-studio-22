-- Fix the SECURITY DEFINER view by removing the security_barrier property
-- and recreating it as a regular view with proper RLS policies

-- Drop the existing problematic view
DROP VIEW IF EXISTS public.team_member_profiles;

-- Recreate the view without SECURITY DEFINER properties
CREATE VIEW public.team_member_profiles AS
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

-- Grant access to the view
GRANT SELECT ON public.team_member_profiles TO authenticated;

-- Enable RLS on the view (without security_barrier)
ALTER VIEW public.team_member_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view that allows managers to see team members in their company
CREATE POLICY "Managers can view team member profiles" 
ON public.team_member_profiles
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles manager_profile
    WHERE manager_profile.user_id = auth.uid()
    AND manager_profile.is_manager = true
    AND manager_profile.company_id = team_member_profiles.company_id
  )
);