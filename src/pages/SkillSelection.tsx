import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Target, 
  ArrowLeft, 
  ClipboardCheck,
  Brain,
  Code,
  Briefcase,
  Heart,
  Filter
} from "lucide-react";
import { useSkills } from "@/hooks/useSkills";
import { useProfile } from "@/hooks/useProfile";
import { AppLayout } from "@/components/AppLayout";

const SkillSelection = () => {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: skills } = useSkills();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(profile?.industry || "all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const industries = [
    { id: "all", name: "All Industries", icon: Target },
    { id: "Finance", name: "Finance", icon: Briefcase },
    { id: "Healthcare", name: "Healthcare", icon: Heart },
    { id: "Technology", name: "Technology", icon: Code }
  ];

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "AI Communication", name: "AI Communication" },
    { id: "Risk Management", name: "Risk Management" },
    { id: "Automation", name: "Automation" },
    { id: "Machine Learning", name: "Machine Learning" },
    { id: "Documentation", name: "Documentation" },
    { id: "Diagnostics", name: "Diagnostics" },
    { id: "Patient Care", name: "Patient Care" },
    { id: "Analytics", name: "Analytics" },
    { id: "Development", name: "Development" },
    { id: "Quality Assurance", name: "Quality Assurance" }
  ];

  const filteredSkills = skills?.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || skill.industry === selectedIndustry;
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
    
    return matchesSearch && matchesIndustry && matchesCategory;
  }) || [];

  const handleSkillSelect = (skillId: string) => {
    navigate(`/assessment/${skillId}`);
  };

  const getDifficultyColor = (level: number) => {
    if (level === 1) return "bg-green-100 text-green-800 border-green-200";
    if (level === 2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getDifficultyLabel = (level: number) => {
    if (level === 1) return "Beginner";
    if (level === 2) return "Intermediate";
    return "Advanced";
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
            <Target className="h-8 w-8 mr-3 text-primary" />
            Select a Skill to Assess
          </h1>
          <p className="text-muted-foreground">
            Choose a skill area you'd like to assess your current proficiency level in
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Available Skills ({filteredSkills.length})
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <Card key={skill.id} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleSkillSelect(skill.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {skill.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {skill.industry}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getDifficultyColor(skill.difficulty_level)}`}>
                      {getDifficultyLabel(skill.difficulty_level)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {skill.description || `Assess your proficiency in ${skill.name}`}
                  </CardDescription>
                  
                  <Button className="w-full group-hover:shadow-md transition-shadow">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSkills.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No skills found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all categories
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setSelectedIndustry("all");
                  setSelectedCategory("all");
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SkillSelection;