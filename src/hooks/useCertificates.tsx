
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useCertificates = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
};

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (certificateData: {
      certificate_name: string;
      certificate_url?: string;
      skill_id: string;
    }) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('certifications')
        .insert({
          user_id: user.id,
          ...certificateData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};
