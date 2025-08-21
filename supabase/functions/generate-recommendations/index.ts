
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Get user profile and skills
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: userSkills } = await supabaseClient
      .from('user_skills')
      .select('*, skills:skill_id (*)')
      .eq('user_id', user.id);

    // Generate mock recommendations based on skill gaps
    const recommendations = [];
    
    if (userSkills && userSkills.length > 0) {
      for (const userSkill of userSkills) {
        const gap = userSkill.target_level - userSkill.current_level;
        if (gap > 20) {
          recommendations.push({
            title: `Master ${userSkill.skills?.name}`,
            description: `Close your ${gap}% skill gap with our comprehensive course`,
            type: 'Course',
            duration: `${Math.ceil(gap / 10)} weeks`,
            impact: gap > 50 ? 'High' : gap > 30 ? 'Medium' : 'Low',
            skill_id: userSkill.skill_id
          });
        }
      }
    }

    // Add general recommendations based on industry
    if (profile?.industry === 'Finance') {
      recommendations.push({
        title: 'Financial Risk Management Certification',
        description: 'Get certified in modern risk assessment techniques',
        type: 'Certification',
        duration: '8 weeks',
        impact: 'High'
      });
    } else if (profile?.industry === 'Healthcare') {
      recommendations.push({
        title: 'Healthcare Analytics Workshop',
        description: 'Learn to analyze patient data and outcomes',
        type: 'Workshop',
        duration: '4 weeks',
        impact: 'Medium'
      });
    } else if (profile?.industry === 'Technology') {
      recommendations.push({
        title: 'Cloud Architecture Certification',
        description: 'Master modern cloud infrastructure design',
        type: 'Certification',
        duration: '6 weeks',
        impact: 'High'
      });
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
