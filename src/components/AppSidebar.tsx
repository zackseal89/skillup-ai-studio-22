
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Brain, 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Award, 
  ClipboardCheck,
  User,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Analytics"
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
    description: "Browse Training"
  },
  {
    title: "Progress",
    url: "/progress",
    icon: TrendingUp,
    description: "Track Learning"
  },
  {
    title: "Assessments",
    url: "/assessment",
    icon: ClipboardCheck,
    description: "Skill Tests"
  },
  {
    title: "Certificates",
    url: "/certificates",
    icon: Award,
    description: "Your Achievements"
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground">SkillUp AI</h2>
              <p className="text-xs text-muted-foreground">Employee Training</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <NavLink 
                      to={item.url}
                      className="flex items-center space-x-3 w-full"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <div className="flex-1">
                          <span className="font-medium">{item.title}</span>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      )}
                      {!isCollapsed && <ChevronRight className="h-4 w-4 opacity-50" />}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">Learner</p>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
