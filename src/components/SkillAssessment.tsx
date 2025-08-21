
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowRight, Clock } from "lucide-react";
import { useSkills } from "@/hooks/useSkills";

const SkillAssessment = () => {
  const { data: skills } = useSkills();

  if (!skills || skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Skill Assessment</span>
          </CardTitle>
          <CardDescription>
            No skills available for assessment at the moment.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return "bg-green-100 text-green-800";
    if (level <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return "Beginner";
    if (level <= 6) return "Intermediate";
    return "Advanced";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Skill Assessment</span>
        </CardTitle>
        <CardDescription>
          Take assessments to measure your current skill levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {skills.slice(0, 4).map((skill) => (
            <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{skill.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {skill.description}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {skill.category}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(skill.difficulty_level)}`}>
                    {getDifficultyLabel(skill.difficulty_level)}
                  </Badge>
                </div>
              </div>
              <Button size="sm" asChild>
                <Link to={`/assessment/${skill.id}`}>
                  <Clock className="h-4 w-4" />
                  Start
                </Link>
              </Button>
            </div>
          ))}
        </div>
        
        {skills.length > 4 && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm">
              View All Skills
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillAssessment;
