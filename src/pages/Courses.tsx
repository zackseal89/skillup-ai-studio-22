
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, Clock, Users, Star, Search, Filter,
  Brain, ArrowLeft, PlayCircle, Award, TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  category: string;
  skills: string[];
  price: number;
  thumbnail: string;
}

const Courses = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Mock courses data - in production, this would come from a database
  const courses: Course[] = [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      description: 'Learn the basics of machine learning with practical examples and hands-on projects.',
      instructor: 'Dr. Sarah Chen',
      duration: '8 weeks',
      level: 'Beginner',
      rating: 4.8,
      students: 2341,
      category: 'Technology',
      skills: ['Python', 'Data Analysis', 'Machine Learning'],
      price: 199,
      thumbnail: '/placeholder.svg'
    },
    {
      id: '2',
      title: 'Financial Risk Management',
      description: 'Master modern risk assessment techniques and regulatory compliance in finance.',
      instructor: 'Michael Rodriguez',
      duration: '6 weeks',
      level: 'Intermediate',
      rating: 4.9,
      students: 1567,
      category: 'Finance',
      skills: ['Risk Analysis', 'Compliance', 'Financial Modeling'],
      price: 249,
      thumbnail: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'Healthcare Data Analytics',
      description: 'Analyze patient data and outcomes to improve healthcare delivery and efficiency.',
      instructor: 'Dr. Emily Watson',
      duration: '10 weeks',
      level: 'Advanced',
      rating: 4.7,
      students: 892,
      category: 'Healthcare',
      skills: ['Data Analytics', 'Healthcare Systems', 'Statistics'],
      price: 299,
      thumbnail: '/placeholder.svg'
    },
    {
      id: '4',
      title: 'Cloud Architecture Design',
      description: 'Design scalable and secure cloud infrastructure using modern best practices.',
      instructor: 'James Liu',
      duration: '12 weeks',
      level: 'Advanced',
      rating: 4.9,
      students: 1234,
      category: 'Technology',
      skills: ['AWS', 'Cloud Architecture', 'DevOps'],
      price: 349,
      thumbnail: '/placeholder.svg'
    },
    {
      id: '5',
      title: 'Digital Marketing Analytics',
      description: 'Master data-driven marketing strategies and customer analytics.',
      instructor: 'Lisa Thompson',
      duration: '4 weeks',
      level: 'Intermediate',
      rating: 4.6,
      students: 1876,
      category: 'Marketing',
      skills: ['Analytics', 'Digital Marketing', 'Customer Insights'],
      price: 149,
      thumbnail: '/placeholder.svg'
    },
    {
      id: '6',
      title: 'Cybersecurity Fundamentals',
      description: 'Learn essential cybersecurity principles and threat mitigation strategies.',
      instructor: 'Robert Kim',
      duration: '8 weeks',
      level: 'Beginner',
      rating: 4.8,
      students: 2156,
      category: 'Technology',
      skills: ['Cybersecurity', 'Network Security', 'Threat Analysis'],
      price: 199,
      thumbnail: '/placeholder.svg'
    }
  ];

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = !filterLevel || course.level === filterLevel;
    const matchesCategory = !filterCategory || course.category === filterCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-smooth">Dashboard</Link>
              <Link to="/courses" className="text-primary font-medium">Courses</Link>
              <Link to="/progress" className="text-muted-foreground hover:text-primary transition-smooth">Progress</Link>
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Course Library</h2>
          <p className="text-muted-foreground">
            Discover courses tailored to your career goals and skill development needs
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses, skills, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </p>
          {profile?.industry && (
            <Badge variant="outline">
              Recommended for {profile.industry}
            </Badge>
          )}
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="shadow-medium border-border hover:shadow-lg transition-all card-interactive">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center">
                <PlayCircle className="h-12 w-12 text-primary" />
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 mb-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-3 mb-3">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {course.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{course.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">${course.price}</span>
                    <p className="text-sm text-muted-foreground">By {course.instructor}</p>
                  </div>
                  <Button asChild>
                    <Link to={`/course/${course.id}`}>
                      Enroll Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card className="text-center py-12">
            <CardHeader>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>No Courses Found</CardTitle>
              <CardDescription>
                Try adjusting your search terms or filters to find relevant courses.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Courses;
