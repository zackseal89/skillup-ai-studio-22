import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    industry: "",
    role: "",
    experience: "",
    goals: [] as string[]
  });

  const industries = [
    "Technology", "Healthcare", "Finance", "Manufacturing", 
    "Education", "Retail", "Marketing", "Consulting"
  ];

  const roles = [
    "Software Developer", "Data Scientist", "Product Manager", 
    "Marketing Manager", "Sales Representative", "Designer", 
    "Analyst", "Operations Manager"
  ];

  const experienceLevels = [
    "Entry Level (0-2 years)", "Mid Level (3-5 years)", 
    "Senior Level (6+ years)", "Executive Level"
  ];

  const learningGoals = [
    "Advance in current role", "Switch career paths", 
    "Learn new technologies", "Improve soft skills", 
    "Get promoted", "Start own business"
  ];

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        industry: formData.industry,
        role: formData.role,
        experience_level: formData.experience
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome to SkillUp AI!",
          description: "Please check your email to verify your account."
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Sign Up Failed", 
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-smooth mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">SkillUp AI</h1>
          </div>
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-smooth ${
                  step >= stepNumber 
                    ? "bg-primary text-white" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 mx-2 transition-smooth ${
                    step > stepNumber ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-medium border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">
              {step === 1 && "Create Your Account"}
              {step === 2 && "Tell Us About Yourself"}
              {step === 3 && "Your Learning Goals"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === 1 && "Let's start with the basics"}
              {step === 2 && "Help us personalize your experience"}
              {step === 3 && "What do you want to achieve?"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="hero" 
                    className="w-full" 
                    onClick={handleNext}
                    disabled={!formData.fullName || !formData.email || !formData.password}
                  >
                    Continue
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    variant="hero" 
                    className="w-full" 
                    onClick={handleNext}
                    disabled={!formData.industry || !formData.role || !formData.experience}
                  >
                    Continue
                  </Button>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-4">
                    <Label>What are your learning goals? (Select all that apply)</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {learningGoals.map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={goal}
                            checked={formData.goals.includes(goal)}
                            onCheckedChange={() => handleGoalToggle(goal)}
                          />
                          <Label htmlFor={goal} className="text-sm text-foreground cursor-pointer">
                            {goal}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    variant="success" 
                    className="w-full"
                    disabled={formData.goals.length === 0 || loading}
                  >
                    {loading ? "Creating Account..." : "Complete Registration"}
                  </Button>
                </>
              )}
            </form>

            {step > 1 && (
              <Button 
                variant="ghost" 
                className="w-full mt-4" 
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Go Back
              </Button>
            )}

            <div className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
