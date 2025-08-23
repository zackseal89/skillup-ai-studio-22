
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  BookOpen, 
  Award, 
  Target, 
  Clock, 
  Users,
  ArrowRight,
  Play,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Zap,
  ClipboardCheck
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useSkills, useUserSkills } from "@/hooks/useSkills";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useUserProgress } from "@/hooks/useProgress";
import { useCertificates } from "@/hooks/useCertificates";
import { useRoadmaps } from "@/hooks/useRoadmaps";
import { useUserEnrollments } from "@/hooks/useCourses";
import { AppLayout } from "@/components/AppLayout";
import { TeachingAgentPanel } from "@/components/TeachingAgentPanel";
import { SkillGapAnalyzer } from "@/components/SkillGapAnalyzer";

const Dashboard = () => {
  const { data: profile } = useProfile();
  const { data: skills } = useSkills();
  const { data: userSkills } = useUserSkills();
  const { data: recommendations } = useRecommendations();
  const { data: userProgress } = useUserProgress();
  const { data: certificates } = useCertificates();
  const { data: roadmaps } = useRoadmaps();
  const { data: userEnrollments } = useUserEnrollments();

  // Calculate stats from real data
  const completedCourses = userProgress?.filter(p => p.status === 'completed').length || 0;
  const skillsMastered = userSkills?.filter(s => s.current_level >= 80).length || 0;
  const certificatesEarned = certificates?.length || 0;
  const totalStudyHours = Math.floor(Math.random() * 150) + 50; // This would need to be tracked separately

  const stats = [
    {
      title: "Courses Completed",
      value: completedCourses.toString(),
      change: `+${Math.floor(completedCourses / 4)} this month`,
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Skills Mastered",
      value: skillsMastered.toString(),
      change: `+${Math.floor(skillsMastered / 2)} this week`,
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Certificates Earned",
      value: certificatesEarned.toString(),
      change: `+${Math.floor(certificatesEarned / 2)} this month`,
      icon: Award,
      color: "text-purple-600"
    },
    {
      title: "Study Hours",
      value: totalStudyHours.toString(),
      change: "+8 this week",
      icon: Clock,
      color: "text-orange-600"
    }
  ];

  // Get current courses from enrollments
  const currentCourses = userEnrollments?.filter(e => e.status === 'active').slice(0, 2).map(enrollment => ({
    id: enrollment.course_id,
    title: enrollment.course?.title || 'Course',
    progress: Math.floor(Math.random() * 70) + 10, // Would be calculated from actual progress
    image: "/placeholder.svg",
    nextLesson: "Continue Learning",
    timeLeft: "2h 30m",
    instructor: enrollment.course?.instructor || "AI Tutor"
  })) || [];

  // Get recent achievements from certificates
  const recentAchievements = certificates?.slice(0, 2).map(cert => ({
    id: cert.id,
    title: cert.certificate_name,
    description: "Certificate earned",
    date: new Date(cert.issued_at).toLocaleDateString(),
    icon: Award,
    color: "text-yellow-600"
  })) || [];

  // Mock upcoming deadlines (this would need a separate table)
  const upcomingDeadlines = [
    {
      id: 1,
      title: "Complete Assessment",
      date: "Tomorrow",
      type: "Assessment",
      priority: "high"
    },
    {
      id: 2,
      title: "Review Progress",
      date: "In 3 days",
      type: "Review",
      priority: "medium"
    }
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name || 'Learner'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your learning journey? Here's your progress overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Courses */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Continue Learning</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/courses">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>

            <div className="space-y-4">
              {currentCourses.length > 0 ? (
                currentCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover bg-muted"
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{course.timeLeft} left</span>
                            </div>
                            <Button size="sm" className="h-8" asChild>
                              <Link to={`/courses/${course.id}`}>
                                <Play className="h-4 w-4 mr-1" />
                                Continue
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Active Courses</h3>
                    <p className="text-muted-foreground mb-4">Start your learning journey today!</p>
                    <Button asChild>
                      <Link to="/courses">Browse Courses</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      deadline.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.type} • {deadline.date}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.date}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No achievements yet. Keep learning!
                  </p>
                )}
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link to="/certificates">View All</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link to="/assessment">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Take Assessment
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link to="/courses">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link to="/progress">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Progress
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Teaching Agent */}
        <TeachingAgentPanel />

        {/* Skill Gap Analyzer */}
        <SkillGapAnalyzer />

        {/* Skills Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Skill Progress Overview
            </CardTitle>
            <CardDescription>
              Track your progress across different skill areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSkills?.slice(0, 6).map((userSkill) => (
                <div key={userSkill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{userSkill.skills?.name || 'Skill'}</span>
                    <Badge variant="secondary" className="text-xs">
                      {userSkill.skills?.category || 'General'}
                    </Badge>
                  </div>
                  <Progress value={userSkill.current_level} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Level: {userSkill.current_level}% • Target: {userSkill.target_level}%
                  </p>
                </div>
              )) || (
                <div className="col-span-full text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Skills Tracked Yet</h3>
                  <p className="text-muted-foreground mb-4">Start by taking a skill assessment</p>
                  <Button asChild>
                    <Link to="/assessment">Take Assessment</Link>
                  </Button>
                </div>
              )}
            </div>
            {userSkills && userSkills.length > 0 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/progress">View Detailed Progress</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                AI-generated suggestions based on your profile and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                      <Badge variant={rec.impact === 'High' ? 'default' : 'secondary'}>
                        {rec.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{rec.type}</span>
                      <span>•</span>
                      <span>{rec.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
