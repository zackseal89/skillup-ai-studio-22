
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Copy, Users } from "lucide-react";
import { useCompany, useCreateCompany, useJoinCompany } from "@/hooks/useCompanies";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

export const CompanySetup = () => {
  const { data: company } = useCompany();
  const { data: profile } = useProfile();
  const createCompany = useCreateCompany();
  const joinCompany = useJoinCompany();
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const generateCompanyCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCompanyCode(code);
  };

  const handleCreateCompany = async () => {
    if (!companyName.trim() || !companyCode.trim()) return;
    
    try {
      await createCompany.mutateAsync({
        name: companyName,
        company_code: companyCode,
      });
      setCompanyName("");
      setCompanyCode("");
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Company created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
    }
  };

  const handleJoinCompany = async () => {
    if (!joinCode.trim()) return;
    
    try {
      await joinCompany.mutateAsync(joinCode);
      setJoinCode("");
      setShowJoinDialog(false);
      toast({
        title: "Success",
        description: "Successfully joined company!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join company",
        variant: "destructive",
      });
    }
  };

  const copyCompanyCode = () => {
    if (company?.company_code) {
      navigator.clipboard.writeText(company.company_code);
      toast({
        title: "Copied!",
        description: "Company code copied to clipboard",
      });
    }
  };

  if (company) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            {company.name}
          </CardTitle>
          <CardDescription>
            Your company workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-sm font-medium">Company Code</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-lg font-mono">
                  {company.company_code}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCompanyCode}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Share this code</p>
              <p className="text-sm text-muted-foreground">with employees</p>
            </div>
          </div>
          
          {profile?.is_manager && (
            <div className="text-sm text-muted-foreground">
              <Users className="h-4 w-4 inline mr-2" />
              As a manager, you can create teams and manage employees from your company.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Company Setup
        </CardTitle>
        <CardDescription>
          Create a new company or join an existing one with a company code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Create Company
                <span className="text-xs text-muted-foreground">For managers</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Set up your company workspace and get a unique company code to share with employees.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="company-code">Company Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="company-code"
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                      placeholder="Enter or generate code"
                      className="font-mono"
                    />
                    <Button type="button" variant="outline" onClick={generateCompanyCode}>
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Employees will use this code to join your company
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateCompany}
                    disabled={createCompany.isPending || !companyName.trim() || !companyCode.trim()}
                  >
                    {createCompany.isPending ? "Creating..." : "Create Company"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-24 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Join Company
                <span className="text-xs text-muted-foreground">With company code</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Company</DialogTitle>
                <DialogDescription>
                  Enter the company code provided by your manager to join your company workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="join-code">Company Code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter company code"
                    className="font-mono"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleJoinCompany}
                    disabled={joinCompany.isPending || !joinCode.trim()}
                  >
                    {joinCompany.isPending ? "Joining..." : "Join Company"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
