
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
    const { skillId, answers } = await req.json();
    
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

    // Calculate skill level based on answers (mock scoring)
    let totalScore = 0;
    let maxScore = 0;
    
    for (const answer of answers) {
      maxScore += 10; // Each question worth 10 points
      if (answer.correct) {
        totalScore += 10;
      } else if (answer.partialCredit) {
        totalScore += 5;
      }
    }
    
    const skillLevel = Math.round((totalScore / maxScore) * 100);
    
    // Update or create user skill
    const { data: existingSkill } = await supabaseClient
      .from('user_skills')
      .select('id')
      .eq('user_id', user.id)
      .eq('skill_id', skillId)
      .maybeSingle();

    if (existingSkill) {
      await supabaseClient
        .from('user_skills')
        .update({
          current_level: skillLevel,
          assessed_at: new Date().toISOString(),
          status: 'assessed'
        })
        .eq('id', existingSkill.id);
    } else {
      await supabaseClient
        .from('user_skills')
        .insert({
          user_id: user.id,
          skill_id: skillId,
          current_level: skillLevel,
          target_level: Math.min(skillLevel + 30, 100),
          assessed_at: new Date().toISOString(),
          status: 'assessed'
        });
    }

    return new Response(JSON.stringify({ 
      skillLevel,
      message: `Assessment complete! Your skill level: ${skillLevel}%`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error assessing skill:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
