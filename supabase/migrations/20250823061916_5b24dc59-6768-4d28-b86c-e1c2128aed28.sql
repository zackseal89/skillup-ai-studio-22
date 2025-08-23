-- Fix security warning: Add search_path to existing functions by recreating them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, industry, role, experience_level)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'industry', ''),
    COALESCE(new.raw_user_meta_data->>'role', ''),
    COALESCE(new.raw_user_meta_data->>'experience_level', '')
  );
  RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP FUNCTION IF EXISTS public.accept_team_invitation(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Get invitation details
  SELECT * INTO invitation_record 
  FROM public.team_invitations 
  WHERE id = invitation_id AND email = user_email AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Add user to team
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (invitation_record.team_id, auth.uid(), 'member')
  ON CONFLICT (team_id, user_id) DO NOTHING;
  
  -- Update invitation status
  UPDATE public.team_invitations 
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_id;
  
  RETURN TRUE;
END;
$$;