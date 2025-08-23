import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GradeQuizRequest {
  quizId: string;
  answers: Record<string, string>; // questionId -> answer
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

    const { quizId, answers }: GradeQuizRequest = await req.json();

    if (!quizId || !answers) {
      return new Response(JSON.stringify({ error: 'Missing required fields: quizId, answers' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the quiz from database
    const { data: quiz, error: quizError } = await supabaseClient
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('user_id', user.id)
      .single();

    if (quizError || !quiz) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const questions = quiz.questions as any[];
    
    // Grade the quiz automatically
    let correctCount = 0;
    const feedback: any[] = [];

    for (const question of questions) {
      const userAnswer = answers[question.id.toString()];
      const isCorrect = question.type === 'multiple-choice' 
        ? userAnswer === question.correctAnswer
        : normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer);

      if (isCorrect) {
        correctCount++;
      }

      feedback.push({
        questionId: question.id,
        question: question.question,
        userAnswer: userAnswer || 'No answer provided',
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    }

    const gradePercentage = Math.round((correctCount / questions.length) * 100);

    // For complex short-answer questions, use AI to provide detailed feedback
    const aimlApiKey = Deno.env.get('AIML_API_KEY');
    let aiFeedback = '';
    
    if (aimlApiKey && gradePercentage < 80) {
      try {
        const systemPrompt = `You are an expert educational assessor. Provide constructive, encouraging feedback on quiz performance.

        Guidelines:
        1. Be supportive and motivational
        2. Highlight what the student did well
        3. Provide specific guidance for improvement
        4. Suggest study strategies for areas of weakness
        5. Keep feedback concise but actionable`;

        const userPrompt = `
        QUIZ PERFORMANCE:
        - Score: ${gradePercentage}%
        - Correct: ${correctCount}/${questions.length}
        - Difficulty: ${quiz.difficulty_level}
        
        DETAILED RESULTS:
        ${feedback.map(f => `
        Q: ${f.question}
        Student Answer: ${f.userAnswer}
        Correct Answer: ${f.correctAnswer}
        Result: ${f.isCorrect ? 'Correct' : 'Incorrect'}
        `).join('\n')}
        
        Provide encouraging feedback and specific improvement suggestions.`;

        console.log(`Generating AI feedback for user ${user.id}, score: ${gradePercentage}%`);

        const aiResponse = await fetch('https://api.aimlapi.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${aimlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-5-mini-2025-08-07', // Using GPT-5 mini for feedback
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_completion_tokens: 500,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiFeedback = aiData.choices[0].message.content;
          
          // Log AI feedback generation
          const { error: logError } = await supabaseClient
            .from('ai_interactions')
            .insert({
              user_id: user.id,
              interaction_type: 'quiz_feedback',
              input_prompt: `Feedback for quiz score: ${gradePercentage}%`,
              output_response: aiFeedback,
              model_used: 'openai/gpt-5-mini-2025-08-07',
              tokens_consumed: aiData.usage?.total_tokens || 0,
            });
        }
      } catch (aiError) {
        console.error('AI feedback generation failed:', aiError);
        // Continue without AI feedback
      }
    }

    // Save quiz response to database
    const { data: responseData, error: responseError } = await supabaseClient
      .from('quiz_responses')
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        answers,
        grade_percentage: gradePercentage,
        feedback: {
          questions: feedback,
          aiFeedback,
          score: gradePercentage,
          passed: gradePercentage >= 70
        },
      })
      .select()
      .single();

    if (responseError) {
      console.error('Failed to save quiz response:', responseError);
      throw new Error('Failed to save quiz response');
    }

    console.log(`Quiz graded for user ${user.id}, score: ${gradePercentage}%`);

    // Determine performance level
    let performanceLevel = 'needs-improvement';
    if (gradePercentage >= 90) performanceLevel = 'excellent';
    else if (gradePercentage >= 80) performanceLevel = 'good';
    else if (gradePercentage >= 70) performanceLevel = 'satisfactory';

    return new Response(JSON.stringify({ 
      gradePercentage,
      correctCount,
      totalQuestions: questions.length,
      feedback,
      aiFeedback,
      performanceLevel,
      passed: gradePercentage >= 70,
      responseId: responseData.id,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in grade-quiz function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to normalize answers for comparison
function normalizeAnswer(answer: string): string {
  if (!answer) return '';
  return answer.toLowerCase().trim().replace(/[^\w\s]/g, '');
}