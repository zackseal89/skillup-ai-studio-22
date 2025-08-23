import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Zap, RefreshCw, Clock, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";

interface TrendingSkill {
  skillName: string;
  category: string;
  demandScore: number;
  growthRate: number;
  marketValue: 'high' | 'medium' | 'low';
  description: string;
  relatedTechnologies: string[];
}

interface TrendInsightsData {
  trendingSkills: TrendingSkill[];
  marketInsights: {
    topIndustries: string[];
    emergingRoles: string[];
    salaryTrends: string;
    geographicHotspots: string[];
  };
  predictions: {
    nextQuarter: string;
    yearAhead: string;
    riskAreas: string;
  };
  cached: boolean;
  lastUpdated?: string;
  generatedAt?: string;
}

export const TrendInsights = () => {
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const { toast } = useToast();

  // Fetch trend insights
  const {
    data: trendData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['trend-insights', timePeriod],
    queryFn: async (): Promise<TrendInsightsData> => {
      const { data, error } = await supabase.functions.invoke('trend-insights', {
        body: {
          timePeriod,
          focusArea: 'AI and Technology',
          includeMarketData: true
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

  const refreshInsights = useMutation({
    mutationFn: () => refetch(),
    onSuccess: () => {
      toast({
        title: "Insights Refreshed!",
        description: "Latest market trends and skill demands updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Refresh Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getTrendIcon = (growthRate: number) => {
    if (growthRate > 10) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growthRate < -10) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <TrendingUp className="h-4 w-4 text-blue-600" />;
  };

  const getMarketValueColor = (value: string) => {
    switch (value) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>AI Skills Trend Insights</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshInsights.mutate()}
                disabled={refreshInsights.isPending}
              >
                <RefreshCw className={`h-4 w-4 ${refreshInsights.isPending ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <CardDescription>
            Real-time market insights and AI skill demand analysis
            {trendData?.cached && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Last updated: {new Date(trendData.lastUpdated || '').toLocaleString()}
              </div>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">Loading market insights...</div>
          </CardContent>
        </Card>
      ) : trendData ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trending Skills */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Top Trending Skills This {timePeriod.slice(0, -2)}</h3>
            <div className="grid gap-3">
              {trendData.trendingSkills.slice(0, 6).map((skill, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{skill.skillName}</h4>
                          {getTrendIcon(skill.growthRate)}
                          <Badge variant="secondary" className="text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {skill.relatedTechnologies.slice(0, 3).map((tech, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold">{skill.demandScore}</div>
                        <div className="text-xs text-muted-foreground">demand score</div>
                        <div className={`text-sm font-medium ${getMarketValueColor(skill.marketValue)}`}>
                          {skill.marketValue} value
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {skill.growthRate > 0 ? '+' : ''}{skill.growthRate}% growth
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Market Insights</h3>
            
            {/* Top Industries */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Leading Industries</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {trendData.marketInsights.topIndustries.map((industry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{industry}</span>
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emerging Roles */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Emerging Roles</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {trendData.marketInsights.emergingRoles.map((role, index) => (
                    <div key={index} className="flex items-center">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-2" />
                      <span className="text-sm">{role}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Hotspots */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Geographic Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {trendData.marketInsights.geographicHotspots.map((location, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-sm">{location}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Salary Trends */}
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Salary Trends:</strong> {trendData.marketInsights.salaryTrends}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      ) : null}

      {/* Predictions */}
      {trendData?.predictions && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Next Quarter</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{trendData.predictions.nextQuarter}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Year Ahead</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{trendData.predictions.yearAhead}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Risk Areas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{trendData.predictions.riskAreas}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};