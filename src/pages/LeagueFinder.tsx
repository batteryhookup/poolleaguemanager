import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { League, LeagueSession } from "@/components/account/types/league";
import { Team } from "@/components/account/types/team";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { JoinLeagueDialog } from "@/components/league/JoinLeagueDialog";
import { LeagueStatusBadge } from "@/components/league/LeagueStatusBadge";
import { LeagueScheduleDisplay } from "@/components/league/LeagueScheduleDisplay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5001'
  : 'https://pool-league-manager-backend.onrender.com';

const timezoneOptions = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
];

// Function to transform backend league data to frontend League type
const transformBackendLeagueData = (backendLeagues: any[]): League[] => {
  if (!Array.isArray(backendLeagues)) {
    console.error("Backend leagues data is not an array:", backendLeagues);
    return [];
  }
  
  console.log("Processing backend leagues:", backendLeagues);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const currentUsername = currentUser.username || "unknown";
  
  return backendLeagues.map(backendLeague => {
    console.log("Processing backend league:", backendLeague.name);
    
    // Extract createdBy username if available
    let creatorUsername = "unknown";
    if (typeof backendLeague.createdBy === 'object' && backendLeague.createdBy?.username) {
      creatorUsername = backendLeague.createdBy.username;
    } else if (typeof backendLeague.createdBy === 'string') {
      creatorUsername = backendLeague.createdBy;
    } else if (backendLeague.createdBy === currentUser.id) {
      // If the creator ID matches the current user's ID, use the current username
      creatorUsername = currentUsername;
    }
    
    console.log(`League ${backendLeague.name} - Creator: ${creatorUsername}, Current user: ${currentUsername}`);
    
    // Transform sessions
    const transformedSessions: LeagueSession[] = backendLeague.sessions?.map((session: any) => {
      console.log("Processing session:", session.name);
      
      // Create a default schedule if none exists
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const defaultSchedule = [{
        date: tomorrow.toISOString().split('T')[0],
        startTime: "19:00",
        endTime: "22:00"
      }];
      
      return {
        id: typeof session._id === 'string' ? parseInt(session._id.substring(0, 8), 16) : Date.now(),
        parentLeagueId: typeof backendLeague._id === 'string' ? parseInt(backendLeague._id.substring(0, 8), 16) : Date.now(),
        name: session.name,
        sessionName: session.name,
        location: backendLeague.location || '',
        password: '',  // We don't store passwords in the backend response
        teams: session.teams || [],
        type: backendLeague.leagueType === 'team' ? 'team' : 'singles',
        gameType: backendLeague.gameType || '',
        schedule: defaultSchedule,  // Use default schedule
        createdBy: creatorUsername,
        createdAt: session.createdAt || new Date().toISOString()
      };
    }) || [];

    // Transform league
    return {
      id: typeof backendLeague._id === 'string' ? parseInt(backendLeague._id.substring(0, 8), 16) : Date.now(),
      name: backendLeague.name,
      sessions: transformedSessions,
      password: '',  // We don't store passwords in the backend response
      createdBy: creatorUsername,
      createdAt: backendLeague.createdAt || new Date().toISOString()
    };
  });
};

const LeagueFinder = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState("America/New_York");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeagues = async () => {
      setIsLoading(true);
      try {
        // Get leagues from localStorage first to ensure we have something to display
        const localStorageLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
        console.log("Initial leagues from localStorage:", localStorageLeagues);
        
        // Always set leagues from localStorage first to ensure we have something to display
        if (localStorageLeagues.length > 0) {
          setLeagues(localStorageLeagues);
          console.log("Displaying leagues from localStorage:", localStorageLeagues);
        }
        
        console.log("Testing leagues API endpoint...");
        // First test if the leagues endpoint is working at all
        try {
          const testResponse = await fetch(`${API_URL}/leagues/test`);
          console.log("Leagues test endpoint response:", testResponse.status);
        } catch (testError) {
          console.error("Error testing leagues API:", testError);
        }
        
        console.log("Fetching leagues from API...");
        // Try to fetch from the API first
        const response = await fetch(`${API_URL}/leagues`);
        console.log("API response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Raw backend leagues data:", data);
          
          // Transform the backend data to match frontend League type
          const transformedLeagues = transformBackendLeagueData(data);
          console.log("Transformed leagues data:", transformedLeagues);
          
          if (transformedLeagues.length === 0) {
            console.warn("No leagues found in API response or transformation resulted in empty array");
          }
          
          // Merge API leagues with localStorage leagues to ensure we don't lose any
          const mergedLeagues = mergeLeagues(transformedLeagues, localStorageLeagues);
          console.log("Merged leagues:", mergedLeagues);
          
          // Update state with the merged leagues
          setLeagues(mergedLeagues);
          
          // IMPORTANT: Also update localStorage with the merged leagues
          localStorage.setItem("leagues", JSON.stringify(mergedLeagues));
          console.log("Updated localStorage with merged leagues");
          
          // Dispatch custom event for other components to listen to
          window.dispatchEvent(new CustomEvent("leaguesUpdated", { detail: mergedLeagues }));
        } else {
          // Fall back to localStorage if API fails
          console.warn(`Failed to fetch leagues from API (status: ${response.status}), using localStorage leagues`);
          // We already set leagues from localStorage at the beginning, so no need to do it again
        }
        
        // Get user teams
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
          const username = JSON.parse(currentUser).username;
          const token = localStorage.getItem("token");
          
          if (token) {
            // Try to fetch teams from API
            try {
              const teamsResponse = await fetch(`${API_URL}/teams/user`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (teamsResponse.ok) {
                const teamsData = await teamsResponse.json();
                setUserTeams(teamsData);
              } else {
                // Fall back to localStorage
                const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
                const userTeams = allTeams.filter((team: Team) => 
                  team.createdBy === username || team.members.includes(username)
                );
                setUserTeams(userTeams);
              }
            } catch (error) {
              console.error("Error fetching teams:", error);
              // Fall back to localStorage
              const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
              const userTeams = allTeams.filter((team: Team) => 
                team.createdBy === username || team.members.includes(username)
              );
              setUserTeams(userTeams);
            }
          } else {
            // No token, use localStorage
            const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
            const userTeams = allTeams.filter((team: Team) => 
              team.createdBy === username || team.members.includes(username)
            );
            setUserTeams(userTeams);
          }
        }
      } catch (error) {
        console.error("Error fetching leagues:", error);
        // Fall back to localStorage
        const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
        setLeagues(allLeagues);
        console.log("Using leagues from localStorage due to error:", allLeagues);
        
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
          const username = JSON.parse(currentUser).username;
          const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
          const userTeams = allTeams.filter((team: Team) => 
            team.createdBy === username || team.members.includes(username)
          );
          setUserTeams(userTeams);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
    
    // Add event listener for league updates
    const handleLeaguesUpdated = (event: CustomEvent) => {
      console.log("LeagueFinder: Received leaguesUpdated event", event.detail);
      setLeagues(event.detail);
    };
    
    window.addEventListener("leaguesUpdated", handleLeaguesUpdated as EventListener);
    
    // Add event listener for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "leagues") {
        console.log("LeagueFinder: Detected localStorage change for leagues");
        const updatedLeagues = JSON.parse(event.newValue || "[]");
        setLeagues(updatedLeagues);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("leaguesUpdated", handleLeaguesUpdated as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleJoinClick = (league: League) => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in or create an account to join a league.",
      });
      navigate("/");
      return;
    }

    setSelectedLeague(league);
    setIsJoinDialogOpen(true);
  };

  const handleJoinRequest = (joinType: "player" | "team", teamId?: string) => {
    if (!selectedLeague) return;

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;

    const username = JSON.parse(currentUser).username;
    const existingRequests = JSON.parse(localStorage.getItem("leagueRequests") || "[]");
    
    if (joinType === "team" && !teamId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a team to join with.",
      });
      return;
    }
    
    const newRequest = {
      id: Date.now(),
      leagueId: selectedLeague.id,
      requestType: joinType,
      username,
      teamId: joinType === "team" ? teamId : null,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("leagueRequests", JSON.stringify([...existingRequests, newRequest]));
    
    setIsJoinDialogOpen(false);
    setSelectedLeague(null);

    toast({
      title: "Request Sent",
      description: "Your request to join the league has been sent to the league owner.",
    });
  };

  const filteredLeagues = leagues.filter((league) =>
    league.sessions.some(
      (session) =>
        league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.gameType.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedLeagues = [...filteredLeagues].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">League Finder</h1>
          <p className="text-gray-500">
            Find leagues by name or location
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search leagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>League Name</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Game Type</TableHead>
                <TableHead>League Type</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Schedule
                    <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeagues.flatMap((league) =>
                league.sessions.map((session) => (
                  <TableRow key={`${league.id}-${session.id}`}>
                    <TableCell className="font-medium">{league.name}</TableCell>
                    <TableCell>{session.sessionName}</TableCell>
                    <TableCell>{session.location}</TableCell>
                    <TableCell>{session.gameType}</TableCell>
                    <TableCell className="capitalize">{session.type}</TableCell>
                    <TableCell>
                      <LeagueScheduleDisplay session={session} timezone={selectedTimezone} />
                    </TableCell>
                    <TableCell>
                      <LeagueStatusBadge session={session} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleJoinClick(league)}
                      >
                        Join League
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {sortedLeagues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    No leagues found. Try a different search term or create a new league.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <JoinLeagueDialog
        isOpen={isJoinDialogOpen}
        onOpenChange={setIsJoinDialogOpen}
        selectedLeague={selectedLeague}
        userTeams={userTeams}
        onJoinRequest={handleJoinRequest}
      />
    </Layout>
  );
};

// Helper function to merge leagues from API and localStorage
const mergeLeagues = (apiLeagues: League[], localLeagues: League[]): League[] => {
  // Create a map of leagues by name for quick lookup
  const leagueMap = new Map<string, League>();
  
  // Add all local leagues to the map
  localLeagues.forEach(league => {
    leagueMap.set(league.name, league);
  });
  
  // Add or update with API leagues
  apiLeagues.forEach(league => {
    const existingLeague = leagueMap.get(league.name);
    
    if (existingLeague) {
      // If the league already exists, merge the sessions
      const allSessions = [...existingLeague.sessions];
      
      // Add any sessions from the API league that don't exist in the local league
      league.sessions.forEach(apiSession => {
        const sessionExists = allSessions.some(
          localSession => localSession.name === apiSession.name || localSession.sessionName === apiSession.name
        );
        
        if (!sessionExists) {
          allSessions.push(apiSession);
        }
      });
      
      // Update the league with the merged sessions
      leagueMap.set(league.name, {
        ...existingLeague,
        sessions: allSessions
      });
      
      console.log(`Merged league ${league.name} - Combined ${existingLeague.sessions.length} local sessions with ${league.sessions.length} API sessions for a total of ${allSessions.length} sessions`);
    } else {
      // If the league doesn't exist locally, add it from the API
      leagueMap.set(league.name, league);
    }
  });
  
  // Convert map back to array
  return Array.from(leagueMap.values());
};

export default LeagueFinder;
