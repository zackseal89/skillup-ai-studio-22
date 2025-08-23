import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrendInsightsRequest {
  focusArea?: string;
  timePeriod?: 'weekly' | 'monthly' | 'quarterly';
  includeMarketData?: boolean;
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

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      // User validation (optional for trend data)
    }

    const request: TrendInsightsRequest = await req.json() || {};
    const { focusArea = 'AI and Technology', timePeriod = 'weekly', includeMarketData = true } = request;

    // Check for cached trend data first
    const { data: cachedTrends } = await supabaseClient
      .from('trend_data')
      .select('*')
      .eq('time_period', timePeriod)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false })
      .limit(10);

    if (cachedTrends && cachedTrends.length > 0) {
      console.log('Returning cached trend data');
      return new Response(JSON.stringify({
        success: true,
        data: {
          trends: cachedTrends.map(trend => ({
            name: trend.trend_name,
            value: trend.trend_value,
            demandScore: trend.demand_score,
            growthPercentage: trend.growth_percentage,
            source: trend.data_source,
            updatedAt: trend.updated_at
          })),
          cached: true,
          lastUpdated: cachedTrends[0].created_at
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aimlApiKey = Deno.env.get('AIML_API_KEY');
    if (!aimlApiKey) {
      throw new Error('AIML API key not configured');
    }

    const systemPrompt = `You are a Technology Trends Analyst specializing in AI, machine learning, and emerging technologies.

Your task is to provide current market insights about in-demand skills and technology trends.

Return response in this exact JSON format:
{
  "trendingSkills": [
    {
      "skillName": "Skill Name",
      "category": "AI/ML/Data/Cloud/etc",
      "demandScore": number (0-100),
      "growthRate": number (-50 to 200),
      "marketValue": "high|medium|low",
      "description": "Why this skill is trending",
      "relatedTechnologies": ["tech1", "tech2"]
    }
  ],
  "marketInsights": {
    "topIndustries": ["industry1", "industry2"],
    "emergingRoles": ["role1", "role2"],
    "salaryTrends": "brief insight about compensation trends",
    "geographicHotspots": ["location1", "location2"]
  },
  "predictions": {
    "nextQuarter": "what skills will be hot next quarter",
    "yearAhead": "longer term trends to watch",
    "riskAreas": "skills that might decline"
  }
}`;

    const analysisPrompt = `Provide current technology and AI skills trends analysis:

FOCUS AREA: ${focusArea}
TIME PERIOD: ${timePeriod}
CURRENT DATE: ${new Date().toISOString().split('T')[0]}

Please analyze:
1. Most in-demand AI/ML skills right now
2. Emerging technologies gaining traction
3. Skills with highest growth in job postings
4. Programming languages and frameworks trending up
5. Cloud and DevOps capabilities in demand
6. Data science and analytics skills evolution

Consider current market conditions, recent technology releases, and industry shifts. Be specific about:
- Large Language Models (LLMs) and GenAI roles
- MLOps and AI Engineering positions  
- Data Engineering and Real-time Analytics
- Cloud AI services (AWS, Azure, GCP)
- New frameworks and tools gaining adoption

Provide realistic demand scores and growth rates based on current job market data and technology adoption trends.`;

    console.log('Calling AIML API for trend insights...');

    const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aimlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 1200,
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

    const insights = JSON.parse(aiResponse.choices[0].message.content);
    const tokensUsed = aiResponse.usage?.total_tokens || 0;

    // Store trends in database for caching
    const trendInserts = insights.trendingSkills.map((skill: any) => ({
      trend_type: 'skill_demand',
      trend_name: skill.skillName,
      trend_value: {
        category: skill.category,
        description: skill.description,
        relatedTechnologies: skill.relatedTechnologies,
        marketValue: skill.marketValue
      },
      demand_score: skill.demandScore,
      growth_percentage: skill.growthRate,
      time_period: timePeriod,
      data_source: 'aiml_api'
    }));

    await supabaseClient.from('trend_data').insert(trendInserts);

    return new Response(JSON.stringify({
      success: true,
      data: {
        trendingSkills: insights.trendingSkills,
        marketInsights: insights.marketInsights,
        predictions: insights.predictions,
        tokensUsed,
        cached: false,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in trend-insights function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate trend insights'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});