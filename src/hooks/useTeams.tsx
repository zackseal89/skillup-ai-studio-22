
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    full_name: string;
    email: string;
    industry: string;
    role: string;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  status: string;
  invited_at: string;
  accepted_at?: string;
}

export const useTeams = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('manager_id', user.id);

      if (error) throw error;
      return data as Team[];
    },
    enabled: !!user,
  });
};

export const useTeamMembers = (teamId: string) => {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        // Removed nested profiles selection to avoid relation typing errors
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (teamData: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          manager_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ teamId, email }: { teamId: string; email: string }) => {
      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          email,
          invited_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
    },
  });
};

export const useTeamProgress = (teamId: string) => {
  return useQuery({
    queryKey: ['team-progress', teamId],
    queryFn: async () => {
      // Get team members' progress
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      const userIds = (members || []).map(m => m.user_id);

      if (userIds.length === 0) {
        return {
          progress: [],
          userSkills: [],
          memberCount: 0,
        };
      }

      // Get progress for all team members
      const { data: progress, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .in('user_id', userIds);

      if (progressError) throw progressError;

      // Get user skills for team members
      const { data: userSkills, error: skillsError } = await supabase
        .from('user_skills')
        .select(`
          *,
          skills (
            name,
            category
          )
        `)
        .in('user_id', userIds);

      if (skillsError) throw skillsError;

      return {
        progress: progress || [],
        userSkills: userSkills || [],
        memberCount: members.length,
      };
    },
    enabled: !!teamId,
  });
};

