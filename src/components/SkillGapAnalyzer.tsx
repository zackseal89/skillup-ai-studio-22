import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Target, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoadmaps } from "@/hooks/useRoadmaps";

interface SkillGap {
  count: number;
  skills: string[];
  summary: string;
}

interface SkillGapResult {
  analysis: string;
  skillGaps: SkillGap;
  analysisType: string;
  targetRole: string;
  tokensUsed: number;
  success: boolean;
}

export const SkillGapAnalyzer = () => {
  const [cvContent, setCvContent] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analysisType, setAnalysisType] = useState<'general' | 'roadmap-specific'>('general');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const { data: roadmaps } = useRoadmaps();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCvContent(content);
      toast({
        title: "File Uploaded",
        description: `${uploadedFile.name} has been uploaded successfully.`,
      });
    };
    reader.readAsText(uploadedFile);
  };

  const handleAnalysis = async () => {
    if (!cvContent.trim()) {
      toast({
        title: "Error",
        description: "Please upload your CV or enter your skills first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      let roadmapContent = '';
      
      if (analysisType === 'roadmap-specific' && selectedRoadmapId) {
        const selectedRoadmap = roadmaps?.find(r => r.id === selectedRoadmapId);
        roadmapContent = selectedRoadmap?.roadmap_content || '';
      }

      const { data, error } = await supabase.functions.invoke('skill-gap-analysis', {
        body: {
          cvContent: cvContent.trim(),
          targetRole: targetRole.trim() || undefined,
          roadmapContent,
          analysisType
        }
      });

      if (error) {
        console.error('Skill gap analysis error:', error);
        throw new Error(error.message || 'Failed to analyze skills');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      toast({
        title: "Analysis Complete!",
        description: `Found ${data.skillGaps.count} skill gaps to address.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Skill Gap Analyzer</CardTitle>
          </div>
          <CardDescription>
            Upload your CV or skill list to identify gaps and get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={analysisType} onValueChange={(value) => setAnalysisType(value as 'general' | 'roadmap-specific')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General Market Analysis</TabsTrigger>
              <TabsTrigger value="roadmap-specific">Compare to Roadmap</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Analyze your skills against current market demands and AI/technology trends.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="roadmap-specific" className="space-y-4">
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  Compare your skills against a specific learning roadmap you've generated.
                </AlertDescription>
              </Alert>

              {roadmaps && roadmaps.length > 0 ? (
                <div className="space-y-2">
                  <Label htmlFor="roadmap-select">Select Roadmap to Compare Against</Label>
                  <select
                    id="roadmap-select"
                    value={selectedRoadmapId}
                    onChange={(e) => setSelectedRoadmapId(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Choose a roadmap...</option>
                    {roadmaps.map((roadmap) => (
                      <option key={roadmap.id} value={roadmap.id}>
                        {roadmap.topic} ({new Date(roadmap.generated_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No roadmaps found. Generate a roadmap first using the AI Teaching Agent.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-role">Target Role (Optional)</Label>
              <Input
                id="target-role"
                placeholder="e.g., 'AI Engineer', 'Data Scientist', 'Product Manager'"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload CV/Resume</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv-content">Or Paste Your Skills/CV Content</Label>
              <Textarea
                id="cv-content"
                placeholder="Paste your CV content, skill list, or job experience here..."
                value={cvContent}
                onChange={(e) => setCvContent(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <Button 
              onClick={handleAnalysis}
              disabled={isAnalyzing || !cvContent.trim() || (analysisType === 'roadmap-specific' && !selectedRoadmapId)}
              className="w-full"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing Skills...' : 'Analyze Skill Gaps'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle>Skill Gap Analysis Results</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">GPT-5</Badge>
                <Badge variant="secondary">{result.tokensUsed} tokens</Badge>
              </div>
            </div>
            <CardDescription>
              Analysis for: {result.targetRole}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.skillGaps.count > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>You are missing {result.skillGaps.count} key skills:</strong>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.skillGaps.skills.map((skill, index) => (
                      <Badge key={index} variant="destructive">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <h4 className="font-medium">Detailed Analysis:</h4>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-muted/50 rounded-lg">
                  {result.analysis}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};