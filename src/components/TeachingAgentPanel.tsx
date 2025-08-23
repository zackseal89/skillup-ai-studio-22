import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Brain, BookOpen, PenTool, Map, MessageSquare, Sparkles, RefreshCw } from "lucide-react";
import { useTeachingAgent, TeachingAgentResponse } from "@/hooks/useTeachingAgent";
import { useInternalAI, usePersonalization, useReformatting, useSummarization } from "@/hooks/useInternalAI";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export const TeachingAgentPanel = () => {
  const [topic, setTopic] = useState("");
  const [assistantQuery, setAssistantQuery] = useState("");
  const [lastResponse, setLastResponse] = useState<TeachingAgentResponse | null>(null);
  const [assistantResponse, setAssistantResponse] = useState<string>("");
  const [activeTab, setActiveTab] = useState("roadmap");
  
  const teachingAgent = useTeachingAgent();
  const internalAI = useInternalAI();
  const personalization = usePersonalization();
  const reformatting = useReformatting();
  const summarization = useSummarization();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      const response = await teachingAgent.mutateAsync({ topic: topic.trim() });
      setLastResponse(response);
      setActiveTab("roadmap");
    } catch (error) {
      console.error('Teaching agent error:', error);
    }
  };

  const handleAssistantQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantQuery.trim()) return;

    try {
      const response = await internalAI.mutateAsync({
        prompt: assistantQuery.trim(),
        interactionType: 'insights',
        context: lastResponse ? { topic: lastResponse.topic, hasRoadmap: true } : undefined,
        systemPrompt: 'You are a helpful AI learning assistant. Provide clear, concise answers to help students learn effectively. Focus on practical advice and explanations.'
      });
      
      if (response.success) {
        setAssistantResponse(response.response);
        setAssistantQuery("");
      }
    } catch (error) {
      console.error('Assistant error:', error);
    }
  };

  const handlePersonalize = async (level: 'beginner' | 'intermediate' | 'advanced') => {
    if (!lastResponse?.roadmap) return;

    try {
      const response = await personalization.mutateAsync({
        content: lastResponse.roadmap,
        level,
        tone: 'encouraging',
        context: { topic: lastResponse.topic }
      });

      if (response.success) {
        setLastResponse(prev => prev ? { ...prev, roadmap: response.response } : null);
        toast({
          title: "Roadmap Personalized",
          description: `Content adjusted for ${level} level learners.`,
        });
      }
    } catch (error) {
      console.error('Personalization error:', error);
    }
  };

  const handleReformat = async (format: string) => {
    if (!lastResponse?.roadmap) return;

    try {
      const response = await reformatting.mutateAsync({
        content: lastResponse.roadmap,
        targetFormat: format,
        context: { topic: lastResponse.topic }
      });

      if (response.success) {
        setLastResponse(prev => prev ? { ...prev, roadmap: response.response } : null);
        toast({
          title: "Roadmap Reformatted",
          description: `Content converted to ${format} format.`,
        });
      }
    } catch (error) {
      console.error('Reformatting error:', error);
    }
  };

  const handleSummarize = async () => {
    if (!lastResponse?.roadmap) return;

    try {
      const response = await summarization.mutateAsync({
        content: lastResponse.roadmap,
        context: { topic: lastResponse.topic, type: 'learning_roadmap' }
      });

      if (response.success) {
        setAssistantResponse(response.response);
        setActiveTab("assistant");
        toast({
          title: "Summary Generated",
          description: "Roadmap summary created successfully.",
        });
      }
    } catch (error) {
      console.error('Summarization error:', error);
    }
  };

  const renderResources = (resources: any[]) => {
    if (!resources || resources.length === 0) return <p className="text-muted-foreground">No resources available.</p>;

    return (
      <div className="space-y-3">
        {resources.map((resource, index) => (
          <div key={index} className="p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{resource.type || 'Resource'}</Badge>
              {resource.difficulty && (
                <Badge variant="outline">{resource.difficulty}</Badge>
              )}
            </div>
            <h4 className="font-medium mb-1">{resource.title || resource.name || `Resource ${index + 1}`}</h4>
            {resource.description && (
              <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
            )}
            {resource.url && (
              <a href={resource.url} target="_blank" rel="noopener noreferrer" 
                 className="text-sm text-primary hover:underline">
                View Resource →
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderExercises = (exercises: any[]) => {
    if (!exercises || exercises.length === 0) return <p className="text-muted-foreground">No exercises available.</p>;

    return (
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div key={index} className="p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{exercise.type || 'Exercise'}</Badge>
              {exercise.difficulty && (
                <Badge variant="outline">{exercise.difficulty}</Badge>
              )}
              {exercise.duration && (
                <Badge variant="outline">{exercise.duration}</Badge>
              )}
            </div>
            <h4 className="font-medium mb-1">{exercise.title || exercise.name || `Exercise ${index + 1}`}</h4>
            {exercise.description && (
              <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
            )}
            {exercise.instructions && (
              <div className="text-sm">
                <strong>Instructions:</strong>
                <p className="mt-1 text-muted-foreground">{exercise.instructions}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Learning Hub</CardTitle>
          </div>
          <CardDescription>
            Comprehensive AI-powered learning assistance with external agent teams and internal AI models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="roadmap" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Learning Roadmap
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="space-y-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  placeholder="Enter a topic or niche (e.g., 'Machine Learning for Healthcare')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={teachingAgent.isPending}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!topic.trim() || teachingAgent.isPending}
                >
                  {teachingAgent.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Generate Plan"
                  )}
                </Button>
              </form>
              
              {lastResponse && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePersonalize('beginner')}
                    disabled={personalization.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Beginner Level
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePersonalize('advanced')}
                    disabled={personalization.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Advanced Level
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReformat('bullet points')}
                    disabled={reformatting.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Bullet Points
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSummarize}
                    disabled={summarization.isPending}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Summarize
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assistant" className="space-y-4">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Ask questions, get explanations, or request study tips. The AI assistant uses lightweight AIML models for quick responses.
                </div>
                
                <form onSubmit={handleAssistantQuery} className="space-y-3">
                  <Textarea
                    placeholder="Ask anything about learning, studying, or get help with concepts..."
                    value={assistantQuery}
                    onChange={(e) => setAssistantQuery(e.target.value)}
                    disabled={internalAI.isPending}
                    className="min-h-[80px]"
                  />
                  <Button 
                    type="submit" 
                    disabled={!assistantQuery.trim() || internalAI.isPending}
                    className="w-full"
                  >
                    {internalAI.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    Ask AI Assistant
                  </Button>
                </form>

                {assistantResponse && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">AI Assistant Response</CardTitle>
                        <Badge variant="outline">AIML GPT-5</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {assistantResponse}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {lastResponse && activeTab === "roadmap" && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                <CardTitle>Learning Roadmap</CardTitle>
                <Badge variant="outline">External Teaching Agent Team</Badge>
              </div>
              <CardDescription>Your personalized learning path for "{lastResponse.topic}"</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {lastResponse.roadmap}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Curated Resources</CardTitle>
                  <Badge variant="outline">Librarian Agent</Badge>
                </div>
                <CardDescription>Recommended learning materials and content</CardDescription>
              </CardHeader>
              <CardContent>
                {renderResources(lastResponse.resources)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-primary" />
                  <CardTitle>Practice Exercises</CardTitle>
                  <Badge variant="outline">Teaching Assistant</Badge>
                </div>
                <CardDescription>Hands-on activities and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {renderExercises(lastResponse.exercises)}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};