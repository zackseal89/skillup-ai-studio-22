import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InternalAIRequest {
  prompt: string;
  interactionType: string;
  context?: any;
  systemPrompt?: string;
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

    const { prompt, interactionType, context, systemPrompt }: InternalAIRequest = await req.json();

    if (!prompt || !interactionType) {
      return new Response(JSON.stringify({ error: 'Missing required fields: prompt and interactionType' }), {
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

    // Build system prompt based on interaction type
    let defaultSystemPrompt = '';
    switch (interactionType) {
      case 'summarization':
        defaultSystemPrompt = 'You are a helpful assistant that creates concise, clear summaries. Focus on key points and actionable insights.';
        break;
      case 'reformatting':
        defaultSystemPrompt = 'You are a helpful assistant that reformats content while preserving meaning. Make content more readable and organized.';
        break;
      case 'personalization':
        defaultSystemPrompt = 'You are a helpful assistant that personalizes content tone and complexity based on user preferences. Adjust language for the target audience.';
        break;
      case 'translation':
        defaultSystemPrompt = 'You are a helpful assistant that provides accurate translations while maintaining context and meaning.';
        break;
      case 'insights':
        defaultSystemPrompt = 'You are a helpful assistant that generates quick insights and actionable recommendations from learning data.';
        break;
      default:
        defaultSystemPrompt = 'You are a helpful assistant that provides clear, concise responses.';
    }

    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

    // Call AIML API
    console.log(`Making internal AI call for user ${user.id}, type: ${interactionType}`);
    
    const messages = [
      { role: 'system', content: finalSystemPrompt },
      { role: 'user', content: context ? `Context: ${JSON.stringify(context)}\n\nRequest: ${prompt}` : prompt }
    ];

    const aiResponse = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aimlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-2025-08-07',
        messages,
        max_completion_tokens: 1000,
        // Note: temperature not supported for GPT-5 models
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AIML API error:', errorText);
      throw new Error(`AIML API error: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;
    const tokensUsed = aiData.usage?.total_tokens || 0;

    // Log the interaction to database
    const { error: logError } = await supabaseClient
      .from('ai_interactions')
      .insert({
        user_id: user.id,
        interaction_type: interactionType,
        input_prompt: prompt,
        output_response: response,
        model_used: 'openai/gpt-5-2025-08-07',
        tokens_consumed: tokensUsed,
      });

    if (logError) {
      console.error('Failed to log AI interaction:', logError);
      // Don't fail the request, just log the error
    }

    console.log(`Internal AI response generated for user ${user.id}, tokens: ${tokensUsed}`);

    return new Response(JSON.stringify({ 
      response,
      interactionType,
      tokensUsed,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in internal-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});