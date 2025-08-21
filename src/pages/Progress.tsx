import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Calendar, Award, Target, ArrowLeft, Brain,
  CheckCircle, Clock, BookOpen, Star, Activity
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserSkills } from "@/hooks/useSkills";

const ProgressPage = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: userSkills } = useUserSkills();

  // Mock progress data
  const courseProgress = [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      progress: 75,
      totalLessons: 24,
      completedLessons: 18,
      lastActivity: '2 days ago',
      status: 'in_progress'
    },
    {
      id: '2',
      title: 'Financial Risk Management',
      progress: 100,
      totalLessons: 16,
      completedLessons: 16,
      lastActivity: '1 week ago',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Cloud Architecture Design',
      progress: 30,
      totalLessons: 32,
      completedLessons: 10,
      lastActivity: '3 days ago',
      status: 'in_progress'
    }
  ];

  const achievements = [
    {
      id: '1',
      title: 'First Assessment',
      description: 'Completed your first skill assessment',
      icon: Target,
      earned: true,
      earnedDate: '2 weeks ago'
    },
    {
      id: '2',
      title: 'Course Completer',
      description: 'Finished your first course',
      icon: BookOpen,
      earned: true,
      earnedDate: '1 week ago'
    },
    {
      id: '3',
      title: 'Skill Master',
      description: 'Achieved 90%+ in any skill',
      icon: Star,
      earned: false,
      earnedDate: null
    },
    {
      id: '4',
      title: 'Learning Streak',
      description: 'Study for 7 consecutive days',
      icon: Activity,
      earned: false,
      earnedDate: null
    }
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 2 },
    { day: 'Tue', hours: 1.5 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 3 },
    { day: 'Fri', hours: 1 },
    { day: 'Sat', hours: 0.5 },
    { day: 'Sun', hours: 2 }
  ];

  const overallProgress = userSkills?.length ? 
    Math.round(userSkills.reduce((acc, skill) => acc + skill.current_level, 0) / userSkills.length) : 0;

  const completedCourses = courseProgress.filter(course => course.status === 'completed').length;
  const totalStudyHours = weeklyActivity.reduce((acc, day) => acc + day.hours, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">SkillUp AI</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-smooth">Dashboard</Link>
              <Link to="/courses" className="text-muted-foreground hover:text-primary transition-smooth">Courses</Link>
              <Link to="/progress" className="text-primary font-medium">Progress</Link>
              <Link to="/certificates" className="text-muted-foreground hover:text-primary transition-smooth">Certificates</Link>
            </nav>
          </div>
          <Button asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Learning Progress</h2>
          <p className="text-muted-foreground">
            Track your learning journey and celebrate your achievements
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-medium">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Overall Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">{overallProgress}%</div>
              <Progress value={overallProgress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {userSkills?.length || 0} skills being tracked
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Courses Completed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">{completedCourses}</div>
              <p className="text-sm text-muted-foreground mb-2">
                {courseProgress.length - completedCourses} in progress
              </p>
              <p className="text-xs text-muted-foreground">
                Keep up the great work!
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">{totalStudyHours}h</div>
              <p className="text-sm text-muted-foreground mb-2">Study time</p>
              <p className="text-xs text-muted-foreground">
                {totalStudyHours > 5 ? 'Excellent progress!' : 'Keep learning!'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Progress</CardTitle>
                <CardDescription>Track your development across different skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userSkills?.map((userSkill) => (
                  <div key={userSkill.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{userSkill.skills?.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={userSkill.current_level >= userSkill.target_level ? "default" : "secondary"}>
                          {userSkill.current_level}% / {userSkill.target_level}%
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={userSkill.current_level} className="h-2" />
                      <div 
                        className="absolute top-0 h-2 border-r-2 border-primary opacity-50"
                        style={{ left: `${userSkill.target_level}%` }}
                      />
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-8">
                    No skills assessed yet. Take your first assessment to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>Monitor your progress in enrolled courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseProgress.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{course.title}</h4>
                      {course.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                      <span>Last activity: {course.lastActivity}</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your learning activity over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end space-x-2 h-32">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="bg-primary rounded-t w-full"
                        style={{ height: `${(day.hours / 3) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                      <span className="text-xs font-medium">{day.hours}h</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Total: {totalStudyHours} hours this week
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Unlock badges as you progress in your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`border rounded-lg p-4 ${
                        achievement.earned ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          achievement.earned ? 'bg-primary text-white' : 'bg-muted'
                        }`}>
                          <achievement.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          {achievement.earned ? (
                            <Badge variant="default" className="text-xs bg-green-600 text-white">
                              Earned {achievement.earnedDate}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not earned yet
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProgressPage;
