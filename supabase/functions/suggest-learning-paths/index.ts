import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PathSuggestionRequest {
  targetRole: string;
  teamId?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  context?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const request: PathSuggestionRequest = await req.json();
    const { targetRole, teamId, difficultyLevel = 'intermediate', context } = request;

    if (!targetRole?.trim()) {
      throw new Error('Target role is required');
    }

    const aimlApiKey = Deno.env.get('AIML_API_KEY');
    if (!aimlApiKey) {
      throw new Error('AIML API key not configured');
    }

    // Get existing courses to reference
    const { data: existingCourses } = await supabaseClient
      .from('courses')
      .select('title, description, category, skills, difficulty_level, duration')
      .limit(20);

    const systemPrompt = `You are an expert Learning Path Designer specializing in AI and technology education.

Your task is to suggest 1-2 ready-made courses that align with a target role.

Return response in this exact JSON format:
{
  "suggestions": [
    {
      "courseName": "Complete Course Title",
      "description": "Detailed course description",
      "difficultyLevel": "beginner|intermediate|advanced",
      "estimatedDuration": "e.g., 8 weeks, 40 hours",
      "skillsCovered": ["skill1", "skill2", "skill3"],
      "modules": ["Module 1: Topic", "Module 2: Topic"],
      "prerequisites": ["prereq1", "prereq2"],
      "confidenceScore": number (0-100),
      "reasoning": "Why this course is perfect for the role"
    }
  ],
  "overallAssessment": {
    "roleComplexity": "low|medium|high",
    "recommendedSequence": "suggested order if multiple courses",
    "estimatedTimeToCompetency": "realistic timeline",
    "additionalResources": ["resource1", "resource2"]
  }
}`;

    const analysisPrompt = `Suggest 1-2 ready-made AI courses for this target role:

TARGET ROLE: ${targetRole}
DIFFICULTY PREFERENCE: ${difficultyLevel}
${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

AVAILABLE COURSE CATEGORIES (reference these):
${existingCourses?.map(course => `- ${course.title} (${course.category}, ${course.difficulty_level})`).join('\n') || 'AI Fundamentals, Machine Learning, Data Science, Cloud Computing'}

Requirements:
1. Focus on practical, immediately applicable skills
2. Include AI/ML components relevant to the role
3. Suggest courses that can be completed in 4-12 weeks
4. Prioritize courses with hands-on projects and real-world applications
5. Consider career progression and industry demands

For roles like "AI Engineer", focus on technical depth.
For roles like "Product Manager", balance technical understanding with business skills.
For roles like "Data Scientist", emphasize analytics and ML modeling.`;

    console.log('Calling AIML API for learning path suggestions...');

    const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aimlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AIML API error:', errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AIML API response received');

    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response format');
    }

    const suggestions = JSON.parse(aiResponse.choices[0].message.content);
    const tokensUsed = aiResponse.usage?.total_tokens || 0;

    // Store the suggestion in the database
    const { data: pathSuggestion, error: insertError } = await supabaseClient
      .from('learning_path_suggestions')
      .insert({
        team_id: teamId,
        target_role: targetRole,
        suggested_courses: suggestions.suggestions,
        difficulty_level: difficultyLevel,
        estimated_duration: suggestions.overallAssessment?.estimatedTimeToCompetency,
        skills_covered: suggestions.suggestions.flatMap(s => s.skillsCovered || []),
        ai_confidence_score: Math.round(suggestions.suggestions.reduce((avg, s) => avg + (s.confidenceScore || 85), 0) / suggestions.suggestions.length),
        generated_by: 'gpt-4.1-2025-04-14'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing path suggestion:', insertError);
      throw new Error('Failed to store learning path suggestions');
    }

    // Log the interaction
    await supabaseClient.from('ai_interactions').insert({
      user_id: user.id,
      interaction_type: 'learning_path_suggestion',
      input_prompt: analysisPrompt,
      output_response: JSON.stringify(suggestions),
      model_used: 'gpt-4.1-2025-04-14',
      tokens_consumed: tokensUsed
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        suggestionId: pathSuggestion.id,
        suggestions: suggestions.suggestions,
        overallAssessment: suggestions.overallAssessment,
        tokensUsed,
        confidence: pathSuggestion.ai_confidence_score,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-learning-paths function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate learning path suggestions'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});