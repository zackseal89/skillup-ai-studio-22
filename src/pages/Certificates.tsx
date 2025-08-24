
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { useCertificates } from "@/hooks/useCertificates";

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: certificates = [] } = useCertificates();

  // Filter certificates based on search term
  const filteredCertificates = certificates.filter(cert =>
    cert.certificate_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats from real data
  const totalEarned = certificates.length;
  const activeCertificates = certificates.length; // All certificates are active by default
  const expiringSoon = 0; // No expiry logic in current schema
  const inProgress = 0; // No in-progress certificates in current schema

  const handleDownload = (certificate: any) => {
    // Simulate certificate download
    console.log(`Downloading certificate: ${certificate.certificate_name}`);
  };

  const handleShare = (certificate: any) => {
    // Simulate sharing functionality
    console.log(`Sharing certificate: ${certificate.certificate_name}`);
  };

  const handleVerify = (certificate: any) => {
    if (certificate.certificate_url) {
      window.open(certificate.certificate_url, '_blank');
    }
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
              <p className="text-2xl font-bold text-foreground">{totalEarned}</p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{activeCertificates}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{expiringSoon}</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{inProgress}</p>
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


        {/* Earned Certificates */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Earned Certificates ({filteredCertificates.length})
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-primary to-primary/60 rounded-t-lg flex items-center justify-center">
                    <Award className="h-16 w-16 text-white" />
                  </div>
                  <Badge className="absolute top-3 right-3 bg-green-600">
                    Active
                  </Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <Award className="h-8 w-8 mb-2" />
                    <h3 className="font-bold text-lg">{certificate.certificate_name}</h3>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Issued</span>
                      <span className="font-medium">
                        {new Date(certificate.issued_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Skill</span>
                      <Badge variant="outline" className="text-xs">
                        {certificate.skill_id}
                      </Badge>
                    </div>
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
                    {certificate.certificate_url && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleVerify(certificate)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCertificates.length === 0 && certificates.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No certificates yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete courses and assessments to earn your first certificate
                </p>
              </CardContent>
            </Card>
          )}

          {filteredCertificates.length === 0 && certificates.length > 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No certificates found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search term
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
