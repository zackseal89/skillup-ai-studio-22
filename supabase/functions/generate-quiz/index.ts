import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizGenerationRequest {
  moduleContent: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  courseId?: string;
  moduleId: string;
  topic?: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
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

    const { moduleContent, difficultyLevel, courseId, moduleId, topic }: QuizGenerationRequest = await req.json();

    if (!moduleContent || !difficultyLevel || !moduleId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: moduleContent, difficultyLevel, moduleId' }), {
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

    // Build system prompt for quiz generation
    const systemPrompt = `You are an expert quiz generator. Create 5 high-quality, personalized quiz questions based on the provided module content.

    Requirements:
    1. Generate exactly 5 questions
    2. Mix question types: multiple-choice (3-4 questions), true-false (1 question), short-answer (0-1 questions)
    3. Each multiple-choice question should have 4 options labeled A, B, C, D
    4. Adjust difficulty based on specified level
    5. Include explanations for correct answers
    6. Focus on key concepts and practical application
    7. Ensure questions test understanding, not just memorization

    Difficulty Guidelines:
    - Beginner: Basic concepts, definitions, simple applications
    - Intermediate: Applied knowledge, connections between concepts
    - Advanced: Complex scenarios, critical thinking, synthesis

    Return ONLY a valid JSON array with this exact structure:
    [
      {
        "id": 1,
        "question": "Question text here?",
        "type": "multiple-choice",
        "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
        "correctAnswer": "A",
        "explanation": "Explanation of why this is correct",
        "difficulty": "${difficultyLevel}"
      }
    ]`;

    const userPrompt = `
    DIFFICULTY LEVEL: ${difficultyLevel}
    MODULE TOPIC: ${topic || 'Learning Module'}
    
    MODULE CONTENT:
    ${moduleContent}
    
    Generate 5 personalized quiz questions based on this content. Make sure questions are relevant, challenging for the ${difficultyLevel} level, and test real understanding.`;

    console.log(`Generating quiz for user ${user.id}, difficulty: ${difficultyLevel}, module: ${moduleId}`);

    // Call AIML API for quiz generation
    const aiResponse = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aimlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4.1-2025-04-14', // Using GPT-4.1 for structured output
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
        // Note: temperature not supported for newer models
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AIML API error:', errorText);
      throw new Error(`AIML API error: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const quizContent = aiData.choices[0].message.content;
    const tokensUsed = aiData.usage?.total_tokens || 0;

    // Parse the quiz questions
    let questions: QuizQuestion[];
    try {
      // Clean the response to extract JSON
      const jsonMatch = quizContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      questions = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!Array.isArray(questions) || questions.length !== 5) {
        throw new Error('Invalid quiz structure - should be array of 5 questions');
      }
    } catch (parseError) {
      console.error('Failed to parse quiz questions:', parseError);
      throw new Error('Failed to generate valid quiz format');
    }

    // Save quiz to database
    const { data: quizData, error: quizError } = await supabaseClient
      .from('quizzes')
      .insert({
        user_id: user.id,
        course_id: courseId,
        module_id: moduleId,
        module_content: moduleContent.substring(0, 1000), // Store truncated content
        difficulty_level: difficultyLevel,
        questions: questions,
      })
      .select()
      .single();

    if (quizError) {
      console.error('Failed to save quiz:', quizError);
      throw new Error('Failed to save quiz to database');
    }

    // Log the quiz generation
    const { error: logError } = await supabaseClient
      .from('ai_interactions')
      .insert({
        user_id: user.id,
        interaction_type: 'quiz_generation',
        input_prompt: `Generate ${difficultyLevel} quiz for module: ${moduleId}`,
        output_response: `Generated 5 questions for ${difficultyLevel} difficulty`,
        model_used: 'openai/gpt-4.1-2025-04-14',
        tokens_consumed: tokensUsed,
      });

    if (logError) {
      console.error('Failed to log quiz generation:', logError);
    }

    console.log(`Quiz generated for user ${user.id}, quiz ID: ${quizData.id}, tokens: ${tokensUsed}`);

    return new Response(JSON.stringify({ 
      quiz: quizData,
      questions,
      difficultyLevel,
      tokensUsed,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});