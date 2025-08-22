
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
  Zap
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useSkills } from "@/hooks/useSkills";
import { useRecommendations } from "@/hooks/useRecommendations";
import { AppLayout } from "@/components/AppLayout";

const Dashboard = () => {
  const { data: profile } = useProfile();
  const { data: skills } = useSkills();
  const { data: recommendations } = useRecommendations();

  // Mock data for enhanced dashboard
  const currentCourses = [
    {
      id: 1,
      title: "Advanced React Development",
      progress: 75,
      image: "/placeholder.svg",
      nextLesson: "Context API Deep Dive",
      timeLeft: "2h 30m",
      instructor: "Sarah Johnson"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      progress: 45,
      image: "/placeholder.svg",
      nextLesson: "Linear Regression",
      timeLeft: "4h 15m",
      instructor: "Dr. Michael Chen"
    }
  ];

  const recentAchievements = [
    {
      id: 1,
      title: "JavaScript Expert",
      description: "Completed advanced JavaScript course",
      date: "2 days ago",
      icon: Award,
      color: "text-yellow-600"
    },
    {
      id: 2,
      title: "Quick Learner",
      description: "Finished 3 courses this month",
      date: "1 week ago",
      icon: Zap,
      color: "text-blue-600"
    }
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: "React Assessment",
      date: "Tomorrow",
      type: "Assessment",
      priority: "high"
    },
    {
      id: 2,
      title: "Final Project Submission",
      date: "In 3 days",
      type: "Project",
      priority: "medium"
    }
  ];

  const stats = [
    {
      title: "Courses Completed",
      value: "12",
      change: "+3 this month",
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Skills Mastered",
      value: "8",
      change: "+2 this week",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Certificates Earned",
      value: "5",
      change: "+1 this month",
      icon: Award,
      color: "text-purple-600"
    },
    {
      title: "Study Hours",
      value: "124",
      change: "+8 this week",
      icon: Clock,
      color: "text-orange-600"
    }
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {profile?.first_name || 'Learner'}! 👋
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
              {currentCourses.map((course) => (
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
                          <Button size="sm" className="h-8">
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                {recentAchievements.map((achievement) => (
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
                ))}
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
              {skills?.slice(0, 6).map((skill) => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{skill.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {skill.category}
                    </Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Level: Intermediate
                  </p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/progress">View Detailed Progress</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
