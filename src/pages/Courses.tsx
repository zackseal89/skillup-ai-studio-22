
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  Play,
  Award,
  TrendingUp,
  Briefcase,
  Code,
  Brain,
  Target
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useCourses, useFeaturedCourses, useEnrollInCourse } from "@/hooks/useCourses";
import { CourseOnboarding } from "@/components/CourseOnboarding";
import { useToast } from "@/hooks/use-toast";

const Courses = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [onboardingCourse, setOnboardingCourse] = useState<{id: string, title: string} | null>(null);
  
  const { data: courses, isLoading } = useCourses({
    category: selectedCategory,
    difficulty: selectedLevel,
    search: searchTerm
  });
  const { data: featuredCourses } = useFeaturedCourses();
  const enrollInCourseMutation = useEnrollInCourse();

  const categories = [
    { id: "all", name: "All Categories", icon: BookOpen },
    { id: "AI Communication", name: "AI Communication", icon: Brain },
    { id: "Risk Management", name: "Risk Management", icon: Target },
    { id: "Automation", name: "Automation", icon: Code },
    { id: "Machine Learning", name: "Machine Learning", icon: Brain },
    { id: "Documentation", name: "Documentation", icon: BookOpen },
    { id: "Diagnostics", name: "Diagnostics", icon: Target },
    { id: "Patient Care", name: "Patient Care", icon: Target },
    { id: "Analytics", name: "Analytics", icon: TrendingUp },
    { id: "Development", name: "Development", icon: Code },
    { id: "Quality Assurance", name: "Quality Assurance", icon: Target }
  ];

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    setOnboardingCourse({ id: courseId, title: courseTitle });
  };

  const handleOnboardingComplete = async () => {
    if (!onboardingCourse) return;
    
    try {
      await enrollInCourseMutation.mutateAsync(onboardingCourse.id);
      toast({
        title: "Enrolled Successfully!",
        description: "You've been enrolled with personalized settings!"
      });
    } catch (error) {
      toast({
        title: "Enrollment Failed", 
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.difficulty_level.toLowerCase() === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  }) || [];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Course Catalog</h1>
          <p className="text-muted-foreground">
            Discover courses designed to advance your career and close skill gaps
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses, skills, or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
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

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Courses */}
        {featuredCourses && featuredCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Featured Courses</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/50" />
                    </div>
                    <Badge className="absolute top-3 left-3 bg-primary">Featured</Badge>
                    {course.has_certificate && (
                      <Badge className="absolute top-3 right-3 bg-green-600">
                        <Award className="h-3 w-3 mr-1" />
                        Certificate
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-3 w-3" />
                      </div>
                      <span className="text-sm text-muted-foreground">{course.instructor}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                        <span>(124)</span>
                      </div>
                      <Badge variant="secondary">{course.difficulty_level}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.modules} modules</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {course.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {course.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.skills.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <Button className="w-full" onClick={() => handleEnroll(course.id, course.title)}>
                      <Play className="h-4 w-4 mr-2" />
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              All Courses ({filteredCourses.length})
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                    <Brain className="h-16 w-16 text-secondary/50" />
                  </div>
                  {course.has_certificate && (
                    <Badge className="absolute top-3 right-3 bg-green-600">
                      <Award className="h-3 w-3 mr-1" />
                      Certificate
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-muted-foreground">{course.instructor}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.7</span>
                      <span>(89)</span>
                    </div>
                    <Badge variant="secondary">{course.difficulty_level}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.modules} modules</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {course.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {course.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.skills.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <Button className="w-full" onClick={() => handleEnroll(course.id, course.title)}>
                    <Play className="h-4 w-4 mr-2" />
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all categories
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Course Onboarding Modal */}
      {onboardingCourse && (
        <CourseOnboarding
          isOpen={!!onboardingCourse}
          onClose={() => setOnboardingCourse(null)}
          courseId={onboardingCourse.id}
          courseTitle={onboardingCourse.title}
          onComplete={handleOnboardingComplete}
        />
      )}
    </AppLayout>
  );
};

export default Courses;
