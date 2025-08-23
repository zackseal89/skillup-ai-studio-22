import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTeamMembers, useTeamProgress } from "@/hooks/useTeams";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, Award, TrendingUp, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface EnhancedTeamProgressProps {
  teamId: string;
}

export const EnhancedTeamProgress = ({ teamId }: EnhancedTeamProgressProps) => {
  const { data: members } = useTeamMembers(teamId);
  const { data: teamProgress } = useTeamProgress(teamId);

  // Fetch additional data for enhanced visualizations
  const { data: skillProgress } = useQuery({
    queryKey: ['team-skill-progress', teamId],
    queryFn: async () => {
      if (!members) return [];
      
      const userIds = members.map(m => m.user_id);
      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          *,
          skills:skill_id (
            name,
            category,
            difficulty_level
          )
        `)
        .in('user_id', userIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!members && members.length > 0,
  });

  const { data: courseEnrollments } = useQuery({
    queryKey: ['team-course-enrollments', teamId],
    queryFn: async () => {
      if (!members) return [];
      
      const userIds = members.map(m => m.user_id);
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses:course_id (
            title,
            difficulty_level,
            category
          )
        `)
        .in('user_id', userIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!members && members.length > 0,
  });

  if (!members || !teamProgress || !skillProgress || !courseEnrollments) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading enhanced progress data...</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate difficulty level progress
  const difficultyProgress = ['beginner', 'intermediate', 'advanced'].map(level => {
    const totalCourses = courseEnrollments.filter(e => e.courses?.difficulty_level === level).length;
    const completedCourses = courseEnrollments.filter(e => 
      e.courses?.difficulty_level === level && e.status === 'completed'
    ).length;
    
    return {
      level: level.charAt(0).toUpperCase() + level.slice(1),
      total: totalCourses,
      completed: completedCourses,
      percentage: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
    };
  });

  // Calculate skill category progress
  const skillCategories = skillProgress.reduce((acc, skill) => {
    const category = skill.skills?.category || 'Other';
    if (!acc[category]) {
      acc[category] = { total: 0, mastered: 0, totalLevel: 0 };
    }
    acc[category].total++;
    acc[category].totalLevel += skill.current_level;
    if (skill.current_level >= 80) acc[category].mastered++;
    return acc;
  }, {} as Record<string, { total: number; mastered: number; totalLevel: number }>);

  const skillCategoryData = Object.entries(skillCategories).map(([category, data]) => ({
    category,
    average: Math.round(data.totalLevel / data.total),
    mastered: data.mastered,
    total: data.total,
    masteryRate: Math.round((data.mastered / data.total) * 100)
  }));

  // Calculate team milestones
  const milestoneData = [
    { name: 'Courses Started', value: courseEnrollments.length },
    { name: 'Courses Completed', value: courseEnrollments.filter(e => e.status === 'completed').length },
    { name: 'Skills Assessed', value: skillProgress.length },
    { name: 'Skills Mastered', value: skillProgress.filter(s => s.current_level >= 80).length }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--accent))'];

  return (
    <div className="space-y-6">
      {/* Progress Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {milestoneData.map((milestone, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{milestone.value}</div>
              <div className="text-xs text-muted-foreground">{milestone.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Difficulty Level Progress */}
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Team Progress by Difficulty Level</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px]">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          <CardDescription>
            Course completion rates across beginner, intermediate, and advanced levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Bar Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}%`, 
                      name === 'percentage' ? 'Completion Rate' : name
                    ]}
                  />
                  <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progress Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {difficultyProgress.map((level, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{level.level}</h4>
                      <Badge variant={level.percentage >= 70 ? "default" : level.percentage >= 40 ? "secondary" : "outline"}>
                        {level.percentage}%
                      </Badge>
                    </div>
                    <Progress value={level.percentage} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      {level.completed} of {level.total} courses completed
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Category Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Skill Category Progress
            </CardTitle>
            <CardDescription>
              Average skill levels across different technology categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillCategoryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="category" type="category" width={80} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Average Skill Level']}
                  />
                  <Bar dataKey="average" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Team Learning Distribution
            </CardTitle>
            <CardDescription>
              Overview of completed vs. ongoing learning activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={milestoneData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {milestoneData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Skill Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Mastery Breakdown</CardTitle>
          <CardDescription>
            Detailed view of team skill development across categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillCategoryData.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{category.category}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{category.mastered}/{category.total} mastered</Badge>
                    <Badge variant="outline">{category.average}% avg level</Badge>
                  </div>
                </div>
                <Progress value={category.masteryRate} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {category.masteryRate}% mastery rate
                </div>
              </div>
            ))}
            
            {skillCategoryData.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Skill Data</h3>
                <p className="text-muted-foreground">
                  Team members haven't completed skill assessments yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};