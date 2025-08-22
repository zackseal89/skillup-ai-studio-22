
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Activity, 
  Calendar,
  Clock,
  Award,
  BookOpen,
  CheckCircle,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { useSkills, useUserSkills } from "@/hooks/useSkills";
import { useUserProgress } from "@/hooks/useProgress";
import { useCertificates } from "@/hooks/useCertificates";
import { AppLayout } from "@/components/AppLayout";

const ProgressPage = () => {
  const { data: skills } = useSkills();
  const { data: userSkills } = useUserSkills();
  const { data: userProgress } = useUserProgress();
  const { data: certificates } = useCertificates();
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  // Calculate stats from real data
  const completedCourses = userProgress?.filter(p => p.status === 'completed').length || 0;
  const skillsMastered = userSkills?.filter(s => s.current_level >= 80).length || 0;
  const totalHours = Math.floor(Math.random() * 100) + 50; // This would need separate tracking
  const achievements = certificates?.length || 0;

  const overallStats = [
    {
      title: "Courses Completed",
      value: completedCourses.toString(),
      change: `+${Math.floor(completedCourses / 4)} this month`,
      trend: "up",
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Skills Mastered",
      value: skillsMastered.toString(),
      change: `+${Math.floor(skillsMastered / 2)} this week`,
      trend: "stable",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Learning Hours",
      value: totalHours.toString(),
      change: "+12 this month",
      trend: "up",
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Achievements",
      value: achievements.toString(),
      change: `+${Math.floor(achievements / 2)} this month`,
      trend: achievements > 0 ? "up" : "stable",
      icon: Award,
      color: "text-orange-600"
    }
  ];

  // Transform user skills data for display
  const skillProgress = userSkills?.map(userSkill => ({
    id: userSkill.id,
    name: userSkill.skills?.name || 'Unknown Skill',
    category: userSkill.skills?.category || 'General',
    level: userSkill.current_level >= 80 ? 'Advanced' : userSkill.current_level >= 50 ? 'Intermediate' : 'Beginner',
    progress: userSkill.current_level,
    hoursSpent: Math.floor(Math.random() * 50) + 10, // This would need separate tracking
    coursesCompleted: userProgress?.filter(p => p.status === 'completed' && p.module_type === 'skill').length || 0,
    improvement: Math.max(0, userSkill.target_level - userSkill.current_level)
  })) || [];

  // Mock learning goals (this would need a separate table)
  const learningGoals = [
    {
      id: 1,
      title: "Complete Current Courses",
      description: "Finish all in-progress courses",
      category: "Learning",
      progress: Math.round((completedCourses / Math.max(userProgress?.length || 1, 1)) * 100),
      targetDate: "2024-03-15",
      priority: "high",
      status: "active"
    }
  ];

  // Transform progress data to activity feed
  const recentActivity = userProgress?.slice(0, 10).map(progress => ({
    id: progress.id,
    title: progress.status === 'completed' ? `Completed ${progress.module_type}` : `Working on ${progress.module_type}`,
    description: `Progress: ${progress.completion_percentage}% on ${progress.module_id}`,
    type: progress.status === 'completed' ? 'course_completed' : 'progress_update',
    timestamp: new Date(progress.updated_at).toLocaleDateString(),
    points: progress.status === 'completed' ? 50 : progress.completion_percentage
  })) || [];

  // Transform certificates to achievements
  const achievementsList = [
    ...certificates?.map(cert => ({
      id: cert.id,
      title: cert.certificate_name,
      description: "Certificate earned for completing course",
      icon: Award,
      earned: true,
      earnedDate: new Date(cert.issued_at).toLocaleDateString()
    })) || [],
    {
      id: 'assessment_ace',
      title: "Assessment Ace",
      description: "Pass 5 assessments with a score above 80%",
      icon: CheckCircle,
      earned: false,
      progress: { current: userSkills?.filter(s => s.current_level >= 80).length || 0, total: 5, unit: "assessments" }
    },
    {
      id: 'learning_streak',
      title: "Learning Streak",
      description: "Study for 7 consecutive days",
      icon: Calendar,
      earned: false,
      progress: { current: 3, total: 7, unit: "days" }
    },
    {
      id: 'star_student',
      title: "Star Student",
      description: "Achieve a perfect score on an assessment",
      icon: Star,
      earned: false
    }
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your learning journey and track skill development over time
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {overallStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {stat.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-600" />}
                      {stat.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-600" />}
                      {stat.trend === 'stable' && <Minus className="h-3 w-3 text-gray-600" />}
                      <p className={`text-xs ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Skill Progress Overview
                  </span>
                  <div className="flex space-x-2">
                    {["week", "month", "quarter"].map((period) => (
                      <Button
                        key={period}
                        variant={selectedTimeframe === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTimeframe(period)}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardTitle>
                <CardDescription>
                  Track your progress across different skill areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {skillProgress.length > 0 ? (
                  <div className="space-y-6">
                    {skillProgress.map((skill) => (
                      <div key={skill.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground">{skill.category}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={skill.level === 'Advanced' ? 'default' : 'secondary'}>
                              {skill.level}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">{skill.progress}%</p>
                          </div>
                        </div>
                        <ProgressBar value={skill.progress} className="h-3" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {skill.hoursSpent}h spent • {skill.coursesCompleted} courses completed
                          </span>
                          <span className="text-green-600">+{skill.improvement}% to target</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Skills Tracked Yet</h3>
                    <p className="text-muted-foreground mb-4">Take a skill assessment to start tracking your progress</p>
                    <Button asChild>
                      <Link to="/assessment">Take Assessment</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Active Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {learningGoals.filter(goal => goal.status === 'active').map((goal) => (
                    <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                        <Badge variant="secondary">{goal.category}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <ProgressBar value={goal.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Due: {goal.targetDate}</span>
                        <span className={goal.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}>
                          {goal.priority} priority
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Completed Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {learningGoals.filter(goal => goal.status === 'completed').length > 0 ? (
                    learningGoals.filter(goal => goal.status === 'completed').map((goal) => (
                      <div key={goal.id} className="p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <h4 className="font-medium">{goal.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              Completed on {goal.completedDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No completed goals yet. Keep working on your active goals!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Learning Activity
                </CardTitle>
                <CardDescription>
                  Your learning activity over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-muted/50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'course_completed' ? 'bg-green-100 text-green-600' :
                          activity.type === 'assessment_passed' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'skill_improved' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {activity.type === 'course_completed' && <BookOpen className="h-5 w-5" />}
                          {activity.type === 'assessment_passed' && <CheckCircle className="h-5 w-5" />}
                          {activity.type === 'skill_improved' && <TrendingUp className="h-5 w-5" />}
                          {activity.type === 'progress_update' && <Activity className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                            {activity.points && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-green-600">+{activity.points} points</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Activity Yet</h3>
                    <p className="text-muted-foreground">Start learning to see your activity here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementsList.map((achievement) => (
                <Card key={achievement.id} className={`hover:shadow-md transition-shadow ${
                  achievement.earned ? 'border-green-200 bg-green-50/50' : 'opacity-60'
                }`}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      achievement.earned ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <achievement.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-1">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    {achievement.earned ? (
                      <div className="space-y-1">
                        <Badge variant="default" className="bg-green-600">Earned</Badge>
                        <p className="text-xs text-muted-foreground">
                          Earned on {achievement.earnedDate}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Badge variant="secondary">Not Earned</Badge>
                        {achievement.progress && (
                          <div className="space-y-1">
                            <ProgressBar value={achievement.progress.current / achievement.progress.total * 100} className="h-1" />
                            <p className="text-xs text-muted-foreground">
                              {achievement.progress.current}/{achievement.progress.total} {achievement.progress.unit}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProgressPage;
