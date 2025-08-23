
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Plus,
  UserPlus,
  Award,
  Target,
  UserCog,
  Building2
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useTeams, useCreateTeam, useInviteTeamMember } from "@/hooks/useTeams";
import { useProfile } from "@/hooks/useProfile";
import { useCompany } from "@/hooks/useCompanies";
import { TeamOverview } from "@/components/manager/TeamOverview";
import { TeamUpload } from "@/components/manager/TeamUpload";
import { ManagerRecommendations } from "@/components/manager/ManagerRecommendations";
import { UserRoleManagement } from "@/components/manager/UserRoleManagement";
import { CompanySetup } from "@/components/manager/CompanySetup";
import { ManagerSkillGapAnalyzer } from "@/components/manager/ManagerSkillGapAnalyzer";
import { PathSuggestionEngine } from "@/components/manager/PathSuggestionEngine";
import { TrendInsights } from "@/components/manager/TrendInsights";
import { EnhancedTeamProgress } from "@/components/manager/EnhancedTeamProgress";
import { OneClickUpskillingPlan } from "@/components/manager/OneClickUpskillingPlan";

const ManagerDashboard = () => {
  const { data: profile } = useProfile();
  const { data: company } = useCompany();
  const { data: teams } = useTeams();
  const createTeam = useCreateTeam();
  const inviteTeamMember = useInviteTeamMember();

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    try {
      await createTeam.mutateAsync({
        name: newTeamName,
        description: newTeamDescription,
      });
      setNewTeamName("");
      setNewTeamDescription("");
      setShowCreateTeam(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;
    
    try {
      await inviteTeamMember.mutateAsync({
        teamId: selectedTeam,
        email: inviteEmail,
      });
      setInviteEmail("");
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const currentTeam = teams?.find(t => t.id === selectedTeam);

  // Mock aggregated stats - would be calculated from real data
  const stats = [
    {
      title: "Total Team Members",
      value: "24",
      change: "+3 this month",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Avg. Progress",
      value: "67%",
      change: "+12% this week",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Certificates Earned",
      value: "18",
      change: "+5 this month",
      icon: Award,
      color: "text-purple-600"
    },
    {
      title: "Active Learners",
      value: "19",
      change: "79% engagement",
      icon: Target,
      color: "text-orange-600"
    }
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your company, teams, and track AI learning progress
            </p>
          </div>
        </div>

        {/* Company Setup Section */}
        <CompanySetup />

        {/* Main Content Tabs - only show if company exists */}
        {company && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Skill Analytics
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Trend Insights
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <UserCog className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <TrendInsights />
              {selectedTeam ? (
                <EnhancedTeamProgress teamId={selectedTeam} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Select a team to view detailed progress analytics</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {selectedTeam ? (
                <ManagerSkillGapAnalyzer teamId={selectedTeam} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Select a team to analyze skill gaps</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              {selectedTeam ? (
                <div className="space-y-6">
                  <PathSuggestionEngine teamId={selectedTeam} />
                  <OneClickUpskillingPlan teamId={selectedTeam} />
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Select a team to get AI recommendations</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <TrendInsights />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserRoleManagement />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserRoleManagement />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
};

export default ManagerDashboard;
