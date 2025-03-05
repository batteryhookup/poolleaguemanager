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
    console.log("handleCreateLeague called with:", newLeague);
    
    // Get all leagues from localStorage
    const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]") as League[];
    
    // Check if a league with the same name already exists (case insensitive)
    const existingLeague = existingLeagues.find(
      league => league.name.toLowerCase() === newLeague.name.toLowerCase()
    );
    
    if (existingLeague) {
      console.log(`Updating existing league: ${existingLeague.name}`);
      
      // Check if we're adding new sessions
      const newSessions = newLeague.sessions.filter(newSession => 
        !existingLeague.sessions.some(existingSession => 
          existingSession.id === newSession.id || 
          (existingSession.sessionName === newSession.sessionName && 
           existingSession.parentLeagueId === newSession.parentLeagueId)
        )
      );
      
      if (newSessions.length > 0) {
        console.log(`Adding ${newSessions.length} new sessions to existing league`);
        
        // Update the existing league with new sessions
        const updatedLeague = {
          ...existingLeague,
          sessions: [...existingLeague.sessions, ...newSessions]
        };
        
        // Update localStorage
        const updatedLeagues = existingLeagues.map(league => 
          league.id === existingLeague.id ? updatedLeague : league
        );
        localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
        
        // Update state
        setLeagues(prevLeagues => 
          prevLeagues.map(league => league.id === existingLeague.id ? updatedLeague : league)
        );
        
        // Trigger a refresh
        window.dispatchEvent(new Event('leagueUpdate'));
        
        toast({
          title: "Success",
          description: `Added new sessions to ${existingLeague.name}`,
        });
      } else {
        console.log("No new sessions found to add");
        
        // Force create a new league with a different ID
        const forceNewLeague = {
          ...newLeague,
          id: Date.now() + Math.floor(Math.random() * 10000),
          sessions: newLeague.sessions.map(session => ({
            ...session,
            id: Date.now() + Math.floor(Math.random() * 10000),
            parentLeagueId: Date.now() + Math.floor(Math.random() * 10000)
          }))
        };
        
        // Update the parentLeagueId in all sessions
        forceNewLeague.sessions.forEach(session => {
          session.parentLeagueId = forceNewLeague.id;
        });
        
        console.log("Force creating new league with different ID:", forceNewLeague);
        
        // Add the new league to localStorage
        const updatedLeagues = [...existingLeagues, forceNewLeague];
        localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
        
        // Update state
        setLeagues(prevLeagues => [...prevLeagues, forceNewLeague]);
        
        // Trigger a refresh
        window.dispatchEvent(new Event('leagueUpdate'));
        
        toast({
          title: "Success",
          description: `Created new league: ${forceNewLeague.name}`,
        });
      }
    } else {
      console.log("Creating brand new league:", newLeague.name);
      
      // Add the new league to localStorage
      const updatedLeagues = [...existingLeagues, newLeague];
      localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
      
      // Update state
      setLeagues(prevLeagues => [...prevLeagues, newLeague]);
      
      // Trigger a refresh
      window.dispatchEvent(new Event('leagueUpdate'));
      
      toast({
        title: "Success",
        description: `Created new league: ${newLeague.name}`,
      });
    }
    
    // Set the active tab to the appropriate category based on the league's sessions
    if (newLeague.sessions.length > 0) {
      const session = newLeague.sessions[0];
      if (!session.schedule || session.schedule.length === 0) return;
      
      const firstDate = new Date(session.schedule[0].date);
      const lastDate = new Date(session.schedule[session.schedule.length - 1].date);
      const now = new Date();
      
      if (firstDate > now) {
        setActiveTab("upcoming");
      } else if (lastDate < now) {
        setActiveTab("archived");
      } else {
        setActiveTab("active");
      }
    }
  };

  // This function should not be used directly from CreateLeagueForm
  const handleCreateSession = (newSession: LeagueSession) => {
    console.log("WARNING: handleCreateSession called directly, which may cause duplication");
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

    // Create a new league with the session removed
    const updatedLeague = {
      ...parentLeague,
      sessions: parentLeague.sessions.filter(session => session.id !== selectedSession.id)
    };

    // If this was the last session, delete the entire league
    if (updatedLeague.sessions.length === 0) {
      console.log("Deleting entire league:", parentLeague.name);
      const success = deleteLeague(parentLeague, password, leagues, setLeagues);
      
      if (success) {
        // Reset selected session and team
        setSelectedSession(null);
        setSelectedTeam(null);
        
        // Close the dialog
        setIsDeleteLeagueDialogOpen(false);
        
        // Force a refresh of the league lists
        setTimeout(() => {
          window.dispatchEvent(new Event('leagueUpdate'));
        }, 100);
      }
      return;
    }

    // Otherwise, update the league with the session removed
    console.log("Removing session from league:", selectedSession.sessionName);
    updateLeague(updatedLeague, leagues, setLeagues);
    
    // Reset selected session and team
    setSelectedSession(null);
    setSelectedTeam(null);
    
    // Close the dialog
    setIsDeleteLeagueDialogOpen(false);
    
    // Force a refresh of the league lists
    setTimeout(() => {
      window.dispatchEvent(new Event('leagueUpdate'));
    }, 100);
    
    toast({
      title: "Success",
      description: "Session deleted successfully!",
    });
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
                  <CreateLeagueForm 
                    onSubmit={handleCreateLeague} 
                    onClose={() => {
                      // This will be called after a successful form submission
                      console.log("League creation form closed");
                      // Force a refresh of the league lists
                      setTimeout(() => {
                        window.dispatchEvent(new Event('leagueUpdate'));
                      }, 100);
                    }} 
                  />
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
