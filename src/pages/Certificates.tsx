
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Award, 
  Download, 
  Share2, 
  Search, 
  Calendar,
  ExternalLink,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const certificates = [
    {
      id: 1,
      title: "Advanced React Development",
      issuer: "SkillUp AI",
      issueDate: "December 15, 2024",
      expiryDate: "December 15, 2026",
      credentialId: "CERT-REACT-2024-001",
      skills: ["React", "JavaScript", "State Management", "Component Architecture"],
      level: "Advanced",
      hours: 40,
      score: 95,
      image: "/placeholder.svg",
      verificationUrl: "https://verify.skillup-ai.com/cert-react-2024-001",
      status: "active"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      issuer: "SkillUp AI",
      issueDate: "December 10, 2024",
      expiryDate: "December 10, 2026",
      credentialId: "CERT-ML-2024-002",
      skills: ["Python", "Machine Learning", "Data Analysis", "Algorithms"],
      level: "Intermediate",
      hours: 60,
      score: 92,
      image: "/placeholder.svg",
      verificationUrl: "https://verify.skillup-ai.com/cert-ml-2024-002",
      status: "active"
    },
    {
      id: 3,
      title: "Project Management Essentials",
      issuer: "SkillUp AI",
      issueDate: "November 28, 2024",
      expiryDate: "November 28, 2026",
      credentialId: "CERT-PM-2024-003",
      skills: ["Project Management", "Agile", "Scrum", "Leadership"],
      level: "Intermediate",
      hours: 35,
      score: 88,
      image: "/placeholder.svg",
      verificationUrl: "https://verify.skillup-ai.com/cert-pm-2024-003",
      status: "active"
    },
    {
      id: 4,
      title: "Data Science with Python",
      issuer: "SkillUp AI",
      issueDate: "November 15, 2024",
      expiryDate: "November 15, 2025",
      credentialId: "CERT-DS-2024-004",
      skills: ["Python", "Data Science", "Statistics", "Visualization"],
      level: "Advanced",
      hours: 80,
      score: 96,
      image: "/placeholder.svg",
      verificationUrl: "https://verify.skillup-ai.com/cert-ds-2024-004",
      status: "expiring_soon"
    },
    {
      id: 5,
      title: "Frontend Web Development",
      issuer: "SkillUp AI",
      issueDate: "October 20, 2024",
      expiryDate: "October 20, 2025",
      credentialId: "CERT-FED-2024-005",
      skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
      level: "Beginner",
      hours: 25,
      score: 89,
      image: "/placeholder.svg",
      verificationUrl: "https://verify.skillup-ai.com/cert-fed-2024-005",
      status: "expiring_soon"
    }
  ];

  const inProgressCertifications = [
    {
      id: 6,
      title: "Cloud Computing Fundamentals",
      progress: 75,
      estimatedCompletion: "January 15, 2025",
      requirements: "Complete final project and pass assessment (85%+)",
      skills: ["AWS", "Cloud Architecture", "DevOps"]
    },
    {
      id: 7,
      title: "Full-Stack Development",
      progress: 45,
      estimatedCompletion: "February 28, 2025",
      requirements: "Complete 6 more modules and 2 projects",
      skills: ["Node.js", "Database", "API Development"]
    }
  ];

  const filteredCertificates = certificates.filter(cert =>
    cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownload = (certificate: any) => {
    // Simulate certificate download
    console.log(`Downloading certificate: ${certificate.title}`);
  };

  const handleShare = (certificate: any) => {
    // Simulate sharing functionality
    console.log(`Sharing certificate: ${certificate.title}`);
  };

  const handleVerify = (certificate: any) => {
    window.open(certificate.verificationUrl, '_blank');
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Certificates</h1>
          <p className="text-muted-foreground">
            View and manage your earned certifications and credentials
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{certificates.length}</p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {certificates.filter(c => c.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {certificates.filter(c => c.status === 'expiring_soon').length}
              </p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{inProgressCertifications.length}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* In Progress Certifications */}
        {inProgressCertifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Certifications in Progress
              </CardTitle>
              <CardDescription>
                Complete these requirements to earn your certificates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inProgressCertifications.map((cert) => (
                <Card key={cert.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{cert.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Est. completion: {cert.estimatedCompletion}
                          </p>
                        </div>
                        <Badge variant="secondary">{cert.progress}% Complete</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{cert.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${cert.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <strong>Requirements:</strong> {cert.requirements}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {cert.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Earned Certificates */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Earned Certificates ({filteredCertificates.length})
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={certificate.image} 
                    alt={certificate.title}
                    className="w-full h-48 object-cover rounded-t-lg bg-gradient-to-br from-primary to-primary/60"
                  />
                  <Badge 
                    className={`absolute top-3 right-3 ${
                      certificate.status === 'active' ? 'bg-green-600' : 'bg-orange-600'
                    }`}
                  >
                    {certificate.status === 'active' ? 'Active' : 'Expiring Soon'}
                  </Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <Award className="h-8 w-8 mb-2" />
                    <h3 className="font-bold text-lg">{certificate.title}</h3>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Issued by</span>
                      <span className="font-medium">{certificate.issuer}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Issue Date</span>
                      <span className="font-medium">{certificate.issueDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expires</span>
                      <span className="font-medium">{certificate.expiryDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Score</span>
                      <Badge variant="default" className="bg-green-600">
                        {certificate.score}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Skills Certified:</p>
                    <div className="flex flex-wrap gap-1">
                      {certificate.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Credential ID: {certificate.credentialId}</p>
                    <p>{certificate.hours} hours • {certificate.level} level</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDownload(certificate)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleShare(certificate)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleVerify(certificate)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCertificates.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No certificates found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or complete more courses to earn certificates
                </p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Certificates;
