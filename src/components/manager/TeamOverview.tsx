import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeamMembers, useTeamProgress } from "@/hooks/useTeams";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Award, Clock } from "lucide-react";

interface TeamOverviewProps {
  teamId: string;
}

export const TeamOverview = ({ teamId }: TeamOverviewProps) => {
  const { data: members } = useTeamMembers(teamId);
  const { data: teamProgress } = useTeamProgress(teamId);

  // Fetch profiles for team members
  const { data: profiles } = useQuery({
    queryKey: ['team-profiles', teamId],
    queryFn: async () => {
      if (!members || members.length === 0) return [];
      
      const userIds = members.map(m => m.user_id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!members && members.length > 0,
  });

  if (!members || !teamProgress || !profiles) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading team data...</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate team statistics
  const completedModules = teamProgress.progress.filter(p => p.status === 'completed').length;
  const inProgressModules = teamProgress.progress.filter(p => p.status === 'in_progress').length;
  const averageProgress = teamProgress.progress.length > 0 
    ? Math.round(teamProgress.progress.reduce((sum, p) => sum + p.completion_percentage, 0) / teamProgress.progress.length)
    : 0;

  // Create profiles lookup
  const profilesMap = profiles.reduce((acc, profile) => {
    acc[profile.user_id] = profile;
    return acc;
  }, {} as Record<string, any>);

  // Group progress by user
  const userProgressMap = teamProgress.progress.reduce((acc, progress) => {
    if (!acc[progress.user_id]) {
      acc[progress.user_id] = {
        user: profilesMap[progress.user_id],
        modules: [],
        totalProgress: 0,
        completedCount: 0,
      };
    }
    acc[progress.user_id].modules.push(progress);
    acc[progress.user_id].totalProgress += progress.completion_percentage;
    if (progress.status === 'completed') {
      acc[progress.user_id].completedCount++;
    }
    return acc;
  }, {} as any);

  // Calculate individual user stats
  const userStats = Object.entries(userProgressMap).map(([userId, data]: [string, any]) => ({
    userId,
    user: data.user,
    averageProgress: Math.round(data.totalProgress / data.modules.length),
    completedModules: data.completedCount,
    totalModules: data.modules.length,
  }));

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Team Progress Overview */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Team Progress Overview
            </CardTitle>
            <CardDescription>
              Individual progress tracking for team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStats.map((stat) => (
                    <TableRow key={stat.userId}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {stat.user?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{stat.user?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{stat.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {stat.user?.role || 'Member'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{stat.averageProgress}%</span>
                          </div>
                          <Progress value={stat.averageProgress} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {stat.completedModules}/{stat.totalModules}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={stat.averageProgress >= 80 ? "default" : stat.averageProgress >= 50 ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {stat.averageProgress >= 80 ? "Excellent" : stat.averageProgress >= 50 ? "Good" : "Needs Focus"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {userStats.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Progress Data</h3>
                  <p className="text-muted-foreground">
                    Team members haven't started any modules yet.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Summary Stats */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Team Size</span>
                <span className="font-medium">{members.length} members</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average Progress</span>
                <span className="font-medium">{averageProgress}%</span>
              </div>
              <Progress value={averageProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedModules}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{inProgressModules}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userStats
                .sort((a, b) => b.averageProgress - a.averageProgress)
                .slice(0, 3)
                .map((stat, index) => (
                  <div key={stat.userId} className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {index + 1}
                    </div>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {stat.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {stat.user?.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.averageProgress}% complete
                      </p>
                    </div>
                  </div>
                ))}

              {userStats.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No data available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
