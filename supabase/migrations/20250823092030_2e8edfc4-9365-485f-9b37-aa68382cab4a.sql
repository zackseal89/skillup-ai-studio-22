-- Fix the view by removing RLS (views don't support RLS directly)
-- The underlying table already has proper RLS policies

-- Drop the existing view and recreate it properly
DROP VIEW IF EXISTS public.team_member_profiles;

-- Recreate the view as a simple view (no RLS needed since underlying table has RLS)
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