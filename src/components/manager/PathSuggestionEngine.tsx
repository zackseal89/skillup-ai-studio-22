import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lightbulb, BookOpen, Clock, Target, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PathSuggestionEngineProps {
  teamId: string;
}

interface CourseSuggestion {
  courseName: string;
  description: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  skillsCovered: string[];
  modules: string[];
  prerequisites: string[];
  confidenceScore: number;
  reasoning: string;
}

interface PathSuggestionResult {
  suggestions: CourseSuggestion[];
  overallAssessment: {
    roleComplexity: 'low' | 'medium' | 'high';
    recommendedSequence: string;
    estimatedTimeToCompetency: string;
    additionalResources: string[];
  };
  confidence: number;
  tokensUsed: number;
}

export const PathSuggestionEngine = ({ teamId }: PathSuggestionEngineProps) => {
  const [targetRole, setTargetRole] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [context, setContext] = useState("");
  const [result, setResult] = useState<PathSuggestionResult | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const suggestPaths = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('suggest-learning-paths', {
        body: {
          targetRole,
          teamId,
          difficultyLevel,
          context: context || undefined
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Learning Paths Generated!",
        description: `Found ${data.suggestions.length} recommended courses for ${targetRole}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['learning-path-suggestions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Path Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const popularRoles = [
    "AI Engineer",
    "Data Scientist", 
    "Machine Learning Engineer",
    "Product Manager (AI)",
    "AI Research Scientist",
    "Data Engineer",
    "MLOps Engineer",
    "AI Product Designer",
    "Business Intelligence Analyst",
    "AI Consultant"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>AI-Certified Path Suggestion Engine</CardTitle>
          </div>
          <CardDescription>
            Get 1-2 ready-made AI course recommendations for any target role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-role">Target Role</Label>
              <Input
                id="target-role"
                placeholder="e.g., AI Engineer, Data Scientist"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="min-h-[44px]"
              />
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 mt-2">
                {popularRoles.slice(0, 6).map((role) => (
                  <Button
                    key={role}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs px-2 justify-start"
                    onClick={() => setTargetRole(role)}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Preferred Difficulty</Label>
              <Select value={difficultyLevel} onValueChange={(value: any) => setDifficultyLevel(value)}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Input
              id="context"
              placeholder="e.g., focus on computer vision, prefer hands-on projects"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <Button
            onClick={() => suggestPaths.mutate()}
            disabled={suggestPaths.isPending || !targetRole.trim()}
            className="w-full"
            size="lg"
          >
            {suggestPaths.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <BookOpen className="h-4 w-4 mr-2" />
            )}
            {suggestPaths.isPending ? 'Generating Recommendations...' : 'Get Course Recommendations'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Assessment */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Learning Path Assessment</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GPT-4.1</Badge>
                  <Badge variant="secondary">{result.confidence}% confidence</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert>
                <Star className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Role Complexity:</strong> {result.overallAssessment.roleComplexity}</p>
                    <p><strong>Time to Competency:</strong> {result.overallAssessment.estimatedTimeToCompetency}</p>
                    <p><strong>Recommended Sequence:</strong> {result.overallAssessment.recommendedSequence}</p>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Course Suggestions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recommended Courses</h3>
            {result.suggestions.map((course, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{course.courseName}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        course.difficultyLevel === 'beginner' ? 'secondary' :
                        course.difficultyLevel === 'intermediate' ? 'default' : 'destructive'
                      }>
                        {course.difficultyLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.confidenceScore}% match
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Duration & Skills
                      </h5>
                      <p className="text-sm text-muted-foreground mb-2">{course.estimatedDuration}</p>
                      <div className="flex flex-wrap gap-1">
                        {course.skillsCovered.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Course Modules</h5>
                      <ul className="text-sm space-y-1">
                        {course.modules.slice(0, 3).map((module, idx) => (
                          <li key={idx} className="text-muted-foreground">• {module}</li>
                        ))}
                        {course.modules.length > 3 && (
                          <li className="text-xs text-muted-foreground">... and {course.modules.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {course.prerequisites.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Prerequisites</h5>
                      <div className="flex flex-wrap gap-1">
                        {course.prerequisites.map((prereq, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{prereq}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Why this course:</strong> {course.reasoning}
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex-1 min-h-[44px]">
                      Enroll Team
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none min-h-[44px]">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Resources */}
          {result.overallAssessment.additionalResources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.overallAssessment.additionalResources.map((resource, index) => (
                    <li key={index} className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{resource}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};