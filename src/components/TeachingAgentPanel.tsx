import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Brain, BookOpen, PenTool, Map } from "lucide-react";
import { useTeachingAgent, TeachingAgentResponse } from "@/hooks/useTeachingAgent";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const TeachingAgentPanel = () => {
  const [topic, setTopic] = useState("");
  const [lastResponse, setLastResponse] = useState<TeachingAgentResponse | null>(null);
  const teachingAgent = useTeachingAgent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      const response = await teachingAgent.mutateAsync({ topic: topic.trim() });
      setLastResponse(response);
    } catch (error) {
      console.error('Teaching agent error:', error);
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
            <CardTitle>AI Teaching Agent</CardTitle>
          </div>
          <CardDescription>
            Get a personalized learning plan with roadmap, resources, and exercises for any topic
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {lastResponse && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                <CardTitle>Learning Roadmap</CardTitle>
                <Badge variant="outline">Academic Advisor</Badge>
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