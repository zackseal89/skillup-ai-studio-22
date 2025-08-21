import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Users, Award, ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const Index = () => {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get personalized skill gap assessments powered by advanced AI technology"
    },
    {
      icon: TrendingUp,
      title: "Industry-Relevant Training",
      description: "Learn skills that matter in your industry with real-time market insights"
    },
    {
      icon: Users,
      title: "Personalized Learning",
      description: "Adaptive learning paths tailored to your career goals and current expertise"
    },
    {
      icon: Award,
      title: "Verified Certification",
      description: "Earn industry-recognized certificates to boost your professional profile"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Professionals Retrained" },
    { value: "95%", label: "Career Advancement Rate" },
    { value: "500+", label: "Industry Partners" },
    { value: "4.9/5", label: "Learner Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">SkillUp AI</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-smooth">Dashboard</Link>
            <Link to="/courses" className="text-muted-foreground hover:text-primary transition-smooth">Courses</Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-subtle opacity-50"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered Learning Platform</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Transform Your Career with{" "}
                  <span className="gradient-primary bg-clip-text text-transparent">
                    AI-Driven Training
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Identify skill gaps, get personalized training recommendations, and advance your career with our intelligent learning platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">
                    Start Your Journey
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/demo">View Demo</Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img 
                src={heroImage} 
                alt="AI Learning Platform" 
                className="w-full h-auto rounded-2xl shadow-strong"
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 gradient-primary rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 gradient-subtle rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-accent/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose SkillUp AI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides personalized learning experiences that adapt to your career goals and industry demands.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-interactive border-border shadow-soft">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have successfully upskilled with our AI-powered platform.
          </p>
          <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
            <Link to="/signup">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">SkillUp AI</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 SkillUp AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;