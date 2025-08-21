import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, User, TrendingUp, BookOpen, Award, Clock, 
  Target, ArrowRight, Lightbulb, Star
} from "lucide-react";

const Dashboard = () => {
  const [user] = useState({
    name: "Alex Johnson",
    role: "Software Developer",
    industry: "Technology",
    overallProgress: 68
  });

  const skillGaps = [
    { skill: "Machine Learning", current: 30, required: 85, priority: "High" },
    { skill: "Cloud Architecture", current: 45, required: 80, priority: "High" },
    { skill: "React/Next.js", current: 70, required: 90, priority: "Medium" },
    { skill: "Data Analysis", current: 25, required: 70, priority: "Medium" },
    { skill: "Leadership", current: 40, required: 75, priority: "Low" }
  ];

  const recommendations = [
    {
      title: "Complete Machine Learning Fundamentals",
      description: "Boost your ML skills with our AI-powered course",
      duration: "6 weeks",
      impact: "High",
      type: "Course"
    },
    {
      title: "AWS Solutions Architect Certification",
      description: "Get cloud-ready with hands-on AWS training",
      duration: "4 weeks",
      impact: "High",
      type: "Certification"
    },
    {
      title: "Advanced React Patterns Workshop",
      description: "Master modern React development techniques",
      duration: "2 weeks",
      impact: "Medium",
      type: "Workshop"
    }
  ];

  const recentActivity = [
    { action: "Completed", item: "Python Basics Module", time: "2 hours ago" },
    { action: "Started", item: "Data Structures Course", time: "1 day ago" },
    { action: "Earned", item: "SQL Fundamentals Certificate", time: "3 days ago" },
    { action: "Joined", item: "AI Study Group", time: "1 week ago" }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "warning";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "success";
      case "Medium": return "warning";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

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
              <Link to="/dashboard" className="text-primary font-medium">Dashboard</Link>
              <Link to="/courses" className="text-muted-foreground hover:text-primary transition-smooth">Courses</Link>
              <Link to="/progress" className="text-muted-foreground hover:text-primary transition-smooth">Progress</Link>
              <Link to="/certificates" className="text-muted-foreground hover:text-primary transition-smooth">Certificates</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ai" size="sm">
              <Lightbulb className="h-4 w-4" />
              AI Assistant
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-muted-foreground">
            Here's your personalized learning insights and recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skill Gap Analysis */}
            <Card className="shadow-medium border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span>Skill Gap Analysis</span>
                    </CardTitle>
                    <CardDescription>
                      AI-generated insights based on your {user.role} role in {user.industry}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {skillGaps.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{skill.skill}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(skill.priority) as any}>
                          {skill.priority} Priority
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {skill.current}% / {skill.required}%
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={skill.current} className="h-2" />
                      <div 
                        className="absolute top-0 h-2 border-r-2 border-primary"
                        style={{ left: `${skill.required}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gap: {skill.required - skill.current} points to reach industry standard
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="shadow-medium border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Personalized learning paths to close your skill gaps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg card-interactive">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{rec.duration}</span>
                          </div>
                          <Badge variant={getImpactColor(rec.impact) as any} className="text-xs">
                            {rec.impact} Impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.type}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="hero" size="sm">
                        Start
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="shadow-medium border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Overall Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{user.overallProgress}%</div>
                  <Progress value={user.overallProgress} className="progress-glow" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Great progress! You're ahead of 78% of learners.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">12</div>
                    <div className="text-xs text-muted-foreground">Courses Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">3</div>
                    <div className="text-xs text-muted-foreground">Certificates Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-medium border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/courses">
                    <BookOpen className="h-4 w-4" />
                    Browse Courses
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/assessment">
                    <Target className="h-4 w-4" />
                    Take Skill Assessment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/certificates">
                    <Award className="h-4 w-4" />
                    View Certificates
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-medium border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{activity.action}</span>
                        <span className="text-muted-foreground"> {activity.item}</span>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;