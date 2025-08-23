import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SkillGapRequest {
  cvContent: string;
  targetRole?: string;
  roadmapContent?: string;
  analysisType: 'general' | 'roadmap-specific';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user from auth header
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { cvContent, targetRole, roadmapContent, analysisType }: SkillGapRequest = await req.json();

    if (!cvContent) {
      return new Response(JSON.stringify({ error: 'CV content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aimlApiKey = Deno.env.get('AIML_API_KEY');
    if (!aimlApiKey) {
      console.error('AIML API key not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build analysis prompt based on type
    let analysisPrompt = '';
    let systemPrompt = '';

    if (analysisType === 'roadmap-specific' && roadmapContent) {
      systemPrompt = `You are an expert skill gap analyzer. Your job is to compare a user's current skills (from their CV) against a specific learning roadmap and identify precise skill gaps.

      Rules:
      1. Be specific and actionable
      2. Focus on concrete, learnable skills
      3. Prioritize the most important gaps
      4. Format as: "You are missing X skills to achieve your goal: Skill1, Skill2, Skill3"
      5. Provide brief explanations for each gap
      6. Suggest learning priority order`;

      analysisPrompt = `
      LEARNING ROADMAP:
      ${roadmapContent}

      USER'S CURRENT CV/SKILLS:
      ${cvContent}

      TARGET ROLE: ${targetRole || 'As specified in roadmap'}

      Please analyze the skill gaps between the user's current abilities and the roadmap requirements. Identify the top 3-5 missing skills and explain why each is important for their target role.`;
    } else {
      systemPrompt = `You are an expert career and skill analyzer. Your job is to analyze a user's CV/skills and identify key areas for improvement in the current job market, particularly focusing on AI and technology skills.

      Rules:
      1. Be specific and actionable
      2. Focus on in-demand, marketable skills
      3. Consider current industry trends
      4. Format as: "You are missing X skills to be market-ready: Skill1, Skill2, Skill3"
      5. Provide brief explanations for each skill gap
      6. Prioritize based on market demand`;

      analysisPrompt = `
      USER'S CURRENT CV/SKILLS:
      ${cvContent}

      TARGET ROLE: ${targetRole || 'General market competitiveness'}

      Please analyze this CV and identify the top 3-5 skill gaps that would make this person more competitive in today's job market, especially in AI and technology fields.`;
    }

    console.log(`Performing skill gap analysis for user ${user.id}, type: ${analysisType}`);

    // Call AIML API for skill gap analysis
    const aiResponse = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aimlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-2025-08-07', // Using GPT-5 for comprehensive analysis
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 1500,
        // Note: temperature not supported for GPT-5 models
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AIML API error:', errorText);
      throw new Error(`AIML API error: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;
    const tokensUsed = aiData.usage?.total_tokens || 0;

    // Log the skill gap analysis to database
    const { error: logError } = await supabaseClient
      .from('ai_interactions')
      .insert({
        user_id: user.id,
        interaction_type: 'skill_gap_analysis',
        input_prompt: `CV Analysis for ${targetRole || 'general skills'}: ${cvContent.substring(0, 200)}...`,
        output_response: analysis,
        model_used: 'openai/gpt-5-2025-08-07',
        tokens_consumed: tokensUsed,
      });

    if (logError) {
      console.error('Failed to log skill gap analysis:', logError);
    }

    // Parse the analysis to extract structured data
    const skillGaps = extractSkillGaps(analysis);

    console.log(`Skill gap analysis completed for user ${user.id}, tokens: ${tokensUsed}`);

    return new Response(JSON.stringify({ 
      analysis,
      skillGaps,
      analysisType,
      targetRole: targetRole || 'General market readiness',
      tokensUsed,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in skill-gap-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to extract structured skill gaps from analysis
function extractSkillGaps(analysis: string): { count: number; skills: string[]; summary: string } {
  try {
    // Try to extract skills from common patterns
    const skillPattern = /(?:missing|need|lacking)\s+(\d+)\s+skills?.*?:?\s*([^.]+)/i;
    const match = analysis.match(skillPattern);
    
    let count = 0;
    let skills: string[] = [];
    
    if (match) {
      count = parseInt(match[1]) || 0;
      const skillsText = match[2];
      skills = skillsText.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    
    // Fallback: look for numbered lists or bullet points
    if (skills.length === 0) {
      const bulletPattern = /(?:^|\n)\s*[\d\-•]\s*([^.\n]+)/gm;
      const bulletMatches = analysis.matchAll(bulletPattern);
      skills = Array.from(bulletMatches).map(m => m[1].trim()).slice(0, 5);
      count = skills.length;
    }
    
    return {
      count,
      skills: skills.slice(0, 5), // Limit to top 5 skills
      summary: analysis.split('\n')[0] // First line as summary
    };
  } catch (error) {
    console.error('Error parsing skill gaps:', error);
    return {
      count: 0,
      skills: [],
      summary: analysis.substring(0, 200) + '...'
    };
  }
}