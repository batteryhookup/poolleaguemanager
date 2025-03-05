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
  
  return backendLeagues.map(backendLeague => {
    // Transform sessions
    const transformedSessions: LeagueSession[] = backendLeague.sessions?.map((session: any) => {
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
        schedule: [],  // Would need to transform date format if available
        createdBy: typeof backendLeague.createdBy === 'string' ? backendLeague.createdBy : 'unknown',
        createdAt: session.createdAt || new Date().toISOString()
      };
    }) || [];

    // Transform league
    return {
      id: typeof backendLeague._id === 'string' ? parseInt(backendLeague._id.substring(0, 8), 16) : Date.now(),
      name: backendLeague.name,
      sessions: transformedSessions,
      password: '',  // We don't store passwords in the backend response
      createdBy: typeof backendLeague.createdBy === 'string' ? backendLeague.createdBy : 'unknown',
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
      if (!isLoading) {
        setIsLoading(true);
        try {
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
            
            setLeagues(transformedLeagues);
          } else {
            // Fall back to localStorage if API fails
            console.warn(`Failed to fetch leagues from API (status: ${response.status}), falling back to localStorage`);
            const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
            console.log("Leagues from localStorage:", allLeagues);
            setLeagues(allLeagues);
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
      }
    };

    fetchLeagues();
    
    // Set up a refresh interval
    const intervalId = setInterval(fetchLeagues, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
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

export default LeagueFinder;
