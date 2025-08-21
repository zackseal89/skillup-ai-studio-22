
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Award, Download, Share2, Search, Calendar, 
  ArrowLeft, Brain, ExternalLink, Filter
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  credentialId: string;
  skills: string[];
  verificationUrl: string;
  downloadUrl: string;
  type: 'Course' | 'Certification' | 'Assessment';
}

const Certificates = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock certificates data
  const certificates: Certificate[] = [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      issuer: 'SkillUp AI',
      issuedDate: '2024-01-15',
      credentialId: 'ML-FUND-2024-001',
      skills: ['Python', 'Machine Learning', 'Data Analysis'],
      verificationUrl: 'https://skillup.ai/verify/ML-FUND-2024-001',
      downloadUrl: '/certificates/ml-fundamentals.pdf',
      type: 'Course'
    },
    {
      id: '2',
      title: 'Financial Risk Management Professional',
      issuer: 'SkillUp AI',
      issuedDate: '2024-01-20',
      expiryDate: '2027-01-20',
      credentialId: 'FRM-PROF-2024-002',
      skills: ['Risk Analysis', 'Compliance', 'Financial Modeling'],
      verificationUrl: 'https://skillup.ai/verify/FRM-PROF-2024-002',
      downloadUrl: '/certificates/financial-risk.pdf',
      type: 'Certification'
    },
    {
      id: '3',
      title: 'Data Analytics Skill Assessment',
      issuer: 'SkillUp AI',
      issuedDate: '2024-01-10',
      credentialId: 'DA-ASSESS-2024-003',
      skills: ['Data Analytics', 'Statistics', 'Excel'],
      verificationUrl: 'https://skillup.ai/verify/DA-ASSESS-2024-003',
      downloadUrl: '/certificates/data-analytics-assessment.pdf',
      type: 'Assessment'
    }
  ];

  const filteredCertificates = certificates.filter(cert =>
    cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    cert.issuer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (certificate: Certificate) => {
    // In production, this would trigger an actual file download
    console.log('Downloading certificate:', certificate.title);
  };

  const handleShare = (certificate: Certificate) => {
    if (navigator.share) {
      navigator.share({
        title: `${certificate.title} Certificate`,
        text: `I've earned a certificate in ${certificate.title}!`,
        url: certificate.verificationUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(certificate.verificationUrl);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Course': return 'bg-blue-100 text-blue-800';
      case 'Certification': return 'bg-green-100 text-green-800';
      case 'Assessment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <Link to="/courses" className="text-muted-foreground hover:text-primary transition-smooth">Courses</Link>
              <Link to="/progress" className="text-muted-foreground hover:text-primary transition-smooth">Progress</Link>
              <Link to="/certificates" className="text-primary font-medium">Certificates</Link>
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
          <h2 className="text-3xl font-bold text-foreground mb-2">My Certificates</h2>
          <p className="text-muted-foreground">
            View, download, and share your earned certificates and credentials
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Award className="h-4 w-4 text-primary" />
                <span>Total Certificates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{certificates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                <span>This Year</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {certificates.filter(cert => 
                  new Date(cert.issuedDate).getFullYear() === 2024
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Filter className="h-4 w-4 text-primary" />
                <span>Skills Covered</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {new Set(certificates.flatMap(cert => cert.skills)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <Card key={certificate.id} className="shadow-medium border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-5 w-5 text-primary" />
                        <Badge className={getTypeColor(certificate.type)}>
                          {certificate.type}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-2 mb-2">{certificate.title}</CardTitle>
                      <CardDescription>
                        Issued by {certificate.issuer}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Issued: {formatDate(certificate.issuedDate)}</span>
                    </div>
                    {certificate.expiryDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Expires: {formatDate(certificate.expiryDate)}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {certificate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    ID: {certificate.credentialId}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(certificate)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4" />
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
                      asChild
                    >
                      <a href={certificate.verificationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardHeader>
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>
                {searchTerm ? 'No Certificates Found' : 'No Certificates Yet'}
              </CardTitle>
              <CardDescription>
                {searchTerm 
                  ? 'Try adjusting your search terms to find certificates.'
                  : 'Complete courses and assessments to earn your first certificate!'
                }
              </CardDescription>
            </CardHeader>
            {!searchTerm && (
              <CardContent>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default Certificates;
