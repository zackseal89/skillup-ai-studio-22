
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

    const onboardingData = await req.json();
    console.log('Generating roadmap for user:', user.id, onboardingData);

    // Generate personalized roadmap based on user data
    const roadmapContent = generatePersonalizedRoadmap(onboardingData);

    // Save roadmap to database
    const { error: roadmapError } = await supabaseClient
      .from('course_roadmaps')
      .insert({
        user_id: user.id,
        roadmap_content: roadmapContent
      });

    if (roadmapError) {
      console.error('Error saving roadmap:', roadmapError);
      throw roadmapError;
    }

    return new Response(JSON.stringify({ roadmap: roadmapContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePersonalizedRoadmap(data: any): string {
  const { industry, role, ai_skill_level, learning_goals, learning_style, time_commitment } = data;
  
  let roadmap = `🎯 **Your Personalized AI Learning Roadmap**\n\n`;
  
  roadmap += `**Profile Summary:**\n`;
  roadmap += `• Industry: ${industry}\n`;
  roadmap += `• Role: ${role}\n`;
  roadmap += `• Current AI Level: ${ai_skill_level}\n`;
  roadmap += `• Time Commitment: ${time_commitment}\n\n`;

  roadmap += `**Phase 1: Foundation (Weeks 1-2)**\n`;
  if (ai_skill_level === 'Beginner') {
    roadmap += `• Introduction to AI fundamentals and terminology\n`;
    roadmap += `• Understanding AI applications in ${industry}\n`;
    roadmap += `• Basic prompt engineering techniques\n`;
  } else if (ai_skill_level === 'Intermediate') {
    roadmap += `• Advanced AI concepts for ${role} professionals\n`;
    roadmap += `• Industry-specific AI use cases in ${industry}\n`;
    roadmap += `• Intermediate automation strategies\n`;
  } else {
    roadmap += `• Cutting-edge AI developments for ${industry}\n`;
    roadmap += `• Leadership strategies for AI implementation\n`;
    roadmap += `• Advanced integration techniques\n`;
  }

  roadmap += `\n**Phase 2: Practical Application (Weeks 3-4)**\n`;
  roadmap += `• Hands-on projects related to: ${learning_goals}\n`;
  roadmap += `• Tool selection and implementation\n`;
  roadmap += `• Building your first AI-powered solution\n`;

  roadmap += `\n**Phase 3: Advanced Implementation (Weeks 5-6)**\n`;
  roadmap += `• Scaling AI solutions in ${industry}\n`;
  roadmap += `• Integration with existing ${role} workflows\n`;
  roadmap += `• Measuring ROI and impact\n`;

  roadmap += `\n**Learning Format:**\n`;
  const styles = Array.isArray(learning_style) ? learning_style.join(', ') : learning_style;
  roadmap += `Based on your preferences (${styles}), your course will include:\n`;
  
  if (learning_style?.includes('Videos')) {
    roadmap += `• Interactive video tutorials with real-world examples\n`;
  }
  if (learning_style?.includes('Interactive')) {
    roadmap += `• Q&A sessions and discussion forums\n`;
  }
  if (learning_style?.includes('Hands-on')) {
    roadmap += `• Practical projects and coding exercises\n`;
  }
  if (learning_style?.includes('Short Lessons')) {
    roadmap += `• Bite-sized lessons that fit your schedule\n`;
  }

  roadmap += `\n**Success Metrics:**\n`;
  roadmap += `• Complete 3 practical AI projects relevant to your role\n`;
  roadmap += `• Achieve measurable improvements in your daily tasks\n`;
  roadmap += `• Build confidence to lead AI initiatives in your organization\n`;

  roadmap += `\n**Next Steps:**\n`;
  roadmap += `1. Start with your skill assessment\n`;
  roadmap += `2. Begin Foundation Phase learning modules\n`;
  roadmap += `3. Connect with peers in your industry cohort\n`;
  roadmap += `4. Schedule weekly progress check-ins\n\n`;

  roadmap += `🚀 **Ready to transform your career with AI? Let's begin!**`;

  return roadmap;
}
