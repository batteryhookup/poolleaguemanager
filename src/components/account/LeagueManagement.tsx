import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Archive, CalendarClock, Trash, Edit, Plus } from "lucide-react";
import { CreateLeagueForm } from "./league/CreateLeagueForm";
import { LeagueList } from "./league/LeagueList";
import { LeagueDialogs } from "./league/LeagueDialogs";
import { League, LeagueSession, LeagueManagementProps } from "./types/league";
import { Team } from "./types/team";
import { categorizeLeague } from "@/hooks/useUserData";
import {
  createLeague,
  createLeagueSession,
  deleteLeague,
  addTeam,
  deleteTeam,
  updateLeague,
} from "./league/LeagueOperations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditLeagueDialog } from "./league/EditLeagueDialog";
import { EditSessionDialog } from "./league/EditSessionDialog";

export interface ExtendedLeagueManagementProps extends LeagueManagementProps {
  upcomingLeagues: League[];
  archivedLeagues: League[];
}

export function LeagueManagement({
  leagues,
  upcomingLeagues,
  setLeagues,
  archivedLeagues
}: ExtendedLeagueManagementProps) {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDeleteTeamDialogOpen, setIsDeleteTeamDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LeagueSession | null>(null);
  const [isDeleteLeagueDialogOpen, setIsDeleteLeagueDialogOpen] = useState(false);
  const [selectedLeagueToDelete, setSelectedLeagueToDelete] = useState<League | null>(null);
  const [isEditLeagueDialogOpen, setIsEditLeagueDialogOpen] = useState(false);
  const [selectedLeagueToEdit, setSelectedLeagueToEdit] = useState<League | null>(null);
  const [isEditSessionDialogOpen, setIsEditSessionDialogOpen] = useState(false);
  const [selectedSessionToEdit, setSelectedSessionToEdit] = useState<LeagueSession | null>(null);

  const handleCreateLeague = (newLeague: League) => {
    console.log("handleCreateLeague called with:", {
      id: newLeague.id,
      name: newLeague.name,
      sessionCount: newLeague.sessions.length,
      sessions: newLeague.sessions.map(s => ({ id: s.id, name: s.sessionName }))
    });
    
    // If this is a new league, create it
    if (!leagues.some(league => league.id === newLeague.id)) {
      console.log("Creating new league");
      createLeague(newLeague, leagues, setLeagues, true);
    } else {
      // If this is an existing league with a new session, update it
      console.log("Updating existing league with new session");
      const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      
      // Find the existing league to check its current sessions
      const existingLeague = existingLeagues.find((league: League) => league.id === newLeague.id);
      if (existingLeague) {
        console.log("Existing league sessions:", existingLeague.sessions.map(s => ({ id: s.id, name: s.sessionName })));
        console.log("New league sessions:", newLeague.sessions.map(s => ({ id: s.id, name: s.sessionName })));
      }
      
      const updatedLeagues = existingLeagues.map((league: League) =>
        league.id === newLeague.id ? newLeague : league
      );
      localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
      setLeagues(leagues.map(league => league.id === newLeague.id ? newLeague : league));
      window.dispatchEvent(new Event('leagueUpdate'));
      
      // Show success toast for session creation
      toast({
        title: "Success",
        description: "League session created successfully!",
      });
    }
    
    // Set the appropriate tab based on the league's category
    const category = categorizeLeague(newLeague);
    console.log(`Setting tab for league ${newLeague.name} to ${category}`);
    switch (category) {
      case 'archived':
        setActiveTab('archives');
        break;
      case 'upcoming':
        setActiveTab('upcoming');
        break;
      case 'active':
        setActiveTab('active');
        break;
    }
  };

  const handleCreateSession = (newSession: LeagueSession) => {
    createLeagueSession(newSession, leagues, setLeagues);
    // Find the parent league and categorize it
    const parentLeague = leagues.find(l => l.sessions.some(s => s.id === newSession.id));
    if (parentLeague) {
      const category = categorizeLeague(parentLeague);
      console.log(`Setting tab for league ${parentLeague.name} to ${category}`);
      switch (category) {
        case 'archived':
          setActiveTab('archives');
          break;
        case 'upcoming':
          setActiveTab('upcoming');
          break;
        case 'active':
          setActiveTab('active');
          break;
      }
    }
  };

  const handleDeleteLeague = (password: string) => {
    if (!selectedSession) return;
    
    // Find the parent league of the selected session
    const allLeagues = [...leagues, ...upcomingLeagues, ...archivedLeagues];
    const parentLeague = allLeagues.find(league => 
      league.sessions.some(session => session.id === selectedSession.id)
    );
    
    if (!parentLeague) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Parent league not found.",
      });
      return;
    }

    // Verify the session password
    if (password !== selectedSession.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect session password.",
      });
      return;
    }

    try {
      const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      
      // Find and update the parent league in storage
      const updatedLeagues = existingLeagues.map((league: League) => {
        if (league.id === parentLeague.id) {
          // Remove only the specific session
          return {
            ...league,
            sessions: league.sessions.filter(session => session.id !== selectedSession.id)
          };
        }
        return league;
      });

      // If this was the last session, remove the entire league
      const finalLeagues = updatedLeagues.filter(league => league.sessions.length > 0);
      
      localStorage.setItem("leagues", JSON.stringify(finalLeagues));
      
      // Update state with the new leagues
      setLeagues(leagues.map(league => {
        if (league.id === parentLeague.id) {
          return {
            ...league,
            sessions: league.sessions.filter(session => session.id !== selectedSession.id)
          };
        }
        return league;
      }).filter(league => league.sessions.length > 0));
      
      window.dispatchEvent(new Event('leagueUpdate'));
      
      toast({
        title: "Success",
        description: "Session deleted successfully!",
      });
      setSelectedSession(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete session. Please try again.",
      });
    }
  };

  const handleAddTeam = (teamName: string) => {
    if (!selectedSession) return;
    if (addTeam(selectedSession, teamName, leagues, setLeagues)) {
      setIsAddTeamDialogOpen(false);
    }
  };

  const handleDeleteTeam = (password: string) => {
    if (!selectedSession || !selectedTeam) return;
    if (deleteTeam(selectedSession, selectedTeam, password, leagues, setLeagues)) {
      setSelectedTeam(null);
      setIsDeleteTeamDialogOpen(false);
    }
  };

  const handleEditSession = (session: LeagueSession) => {
    setSelectedSessionToEdit(session);
    setIsEditSessionDialogOpen(true);
  };

  const handleUpdateSession = (updatedSession: LeagueSession) => {
    // Search for parent league across all league lists
    const allLeagues = [...leagues, ...upcomingLeagues, ...archivedLeagues];
    const parentLeague = allLeagues.find(league => 
      league.sessions.some(session => session.id === updatedSession.id)
    );
    
    if (!parentLeague) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Parent league not found.",
      });
      return;
    }

    const updatedLeague = {
      ...parentLeague,
      sessions: parentLeague.sessions.map(session =>
        session.id === updatedSession.id ? updatedSession : session
      )
    };

    try {
      // Update in localStorage
      const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      const updatedLeagues = existingLeagues.map((league: League) =>
        league.id === parentLeague.id ? updatedLeague : league
      );
      localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

      // Update in state
      if (leagues.some(league => league.id === parentLeague.id)) {
        updateLeague(updatedLeague, leagues, setLeagues);
      } else if (upcomingLeagues.some(league => league.id === parentLeague.id)) {
        // Update upcoming leagues
        const updatedUpcomingLeagues = upcomingLeagues.map(league =>
          league.id === parentLeague.id ? updatedLeague : league
        );
        // You'll need to add a setUpcomingLeagues prop to handle this
        // For now, we'll just update the local state
        window.dispatchEvent(new Event('leagueUpdate'));
      } else if (archivedLeagues.some(league => league.id === parentLeague.id)) {
        // Update archived leagues
        const updatedArchivedLeagues = archivedLeagues.map(league =>
          league.id === parentLeague.id ? updatedLeague : league
        );
        // You'll need to add a setArchivedLeagues prop to handle this
        // For now, we'll just update the local state
        window.dispatchEvent(new Event('leagueUpdate'));
      }

      toast({
        title: "Success",
        description: "Session updated successfully!",
      });
      setIsEditSessionDialogOpen(false);
      setSelectedSessionToEdit(null);
    } catch (error) {
      console.error("Error updating session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update session. Please try again.",
      });
    }
  };

  const handleDeleteEntireLeague = (password: string) => {
    if (!selectedLeagueToDelete) return;
    
    if (password !== selectedLeagueToDelete.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect league password.",
      });
      return;
    }

    try {
      const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      const updatedLeagues = existingLeagues.filter((league: League) => league.id !== selectedLeagueToDelete.id);
      localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
      setLeagues(leagues.filter(league => league.id !== selectedLeagueToDelete.id));
      
      window.dispatchEvent(new Event('leagueUpdate'));
      
      toast({
        title: "Success",
        description: "League and all its sessions deleted successfully!",
      });
      
      // Clean up state and ensure overlay is removed
      setIsDeleteLeagueDialogOpen(false);
      setSelectedLeagueToDelete(null);
      setTimeout(() => {
        document.body.style.pointerEvents = 'auto';
      }, 0);
    } catch (error) {
      console.error("Error deleting league:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete league. Please try again.",
      });
    }
  };

  const handleUpdateLeagueName = (updatedLeague: League) => {
    try {
      // Update in localStorage
      const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      const updatedLeagues = existingLeagues.map((league: League) =>
        league.id === updatedLeague.id ? {
          ...updatedLeague,
          sessions: league.sessions.map(session => ({
            ...session,
            name: updatedLeague.name // Update the league name in all sessions
          }))
        } : league
      );
      localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
      
      // Update all league lists
      const updateLeagueInList = (leagueList: League[]) => 
        leagueList.map(league =>
          league.id === updatedLeague.id ? {
            ...updatedLeague,
            sessions: league.sessions.map(session => ({
              ...session,
              name: updatedLeague.name
            }))
          } : league
        );

      setLeagues(updateLeagueInList(leagues));
      
      // Trigger a refresh of all league lists
      window.dispatchEvent(new Event('leagueUpdate'));
      
      toast({
        title: "Success",
        description: "League updated successfully!",
      });
    } catch (error) {
      console.error("Error updating league:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update league. Please try again.",
      });
    }
  };

  const handleEditLeagueDialogClose = (open: boolean) => {
    if (!open) {
      // When closing, ensure we clean up all state
      setIsEditLeagueDialogOpen(false);
      setSelectedLeagueToEdit(null);
      // Force a re-render to ensure the overlay is removed
      setTimeout(() => {
        document.body.style.pointerEvents = 'auto';
      }, 0);
    } else {
      // When opening, just update the open state
      setIsEditLeagueDialogOpen(true);
    }
  };

  // Get unique leagues for the filter dropdown
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  // Combine all leagues and remove duplicates based on league ID
  const allLeagues = [...leagues, ...upcomingLeagues, ...archivedLeagues];
  const uniqueLeagues = Array.from(new Map(allLeagues.map(league => [league.id, league])).values());
  const userLeagues = uniqueLeagues.filter(league => {
    console.log("Checking league:", league.name, "Created by:", league.createdBy, "Current user:", currentUser.username);
    return league.createdBy === currentUser.username;
  });
  console.log("User leagues:", userLeagues.map(l => ({ id: l.id, name: l.name })));

  // Filter sessions based on selected league
  const getFilteredSessions = (leaguesList: League[]) => {
    if (!selectedLeagueFilter) return leaguesList.flatMap(l => l.sessions);
    const league = leaguesList.find(l => l.id === selectedLeagueFilter);
    return league ? league.sessions : [];
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <h2 className="text-2xl font-bold tracking-tight">My Leagues</h2>
          </div>
          <div className="flex justify-start">
            <Select 
              value={selectedLeagueFilter?.toString() || "all"} 
              onValueChange={(value) => {
                console.log("Selected value:", value);
                const newValue = value === "all" ? null : parseInt(value);
                console.log("Setting filter to:", newValue);
                setSelectedLeagueFilter(newValue);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by league" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leagues</SelectItem>
                {userLeagues.map(league => (
                  <div key={league.id} className="flex items-center justify-between px-2 py-1.5">
                    <SelectItem value={league.id.toString()} className="flex-1">
                      {league.name}
                    </SelectItem>
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedLeagueToEdit(league);
                          setIsEditLeagueDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedLeagueToDelete(league);
                          setIsDeleteLeagueDialogOpen(true);
                        }}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Tabs defaultValue="active" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active">
                <Trophy className="mr-2 h-4 w-4" />
                Active
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                <CalendarClock className="mr-2 h-4 w-4" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="archives">
                <Archive className="mr-2 h-4 w-4" />
                Archives
              </TabsTrigger>
              <TabsTrigger value="create">
                <Plus className="mr-2 h-4 w-4" />
                Create League
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <LeagueList
                leagues={selectedLeagueFilter ? leagues.filter(league => league.id === selectedLeagueFilter) : leagues}
                onDeleteLeague={(league) => {
                  setSelectedLeagueToDelete(league);
                  setIsDeleteLeagueDialogOpen(true);
                }}
                onEditLeague={(league) => {
                  setSelectedLeagueToEdit(league);
                  setIsEditLeagueDialogOpen(true);
                }}
                onDeleteSession={(session) => {
                  setSelectedSession(session);
                  setIsDeleteDialogOpen(true);
                }}
                onAddTeam={(session) => {
                  setSelectedSession(session);
                  setIsAddTeamDialogOpen(true);
                }}
                onDeleteTeam={(session, team) => {
                  setSelectedSession(session);
                  setSelectedTeam(team);
                  setIsDeleteTeamDialogOpen(true);
                }}
                onEditSession={handleEditSession}
              />
            </TabsContent>
            <TabsContent value="upcoming">
              <LeagueList
                leagues={selectedLeagueFilter ? upcomingLeagues.filter(league => league.id === selectedLeagueFilter) : upcomingLeagues}
                onDeleteLeague={(league) => {
                  setSelectedLeagueToDelete(league);
                  setIsDeleteLeagueDialogOpen(true);
                }}
                onEditLeague={(league) => {
                  setSelectedLeagueToEdit(league);
                  setIsEditLeagueDialogOpen(true);
                }}
                onDeleteSession={(session) => {
                  setSelectedSession(session);
                  setIsDeleteDialogOpen(true);
                }}
                onAddTeam={(session) => {
                  setSelectedSession(session);
                  setIsAddTeamDialogOpen(true);
                }}
                onDeleteTeam={(session, team) => {
                  setSelectedSession(session);
                  setSelectedTeam(team);
                  setIsDeleteTeamDialogOpen(true);
                }}
                onEditSession={handleEditSession}
              />
            </TabsContent>
            <TabsContent value="archives">
              <LeagueList
                leagues={selectedLeagueFilter ? archivedLeagues.filter(league => league.id === selectedLeagueFilter) : archivedLeagues}
                onDeleteLeague={(league) => {
                  setSelectedLeagueToDelete(league);
                  setIsDeleteLeagueDialogOpen(true);
                }}
                onEditLeague={(league) => {
                  setSelectedLeagueToEdit(league);
                  setIsEditLeagueDialogOpen(true);
                }}
                onDeleteSession={(session) => {
                  setSelectedSession(session);
                  setIsDeleteDialogOpen(true);
                }}
                onAddTeam={(session) => {
                  setSelectedSession(session);
                  setIsAddTeamDialogOpen(true);
                }}
                onDeleteTeam={(session, team) => {
                  setSelectedSession(session);
                  setSelectedTeam(team);
                  setIsDeleteTeamDialogOpen(true);
                }}
                onEditSession={handleEditSession}
              />
            </TabsContent>
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create New League</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateLeagueForm onSubmit={handleCreateLeague} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <LeagueDialogs
        selectedSession={selectedSession}
        selectedTeam={selectedTeam}
        selectedLeagueToDelete={selectedLeagueToDelete}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isAddTeamDialogOpen={isAddTeamDialogOpen}
        isDeleteTeamDialogOpen={isDeleteTeamDialogOpen}
        isDeleteLeagueDialogOpen={isDeleteLeagueDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        setIsAddTeamDialogOpen={setIsAddTeamDialogOpen}
        setIsDeleteTeamDialogOpen={setIsDeleteTeamDialogOpen}
        setIsDeleteLeagueDialogOpen={setIsDeleteLeagueDialogOpen}
        onDeleteLeague={handleDeleteLeague}
        onAddTeam={handleAddTeam}
        onDeleteTeam={handleDeleteTeam}
        onDeleteEntireLeague={handleDeleteEntireLeague}
      />

      <EditLeagueDialog
        league={selectedLeagueToEdit}
        open={isEditLeagueDialogOpen}
        onOpenChange={handleEditLeagueDialogClose}
        onSave={handleUpdateLeagueName}
      />

      <EditSessionDialog
        session={selectedSessionToEdit}
        open={isEditSessionDialogOpen}
        onOpenChange={setIsEditSessionDialogOpen}
        onSave={handleUpdateSession}
      />
    </Card>
  );
}
