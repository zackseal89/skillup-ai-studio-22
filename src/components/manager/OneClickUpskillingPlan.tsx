import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Zap, Users, ArrowRight, Download, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTeamMembers } from "@/hooks/useTeams";
import { useMutation, useQuery } from "@tanstack/react-query";

interface OneClickUpskillingPlanProps {
  teamId: string;
}

interface TeamRoadmapResult {
  aggregatedPlan: {
    title: string;
    duration: string;
    phases: Array<{
      name: string;
      duration: string;
      skills: string[];
      courses: string[];
    }>;
    skillPriorities: Array<{
      skill: string;
      urgency: 'high' | 'medium' | 'low';
      employeeCount: number;
    }>;
  };
  individualPlans: Array<{
    employeeId: string;
    employeeName: string;
    currentSkillLevel: number;
    recommendedPath: string[];
    estimatedTime: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  comparison: {
    currentTeamSkills: string[];
    targetTeamSkills: string[];
    gapAnalysis: string;
    readinessScore: number;
  };
  tokensUsed: number;
}

export const OneClickUpskillingPlan = ({ teamId }: OneClickUpskillingPlanProps) => {
  const [result, setResult] = useState<TeamRoadmapResult | null>(null);
  const { toast } = useToast();
  const { data: members } = useTeamMembers(teamId);

  // Fetch team data for analysis
  const { data: teamData } = useQuery({
    queryKey: ['team-upskilling-data', teamId],
    queryFn: async () => {
      if (!members) return null;
      
      const userIds = members.map(m => m.user_id);
      
      // Get profiles, skills, and progress
      const [profilesRes, skillsRes, progressRes] = await Promise.all([
        supabase.from('profiles').select('*').in('user_id', userIds),
        supabase.from('user_skills').select(`
          *,
          skills:skill_id (name, category, difficulty_level)
        `).in('user_id', userIds),
        supabase.from('progress').select('*').in('user_id', userIds)
      ]);

      return {
        profiles: profilesRes.data || [],
        skills: skillsRes.data || [],
        progress: progressRes.data || []
      };
    },
    enabled: !!members && members.length > 0,
  });

  const generateTeamRoadmap = useMutation({
    mutationFn: async () => {
      if (!teamData || !members) {
        throw new Error('Team data not available');
      }

      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: {
          userDetails: {
            industry: teamData.profiles[0]?.industry || 'Technology',
            role: 'Team Manager',
            aiSkillLevel: 'intermediate',
            learningGoals: 'Team-wide AI upskilling and capability building',
            timeCommitment: '5-10 hours per week per team member',
            learningStyle: ['hands-on', 'collaborative', 'project-based']
          },
          isTeamPlan: true,
          teamMembers: members.map((member, index) => {
            const profile = teamData.profiles.find(p => p.user_id === member.user_id);
            const userSkills = teamData.skills.filter(s => s.user_id === member.user_id);
            const userProgress = teamData.progress.filter(p => p.user_id === member.user_id);
            
            return {
              id: member.user_id,
              name: profile?.full_name || `Team Member ${index + 1}`,
              role: profile?.role || 'Team Member',
              experience: profile?.experience_level || 'intermediate',
              currentSkills: userSkills.map(s => s.skills?.name || '').filter(Boolean),
              skillLevels: userSkills.reduce((acc, s) => ({
                ...acc,
                [s.skills?.name || '']: s.current_level
              }), {}),
              progressData: userProgress
            };
          })
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Team Roadmap Generated!",
        description: `Comprehensive upskilling plan created for ${members?.length} team members.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canGenerate = members && members.length > 0 && teamData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>One-Click Upskilling Plan Generator</CardTitle>
          </div>
          <CardDescription>
            Generate a comprehensive AI learning roadmap for your entire team with one click
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Team Overview */}
          {teamData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{members?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{teamData.skills.length}</div>
                  <div className="text-sm text-muted-foreground">Skills Tracked</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{teamData.progress.length}</div>
                  <div className="text-sm text-muted-foreground">Learning Activities</div>
                </div>
              </Card>
            </div>
          )}

          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              This will analyze your team's current skills, identify gaps, and create personalized learning paths 
              that work together toward common goals. The plan includes individual recommendations and team milestones.
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => generateTeamRoadmap.mutate()}
            disabled={generateTeamRoadmap.isPending || !canGenerate}
            className="w-full"
            size="lg"
          >
            {generateTeamRoadmap.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {generateTeamRoadmap.isPending ? 'Generating Team Roadmap...' : 'Generate AI Learning Plan for Team'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Team Plan Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Team Upskilling Roadmap</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GPT-5</Badge>
                  <Badge variant="secondary">{result.tokensUsed} tokens</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
              <CardDescription>
                {result.aggregatedPlan.title} • {result.aggregatedPlan.duration}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Readiness Score */}
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Current Team Readiness: {result.comparison.readinessScore}%</strong></p>
                    <p className="text-sm">{result.comparison.gapAnalysis}</p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Learning Phases */}
              <div className="space-y-4">
                <h4 className="font-medium">Learning Phases</h4>
                <div className="grid gap-4">
                  {result.aggregatedPlan.phases.map((phase, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{phase.name}</h5>
                          <Badge variant="outline">{phase.duration}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-blue-600 mb-2">Skills to Develop:</p>
                            <div className="flex flex-wrap gap-1">
                              {phase.skills.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-600 mb-2">Recommended Courses:</p>
                            <ul className="text-sm space-y-1">
                              {phase.courses.map((course, idx) => (
                                <li key={idx} className="text-muted-foreground">• {course}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

                {/* Skill Priorities */}
                <div className="space-y-4">
                  <h4 className="font-medium">Team Skill Priorities</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.aggregatedPlan.skillPriorities.map((priority, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">{priority.skill}</h5>
                            <Badge variant={
                              priority.urgency === 'high' ? 'destructive' :
                              priority.urgency === 'medium' ? 'default' : 'secondary'
                            } className="text-xs">
                              {priority.urgency}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {priority.employeeCount} team members need this skill
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
            </CardContent>
          </Card>

          {/* Individual Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Learning Paths</CardTitle>
              <CardDescription>
                Personalized recommendations for each team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.individualPlans.map((plan, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{plan.employeeName}</h5>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            plan.priority === 'high' ? 'destructive' :
                            plan.priority === 'medium' ? 'default' : 'secondary'
                          } className="text-xs">
                            {plan.priority} priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Level {plan.currentSkillLevel}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <strong>Estimated Time:</strong> {plan.estimatedTime}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Recommended Learning Path:</p>
                          <div className="flex flex-wrap gap-1">
                            {plan.recommendedPath.map((step, idx) => (
                              <div key={idx} className="flex items-center">
                                <Badge variant="outline" className="text-xs">{step}</Badge>
                                {idx < plan.recommendedPath.length - 1 && (
                                  <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Team Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.comparison.currentTeamSkills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <Badge variant="secondary" className="text-xs">{skill}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Target Team Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.comparison.targetTeamSkills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <Badge variant="default" className="text-xs">{skill}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};