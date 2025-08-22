
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Plus,
  Upload,
  UserPlus,
  BarChart3,
  Target,
  Award,
  Clock
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useTeams, useCreateTeam, useInviteTeamMember } from "@/hooks/useTeams";
import { useProfile } from "@/hooks/useProfile";
import { TeamOverview } from "@/components/manager/TeamOverview";
import { TeamUpload } from "@/components/manager/TeamUpload";
import { ManagerRecommendations } from "@/components/manager/ManagerRecommendations";

const ManagerDashboard = () => {
  const { data: profile } = useProfile();
  const { data: teams } = useTeams();
  const createTeam = useCreateTeam();
  const inviteTeamMember = useInviteTeamMember();

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);

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
      setShowInviteMember(false);
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
              Track your team's AI learning progress and performance
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Create a new team to manage learners and track progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="e.g., Finance Team, Marketing Department"
                    />
                  </div>
                  <div>
                    <Label htmlFor="team-description">Description (Optional)</Label>
                    <Input
                      id="team-description"
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                      placeholder="Brief description of the team"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTeam} disabled={createTeam.isPending}>
                      {createTeam.isPending ? "Creating..." : "Create Team"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Team Selector */}
        {teams && teams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {teams.map((team) => (
                  <Card 
                    key={team.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedTeam === team.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTeam(team.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium">{team.name}</h3>
                      {team.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Teams State */}
        {teams && teams.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first team to start managing learners and tracking progress.
              </p>
              <Button onClick={() => setShowCreateTeam(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Team Dashboard Content */}
        {selectedTeam && currentTeam && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                        <p className="text-xs text-green-600">{stat.change}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Team Management Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <TeamUpload teamId={selectedTeam} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Invite Team Member
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                    />
                  </div>
                  <Button 
                    onClick={handleInviteMember}
                    disabled={inviteTeamMember.isPending || !inviteEmail.trim()}
                    className="w-full"
                  >
                    {inviteTeamMember.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Team Overview */}
            <TeamOverview teamId={selectedTeam} />

            {/* Manager Recommendations */}
            <ManagerRecommendations teamId={selectedTeam} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ManagerDashboard;
