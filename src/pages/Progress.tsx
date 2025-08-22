
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Award, 
  Target, 
  Clock, 
  BarChart3,
  Calendar,
  Trophy,
  Zap,
  BookOpen,
  CheckCircle,
  Star
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useSkills } from "@/hooks/useSkills";
import { AppLayout } from "@/components/AppLayout";

const Progress = () => {
  const { data: profile } = useProfile();
  const { data: skills } = useSkills();

  // Mock progress data
  const overallStats = {
    coursesCompleted: 12,
    coursesInProgress: 3,
    totalHours: 124,
    skillsImproved: 8,
    certificatesEarned: 5,
    streak: 7
  };

  const skillProgress = [
    { name: "React Development", current: 85, target: 90, category: "Frontend", trend: "+5%" },
    { name: "Machine Learning", current: 65, target: 80, category: "AI/ML", trend: "+12%" },
    { name: "Project Management", current: 78, target: 85, category: "Business", trend: "+8%" },
    { name: "Data Analysis", current: 72, target: 90, category: "Analytics", trend: "+15%" },
    { name: "Leadership", current: 68, target: 75, category: "Soft Skills", trend: "+6%" },
    { name: "Cloud Computing", current: 55, target: 70, category: "Infrastructure", trend: "+18%" }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "course_completed",
      title: "Advanced React Patterns",
      date: "2 days ago",
      points: 250,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "skill_level_up",
      title: "JavaScript Proficiency Increased",
      date: "3 days ago",
      points: 100,
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "certificate_earned",
      title: "Frontend Development Certificate",
      date: "1 week ago",
      points: 500,
      icon: Award,
      color: "text-purple-600"
    },
    {
      id: 4,
      type: "assessment_passed",
      title: "React Assessment - Score: 92%",
      date: "1 week ago",
      points: 150,
      icon: Target,
      color: "text-orange-600"
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "Quick Learner",
      description: "Complete 3 courses in one month",
      icon: Zap,
      earned: true,
      earnedDate: "Dec 15, 2024",
      rarity: "Common"
    },
    {
      id: 2,
      title: "Skill Master",
      description: "Reach expert level in any skill",
      icon: Trophy,
      earned: true,
      earnedDate: "Dec 10, 2024",
      rarity: "Rare"
    },
    {
      id: 3,
      title: "Consistent Learner",
      description: "Maintain a 7-day learning streak",
      icon: Target,
      earned: true,
      earnedDate: "Dec 8, 2024",
      rarity: "Common"
    },
    {
      id: 4,
      title: "Assessment Ace",
      description: "Score 95% or higher on 5 assessments",
      icon: Star,
      earned: false,
      earnedDate: null,
      rarity: "Epic",
      progress: 60
    },
    {
      id: 5,
      title: "Course Completionist",
      description: "Complete 20 courses",
      icon: BookOpen,
      earned: false,
      earnedDate: null,
      rarity: "Rare",
      progress: 75
    }
  ];

  const learningGoals = [
    {
      id: 1,
      title: "Become React Expert",
      description: "Reach 90% proficiency in React Development",
      currentProgress: 85,
      targetProgress: 90,
      deadline: "End of January",
      status: "on_track"
    },
    {
      id: 2,
      title: "Machine Learning Certification",
      description: "Complete ML fundamentals and earn certificate",
      currentProgress: 65,
      targetProgress: 100,
      deadline: "End of February",
      status: "behind"
    },
    {
      id: 3,
      title: "Leadership Skills",
      description: "Improve leadership capabilities for promotion",
      currentProgress: 68,
      targetProgress: 75,
      deadline: "End of December",
      status: "ahead"
    }
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Learning Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and celebrate your achievements
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{overallStats.coursesCompleted}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{overallStats.coursesInProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{overallStats.totalHours}</p>
              <p className="text-sm text-muted-foreground">Hours Learned</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{overallStats.skillsImproved}</p>
              <p className="text-sm text-muted-foreground">Skills Improved</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{overallStats.certificatesEarned}</p>
              <p className="text-sm text-muted-foreground">Certificates</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{overallStats.streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Skills Progress Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Skill Development Progress
                </CardTitle>
                <CardDescription>
                  Track your progress toward skill mastery goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {skillProgress.map((skill, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{skill.current}% of {skill.target}% target</span>
                          <Badge variant="default" className="text-xs bg-green-600 text-white">
                            {skill.trend}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={skill.current} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {skill.current}%</span>
                        <span>Target: {skill.target}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Learning Goals
                </CardTitle>
                <CardDescription>
                  Your personalized learning objectives and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningGoals.map((goal) => (
                  <Card key={goal.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                          <Badge 
                            variant={
                              goal.status === 'on_track' ? 'default' : 
                              goal.status === 'ahead' ? 'default' : 'secondary'
                            }
                            className={
                              goal.status === 'ahead' ? 'bg-green-600 text-white' :
                              goal.status === 'behind' ? 'bg-red-600 text-white' : ''
                            }
                          >
                            {goal.status === 'on_track' ? 'On Track' :
                             goal.status === 'ahead' ? 'Ahead' : 'Behind'}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {goal.currentProgress}% of {goal.targetProgress}%
                            </span>
                          </div>
                          <Progress value={(goal.currentProgress / goal.targetProgress) * 100} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Due: {goal.deadline}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest learning milestones and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      +{activity.points} XP
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Achievements & Badges
                </CardTitle>
                <CardDescription>
                  Celebrate your learning milestones and accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className={`border-2 ${
                      achievement.earned ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/50'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            <achievement.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                                <Badge 
                                  variant={
                                    achievement.rarity === 'Epic' ? 'default' :
                                    achievement.rarity === 'Rare' ? 'secondary' : 'outline'
                                  }
                                  className={`text-xs ${
                                    achievement.rarity === 'Epic' ? 'bg-purple-600 text-white' :
                                    achievement.rarity === 'Rare' ? 'bg-blue-600 text-white' : ''
                                  }`}
                                >
                                  {achievement.rarity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                            
                            {achievement.earned ? (
                              <Badge variant="default" className="text-xs bg-green-600 text-white">
                                Earned {achievement.earnedDate}
                              </Badge>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Progress</span>
                                  <span>{achievement.progress}%</span>
                                </div>
                                <Progress value={achievement.progress} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Progress;
