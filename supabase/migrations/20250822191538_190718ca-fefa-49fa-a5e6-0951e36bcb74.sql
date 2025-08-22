
-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table to link users to teams
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_invitations table for managing invites
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, email)
);

-- Add RLS policies for teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Managers can view and manage their own teams
CREATE POLICY "Managers can view their own teams" 
  ON public.teams 
  FOR SELECT 
  USING (auth.uid() = manager_id);

CREATE POLICY "Managers can create teams" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers can update their own teams" 
  ON public.teams 
  FOR UPDATE 
  USING (auth.uid() = manager_id);

-- Add RLS policies for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team members can view their team memberships
CREATE POLICY "Users can view their team memberships" 
  ON public.team_members 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT manager_id FROM public.teams WHERE id = team_id
  ));

-- Managers can add/remove team members
CREATE POLICY "Managers can manage team members" 
  ON public.team_members 
  FOR ALL 
  USING (auth.uid() IN (
    SELECT manager_id FROM public.teams WHERE id = team_id
  ));

-- Add RLS policies for team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Managers can view and manage invitations for their teams
CREATE POLICY "Managers can manage team invitations" 
  ON public.team_invitations 
  FOR ALL 
  USING (auth.uid() IN (
    SELECT manager_id FROM public.teams WHERE id = team_id
  ));

-- Users can view invitations sent to their email
CREATE POLICY "Users can view their invitations" 
  ON public.team_invitations 
  FOR SELECT 
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Add manager role to profiles table
ALTER TABLE public.profiles ADD COLUMN is_manager BOOLEAN DEFAULT FALSE;

-- Create function to handle team invitation acceptance
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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
