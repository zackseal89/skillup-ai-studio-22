
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTeamProgress } from "@/hooks/useTeams";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  BookOpen,
  Users
} from "lucide-react";

interface ManagerRecommendationsProps {
  teamId: string;
}

export const ManagerRecommendations = ({ teamId }: ManagerRecommendationsProps) => {
  const { data: teamProgress } = useTeamProgress(teamId);

  if (!teamProgress) {
    return null;
  }

  // Generate AI-powered recommendations based on team data
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Calculate team statistics
    const totalProgress = teamProgress.progress.length;
    const completedModules = teamProgress.progress.filter(p => p.status === 'completed').length;
    const averageProgress = totalProgress > 0 
      ? Math.round(teamProgress.progress.reduce((sum, p) => sum + p.completion_percentage, 0) / totalProgress)
      : 0;

    // Low completion rate recommendation
    if (averageProgress < 50) {
      recommendations.push({
        id: 'low-completion',
        type: 'Performance',
        priority: 'High',
        title: 'Boost Team Engagement',
        description: 'Your team has a low average completion rate. Consider scheduling dedicated learning time or providing additional support.',
        action: 'Schedule 1-on-1 check-ins with struggling team members',
        impact: 'High',
        icon: AlertTriangle,
        color: 'text-red-600'
      });
    }

    // Skills gap analysis
    const skillCategories = teamProgress.userSkills.reduce((acc, skill) => {
      const category = skill.skills?.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill.current_level);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(skillCategories).forEach(([category, levels]) => {
      const averageLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      if (averageLevel < 60) {
        recommendations.push({
          id: `skill-gap-${category}`,
          type: 'Skill Development',
          priority: 'Medium',
          title: `${category} Skills Need Attention`,
          description: `Team average in ${category} is ${Math.round(averageLevel)}%. Focus on targeted training in this area.`,
          action: `Assign ${category}-specific modules to team members`,
          impact: 'Medium',
          icon: Target,
          color: 'text-orange-600'
        });
      }
    });

    // High performers recognition
    if (completedModules > 0) {
      recommendations.push({
        id: 'high-performers',
        type: 'Recognition',
        priority: 'Low',
        title: 'Recognize Top Performers',
        description: 'Several team members are excelling. Consider recognizing their achievements to motivate others.',
        action: 'Send recognition emails or certificates to top performers',
        impact: 'Medium',
        icon: TrendingUp,
        color: 'text-green-600'
      });
    }

    // Module-specific recommendations
    const moduleTypes = teamProgress.progress.reduce((acc, p) => {
      if (!acc[p.module_type]) acc[p.module_type] = { total: 0, completed: 0, avgProgress: 0 };
      acc[p.module_type].total++;
      if (p.status === 'completed') acc[p.module_type].completed++;
      acc[p.module_type].avgProgress += p.completion_percentage;
      return acc;
    }, {} as Record<string, { total: number; completed: number; avgProgress: number }>);

    Object.entries(moduleTypes).forEach(([moduleType, stats]) => {
      const avgProgress = stats.avgProgress / stats.total;
      if (avgProgress < 40 && stats.total >= 3) {
        recommendations.push({
          id: `module-${moduleType}`,
          type: 'Module Focus',
          priority: 'Medium',
          title: `${moduleType} Modules Need Focus`,
          description: `Team is struggling with ${moduleType} content (${Math.round(avgProgress)}% average). Consider additional resources or training.`,
          action: `Provide supplementary materials for ${moduleType}`,
          impact: 'High',
          icon: BookOpen,
          color: 'text-blue-600'
        });
      }
    });

    return recommendations.slice(0, 4); // Limit to top 4 recommendations
  };

  const recommendations = generateRecommendations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          AI-Powered Recommendations
        </CardTitle>
        <CardDescription>
          Personalized suggestions to improve your team's learning outcomes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Alert key={rec.id} className="border-l-4 border-l-primary">
                <rec.icon className={`h-4 w-4 ${rec.color}`} />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge 
                          variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Impact: {rec.impact}</span>
                        <span>•</span>
                        <span>{rec.action}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground">
              We'll provide personalized recommendations once your team starts learning.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
