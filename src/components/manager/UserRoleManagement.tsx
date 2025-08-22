
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCog, Search, Shield, Users, Building2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/hooks/useCompanies";

interface Profile {
  user_id: string;
  full_name: string;
  email: string;
  is_manager: boolean;
  industry: string;
  role: string;
  company_id: string;
}

export const UserRoleManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: company } = useCompany();

  // Fetch users from the same company
  const { data: users, isLoading } = useQuery({
    queryKey: ['company-users', company?.id],
    queryFn: async () => {
      if (!company) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, is_manager, industry, role, company_id')
        .eq('company_id', company.id)
        .order('full_name');

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!company,
  });

  // Update user manager status
  const updateManagerStatus = useMutation({
    mutationFn: async ({ userId, isManager }: { userId: string; isManager: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_manager: isManager })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      console.error('Error updating user role:', error);
    },
  });

  const handleToggleManager = (userId: string, currentStatus: boolean) => {
    updateManagerStatus.mutate({
      userId,
      isManager: !currentStatus,
    });
  };

  const filteredUsers = users?.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const managerCount = users?.filter(user => user.is_manager).length || 0;
  const totalUsers = users?.length || 0;

  if (!company) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Company Setup</h3>
          <p className="text-muted-foreground">
            You need to create or join a company first to manage user roles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCog className="h-5 w-5 mr-2" />
          User Role Management - {company.name}
        </CardTitle>
        <CardDescription>
          Manage user permissions for employees in your company
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{managerCount}</div>
            <div className="text-sm text-muted-foreground">Managers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalUsers - managerCount}</div>
            <div className="text-sm text-muted-foreground">Regular Users</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {totalUsers === 0 ? "No employees have joined your company yet" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.industry}</Badge>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.is_manager ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Shield className="h-3 w-3 mr-1" />
                          Manager
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.is_manager}
                          onCheckedChange={() => handleToggleManager(user.user_id, user.is_manager)}
                          disabled={updateManagerStatus.isPending}
                        />
                        <Label className="text-sm">Manager</Label>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
