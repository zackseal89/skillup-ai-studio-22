
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useRecommendations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase.functions.invoke('generate-recommendations');

      if (error) throw error;
      return data.recommendations;
    },
    enabled: !!user?.id,
  });
};
