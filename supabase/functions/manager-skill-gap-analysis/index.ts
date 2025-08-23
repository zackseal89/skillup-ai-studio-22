import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManagerSkillGapRequest {
  teamId: string;
  jobRoles: Array<{
    title: string;
    description: string;
    requiredSkills?: string[];
  }>;
  employeeProfiles: Array<{
    id: string;
    name: string;
    skills: string;
    experience?: string;
  }>;
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

    const request: ManagerSkillGapRequest = await req.json();
    const { teamId, jobRoles, employeeProfiles } = request;

    if (!teamId || !jobRoles?.length || !employeeProfiles?.length) {
      throw new Error('Missing required fields: teamId, jobRoles, or employeeProfiles');
    }

    const aimlApiKey = Deno.env.get('AIML_API_KEY');
    if (!aimlApiKey) {
      throw new Error('AIML API key not configured');
    }

    // Prepare system prompt for bulk analysis
    const systemPrompt = `You are an expert HR and Skills Analyst specializing in AI and technology skills assessment. 

Your task is to analyze multiple employee profiles against target job roles and identify skill gaps across the team.

Provide analysis in this exact JSON format:
{
  "teamAnalysis": {
    "overallGapPercentage": number (0-100),
    "criticalSkillGaps": ["skill1", "skill2"],
    "teamStrengths": ["strength1", "strength2"],
    "recommendations": ["rec1", "rec2"]
  },
  "individualAnalyses": [
    {
      "employeeId": "id",
      "employeeName": "name",
      "gapPercentage": number (0-100),
      "missingSkills": ["skill1", "skill2"],
      "strongAreas": ["area1", "area2"],
      "developmentPriority": "high|medium|low",
      "recommendedActions": ["action1", "action2"]
    }
  ],
  "roleSpecificInsights": [
    {
      "roleTitle": "title",
      "teamReadiness": number (0-100),
      "majorGaps": ["gap1", "gap2"],
      "recommendedTraining": ["training1", "training2"]
    }
  ]
}`;

    // Create analysis prompt
    const analysisPrompt = `Analyze this team's skill alignment with target roles:

TARGET ROLES:
${jobRoles.map(role => `
Role: ${role.title}
Description: ${role.description}
Required Skills: ${role.requiredSkills?.join(', ') || 'Not specified'}
`).join('\n')}

EMPLOYEE PROFILES:
${employeeProfiles.map(emp => `
Employee: ${emp.name} (ID: ${emp.id})
Current Skills/Experience: ${emp.skills}
${emp.experience ? `Additional Experience: ${emp.experience}` : ''}
`).join('\n')}

Focus on:
1. AI/ML skills, data science capabilities, programming languages
2. Soft skills like leadership, communication, project management
3. Domain-specific expertise relevant to the roles
4. Emerging technology skills (cloud, DevOps, cybersecurity)

Provide gap percentages and actionable recommendations for each individual and the team overall.`;

    console.log('Calling AIML API for team skill gap analysis...');

    const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aimlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 2000,
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

    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);
    const tokensUsed = aiResponse.usage?.total_tokens || 0;

    // Store the assessment in the database
    const { data: assessment, error: insertError } = await supabaseClient
      .from('team_skill_assessments')
      .insert({
        team_id: teamId,
        manager_id: user.id,
        assessment_type: 'bulk_analysis',
        job_roles: jobRoles,
        employee_profiles: employeeProfiles,
        skill_gaps_data: analysisResult
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing assessment:', insertError);
      throw new Error('Failed to store assessment results');
    }

    // Log the interaction
    await supabaseClient.from('ai_interactions').insert({
      user_id: user.id,
      interaction_type: 'manager_skill_gap_analysis',
      input_prompt: analysisPrompt,
      output_response: JSON.stringify(analysisResult),
      model_used: 'gpt-5-2025-08-07',
      tokens_consumed: tokensUsed
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        assessmentId: assessment.id,
        analysis: analysisResult,
        tokensUsed,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in manager-skill-gap-analysis function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to analyze team skills'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});