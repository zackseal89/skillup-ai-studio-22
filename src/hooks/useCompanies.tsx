
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Company {
  id: string;
  name: string;
  company_code: string;
  created_at: string;
  updated_at: string;
}

export const useCompany = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['company', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // First get user's profile to find their company_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.company_id) return null;

      // Then get the company details
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (error) throw error;
      return data as Company;
    },
    enabled: !!user,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (companyData: { name: string; company_code: string }) => {
      // Create the company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (companyError) throw companyError;

      // Update user's profile to link to this company and make them a manager
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          company_id: company.id,
          is_manager: true 
        })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useJoinCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (companyCode: string) => {
      // Find company by code
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('company_code', companyCode)
        .single();

      if (companyError) throw new Error('Invalid company code');

      // Update user's profile to link to this company
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_id: company.id })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
