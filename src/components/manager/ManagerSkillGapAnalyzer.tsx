import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Target, AlertTriangle, Users, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ManagerSkillGapAnalyzerProps {
  teamId: string;
}

interface JobRole {
  title: string;
  description: string;
  requiredSkills?: string[];
}

interface EmployeeProfile {
  id: string;
  name: string;
  skills: string;
  experience?: string;
}

interface SkillGapResult {
  teamAnalysis: {
    overallGapPercentage: number;
    criticalSkillGaps: string[];
    teamStrengths: string[];
    recommendations: string[];
  };
  individualAnalyses: Array<{
    employeeId: string;
    employeeName: string;
    gapPercentage: number;
    missingSkills: string[];
    strongAreas: string[];
    developmentPriority: 'high' | 'medium' | 'low';
    recommendedActions: string[];
  }>;
  roleSpecificInsights: Array<{
    roleTitle: string;
    teamReadiness: number;
    majorGaps: string[];
    recommendedTraining: string[];
  }>;
}

export const ManagerSkillGapAnalyzer = ({ teamId }: ManagerSkillGapAnalyzerProps) => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([{ title: '', description: '' }]);
  const [employeeProfiles, setEmployeeProfiles] = useState<EmployeeProfile[]>([
    { id: '1', name: '', skills: '' }
  ]);
  const [result, setResult] = useState<{ analysis: SkillGapResult; tokensUsed: number } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const analyzeSkillGaps = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('manager-skill-gap-analysis', {
        body: {
          teamId,
          jobRoles: jobRoles.filter(role => role.title && role.description),
          employeeProfiles: employeeProfiles.filter(emp => emp.name && emp.skills)
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Analysis Complete!",
        description: `Found ${data.analysis.teamAnalysis.overallGapPercentage}% overall skill gap.`,
      });
      queryClient.invalidateQueries({ queryKey: ['team-skill-assessments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addJobRole = () => {
    setJobRoles([...jobRoles, { title: '', description: '' }]);
  };

  const updateJobRole = (index: number, field: keyof JobRole, value: string) => {
    const updated = [...jobRoles];
    updated[index] = { ...updated[index], [field]: value };
    setJobRoles(updated);
  };

  const addEmployeeProfile = () => {
    setEmployeeProfiles([...employeeProfiles, { 
      id: Date.now().toString(), 
      name: '', 
      skills: '' 
    }]);
  };

  const updateEmployeeProfile = (index: number, field: keyof EmployeeProfile, value: string) => {
    const updated = [...employeeProfiles];
    updated[index] = { ...updated[index], [field]: value };
    setEmployeeProfiles(updated);
  };

  const canAnalyze = jobRoles.some(role => role.title && role.description) && 
                    employeeProfiles.some(emp => emp.name && emp.skills);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <CardTitle>Team Skill Gap Analyzer</CardTitle>
          </div>
          <CardDescription>
            Analyze your team's skills against target job roles and get visual gap analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Roles Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h4 className="font-medium">Target Job Roles</h4>
              <Button variant="outline" size="sm" onClick={addJobRole} className="w-full sm:w-auto">
                <Users className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
            
            {jobRoles.map((role, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`role-title-${index}`}>Role Title</Label>
                    <Input
                      id={`role-title-${index}`}
                      placeholder="e.g., AI Engineer, Data Scientist"
                      value={role.title}
                      onChange={(e) => updateJobRole(index, 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`role-desc-${index}`}>Role Description & Requirements</Label>
                    <Textarea
                      id={`role-desc-${index}`}
                      placeholder="Describe the role responsibilities and required skills..."
                      value={role.description}
                      onChange={(e) => updateJobRole(index, 'description', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Employee Profiles Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h4 className="font-medium">Employee Profiles</h4>
              <Button variant="outline" size="sm" onClick={addEmployeeProfile} className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
            
            {employeeProfiles.map((employee, index) => (
              <Card key={employee.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`emp-name-${index}`}>Employee Name</Label>
                    <Input
                      id={`emp-name-${index}`}
                      placeholder="Employee name"
                      value={employee.name}
                      onChange={(e) => updateEmployeeProfile(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`emp-skills-${index}`}>Current Skills & Experience</Label>
                    <Textarea
                      id={`emp-skills-${index}`}
                      placeholder="List current skills, experience, technologies known..."
                      value={employee.skills}
                      onChange={(e) => updateEmployeeProfile(index, 'skills', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`emp-exp-${index}`}>Additional Experience (Optional)</Label>
                    <Input
                      id={`emp-exp-${index}`}
                      placeholder="Years of experience, certifications, etc."
                      value={employee.experience || ''}
                      onChange={(e) => updateEmployeeProfile(index, 'experience', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => analyzeSkillGaps.mutate()}
            disabled={analyzeSkillGaps.isPending || !canAnalyze}
            className="w-full"
            size="lg"
          >
            {analyzeSkillGaps.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            {analyzeSkillGaps.isPending ? 'Analyzing Team Skills...' : 'Analyze Team Skill Gaps'}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle>Team Skill Gap Analysis Results</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">GPT-5</Badge>
                <Badge variant="secondary">{result.tokensUsed} tokens</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Team Overview */}
            <Alert>
              <PieChart className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Overall Team Gap: {result.analysis.teamAnalysis.overallGapPercentage}%</strong></p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm">Critical gaps:</span>
                    {result.analysis.teamAnalysis.criticalSkillGaps.map((skill, index) => (
                      <Badge key={index} variant="destructive">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Individual Analysis */}
            <div className="space-y-4">
              <h4 className="font-medium">Individual Employee Analysis</h4>
              <div className="grid gap-4">
                {result.analysis.individualAnalyses.map((individual, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{individual.employeeName}</h5>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            individual.developmentPriority === 'high' ? 'destructive' :
                            individual.developmentPriority === 'medium' ? 'default' : 'secondary'
                          }>
                            {individual.developmentPriority} priority
                          </Badge>
                          <span className="text-sm font-medium">{individual.gapPercentage}% gap</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-red-600">Missing Skills:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {individual.missingSkills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-green-600">Strong Areas:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {individual.strongAreas.map((area, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{area}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium text-blue-600">Recommended Actions:</p>
                        <ul className="list-disc list-inside mt-1 text-sm space-y-1">
                          {individual.recommendedActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Role-Specific Insights */}
            <div className="space-y-4">
              <h4 className="font-medium">Role-Specific Team Readiness</h4>
              <div className="grid gap-4">
                {result.analysis.roleSpecificInsights.map((roleInsight, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{roleInsight.roleTitle}</h5>
                        <span className="text-sm font-medium">{roleInsight.teamReadiness}% ready</span>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-red-600">Major Gaps:</p>
                          <ul className="list-disc list-inside mt-1">
                            {roleInsight.majorGaps.map((gap, idx) => (
                              <li key={idx}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-blue-600">Recommended Training:</p>
                          <ul className="list-disc list-inside mt-1">
                            {roleInsight.recommendedTraining.map((training, idx) => (
                              <li key={idx}>{training}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Team Recommendations */}
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Team Development Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {result.analysis.teamAnalysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};