import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { topic } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing teaching agent request for topic: ${topic}, user: ${user.id}`);

    // Call the external Teaching Agent Team API
    const teachingAgentResponse = await fetch(`${req.url.split('/functions/')[0]}/api/teaching-agent-team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!teachingAgentResponse.ok) {
      console.error('Teaching Agent API error:', teachingAgentResponse.status, teachingAgentResponse.statusText);
      return new Response(JSON.stringify({ error: 'Failed to get response from Teaching Agent Team' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const teachingAgentData = await teachingAgentResponse.json();
    console.log('Teaching Agent response received:', teachingAgentData);

    // Validate the response structure
    if (!teachingAgentData.roadmap || !teachingAgentData.resources || !teachingAgentData.exercises) {
      console.error('Invalid Teaching Agent response structure:', teachingAgentData);
      return new Response(JSON.stringify({ error: 'Invalid response from Teaching Agent Team' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save the complete response to course_roadmaps table
    const { data: savedRoadmap, error: saveError } = await supabase
      .from('course_roadmaps')
      .insert({
        user_id: user.id,
        topic: topic,
        agent_type: 'teaching_agent',
        roadmap_content: teachingAgentData.roadmap,
        resources: teachingAgentData.resources,
        exercises: teachingAgentData.exercises,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving roadmap:', saveError);
      return new Response(JSON.stringify({ error: 'Failed to save roadmap' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Roadmap saved successfully:', savedRoadmap);

    // Return the structured response
    return new Response(JSON.stringify({
      success: true,
      data: {
        roadmap: teachingAgentData.roadmap,
        resources: teachingAgentData.resources,
        exercises: teachingAgentData.exercises,
        topic: topic,
        id: savedRoadmap.id
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in teaching-agent-team function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});