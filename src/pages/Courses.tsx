
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

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const categories = [
    { id: "all", name: "All Categories", icon: BookOpen },
    { id: "technology", name: "Technology", icon: Code },
    { id: "business", name: "Business", icon: Briefcase },
    { id: "leadership", name: "Leadership", icon: Target },
    { id: "ai", name: "AI & Machine Learning", icon: Brain }
  ];

  const courses = [
    {
      id: 1,
      title: "Advanced React Development",
      description: "Master modern React patterns, hooks, and state management for building scalable applications.",
      instructor: "Sarah Johnson",
      instructorAvatar: "/placeholder.svg",
      duration: "12 weeks",
      students: 2847,
      rating: 4.8,
      reviews: 234,
      level: "Advanced",
      category: "technology",
      image: "/placeholder.svg",
      price: "Free",
      skills: ["React", "JavaScript", "State Management"],
      modules: 15,
      certificate: true,
      featured: true
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      description: "Learn the core concepts of machine learning and build your first predictive models.",
      instructor: "Dr. Michael Chen",
      instructorAvatar: "/placeholder.svg",
      duration: "8 weeks",
      students: 1923,
      rating: 4.9,
      reviews: 187,
      level: "Beginner",
      category: "ai",
      image: "/placeholder.svg",
      price: "Free",
      skills: ["Python", "Machine Learning", "Data Analysis"],
      modules: 12,
      certificate: true,
      featured: false
    },
    {
      id: 3,
      title: "Strategic Leadership in Digital Age",
      description: "Develop leadership skills needed to guide teams through digital transformation.",
      instructor: "Emily Rodriguez",
      instructorAvatar: "/placeholder.svg",
      duration: "6 weeks",
      students: 1456,
      rating: 4.7,
      reviews: 156,
      level: "Intermediate",
      category: "leadership",
      image: "/placeholder.svg",
      price: "Free",
      skills: ["Leadership", "Strategy", "Digital Transformation"],
      modules: 10,
      certificate: true,
      featured: true
    },
    {
      id: 4,
      title: "Project Management Essentials",
      description: "Master project management methodologies and tools for successful project delivery.",
      instructor: "James Wilson",
      instructorAvatar: "/placeholder.svg",
      duration: "10 weeks",
      students: 3124,
      rating: 4.6,
      reviews: 298,
      level: "Beginner",
      category: "business",
      image: "/placeholder.svg",
      price: "Free",
      skills: ["Project Management", "Agile", "Scrum"],
      modules: 14,
      certificate: true,
      featured: false
    },
    {
      id: 5,
      title: "Full-Stack Web Development",
      description: "Build complete web applications from frontend to backend with modern technologies.",
      instructor: "Alex Thompson",
      instructorAvatar: "/placeholder.svg",
      duration: "16 weeks",
      students: 2657,
      rating: 4.8,
      reviews: 312,
      level: "Intermediate",
      category: "technology",
      image: "/placeholder.svg",
      price: "Free",
      skills: ["HTML", "CSS", "JavaScript", "Node.js", "Database"],
      modules: 20,
      certificate: true,
      featured: true
    },
    {
      id: 6,
      title: "Data Science with Python",
      description: "Analyze data and create insights using Python libraries and statistical methods.",
      instructor: "Dr. Lisa Chang",
      instructorAvatar: "/placeholder.svg",
      duration: "14 weeks",
      students: 1834,
      rating: 4.9,
      reviews: 221,
      level: "Intermediate",
      category: "ai",
      image: "/placeholder.svg",
      price: "Free",
      skills: ["Python", "Data Analysis", "Statistics", "Visualization"],
      modules: 18,
      certificate: true,
      featured: false
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level.toLowerCase() === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const featuredCourses = courses.filter(course => course.featured);

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
        {featuredCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Featured Courses</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg bg-muted"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary">Featured</Badge>
                    {course.certificate && (
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
                      <img 
                        src={course.instructorAvatar} 
                        alt={course.instructor}
                        className="w-6 h-6 rounded-full bg-muted"
                      />
                      <span className="text-sm text-muted-foreground">{course.instructor}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                        <span>({course.reviews})</span>
                      </div>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.students.toLocaleString()}</span>
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

                    <Button className="w-full" asChild>
                      <Link to={`/course/${course.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                      </Link>
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
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg bg-muted"
                  />
                  {course.certificate && (
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
                    <img 
                      src={course.instructorAvatar} 
                      alt={course.instructor}
                      className="w-6 h-6 rounded-full bg-muted"
                    />
                    <span className="text-sm text-muted-foreground">{course.instructor}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                      <span>({course.reviews})</span>
                    </div>
                    <Badge variant="secondary">{course.level}</Badge>
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

                  <Button className="w-full" asChild>
                    <Link to={`/course/${course.id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Link>
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
    </AppLayout>
  );
};

export default Courses;
