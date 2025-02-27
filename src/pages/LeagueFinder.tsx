
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
import { League } from "@/components/account/types/league";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Team } from "@/components/account/types/team";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const LeagueFinder = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [joinType, setJoinType] = useState<"player" | "team">("player");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Add interval to check for league updates
  useEffect(() => {
    const loadData = () => {
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
    };

    // Load data immediately
    loadData();

    // Set up interval to refresh data
    const intervalId = setInterval(loadData, 1000);

    // Cleanup interval on unmount
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

  const handleJoinRequest = () => {
    if (!selectedLeague) return;

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;

    const username = JSON.parse(currentUser).username;
    const existingRequests = JSON.parse(localStorage.getItem("leagueRequests") || "[]");
    
    if (joinType === "team" && !selectedTeam) {
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
      teamId: joinType === "team" ? selectedTeam : null,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("leagueRequests", JSON.stringify([...existingRequests, newRequest]));
    
    setIsJoinDialogOpen(false);
    setSelectedLeague(null);
    setJoinType("player");
    setSelectedTeam("");

    toast({
      title: "Request Sent",
      description: "Your request to join the league has been sent to the league owner.",
    });
  };

  const getLeagueStatus = (league: League) => {
    if (!league.schedule || league.schedule.length === 0) return null;

    const now = new Date();
    const firstSession = parseISO(`${league.schedule[0].date}T${league.schedule[0].startTime}`);
    const lastSession = parseISO(`${league.schedule[league.schedule.length - 1].date}T${league.schedule[league.schedule.length - 1].endTime}`);

    if (now > lastSession) {
      return <Badge variant="secondary">Ended</Badge>;
    } else if (now < firstSession) {
      return <Badge variant="default">Upcoming</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-500">Ongoing</Badge>;
    }
  };

  const getScheduleDescription = (league: League) => {
    if (!league.schedule || league.schedule.length === 0) return "No schedule available";

    const firstSession = parseISO(`${league.schedule[0].date}T${league.schedule[0].startTime}`);
    const lastSession = parseISO(`${league.schedule[league.schedule.length - 1].date}T${league.schedule[league.schedule.length - 1].endTime}`);
    const dayOfWeek = format(firstSession, "EEEE");
    const timeOfDay = parseInt(league.schedule[0].startTime.split(":")[0]) < 17 ? "afternoons" : "nights";
    
    const dateRange = `${format(firstSession, "MMM d, yyyy")} - ${format(lastSession, "MMM d, yyyy")}`;
    
    if (firstSession > new Date()) {
      const startingIn = format(firstSession, "'Starting' MMM d, yyyy");
      return `${dayOfWeek} ${timeOfDay}, ${startingIn}`;
    }

    return `${dayOfWeek} ${timeOfDay}, ${dateRange}`;
  };

  const filteredLeagues = leagues.filter(
    (league) =>
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.location.toLowerCase().includes(searchTerm.toLowerCase())
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
                <TableHead>Location</TableHead>
                <TableHead>Game Type</TableHead>
                <TableHead>League Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeagues.map((league) => (
                <TableRow key={league.id}>
                  <TableCell className="font-medium">{league.name}</TableCell>
                  <TableCell>{league.location}</TableCell>
                  <TableCell>{league.gameType}</TableCell>
                  <TableCell className="capitalize">{league.type}</TableCell>
                  <TableCell>{getScheduleDescription(league)}</TableCell>
                  <TableCell>{getLeagueStatus(league)}</TableCell>
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
              ))}
              {sortedLeagues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No leagues found. Try a different search term or create a new league.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join League</DialogTitle>
            <DialogDescription>
              Choose how you would like to join {selectedLeague?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label>Join as:</label>
              <Select
                value={joinType}
                onValueChange={(value: "player" | "team") => setJoinType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select join type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Individual Player</SelectItem>
                  {userTeams.length > 0 && (
                    <SelectItem value="team">Team</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {joinType === "team" && userTeams.length > 0 && (
              <div className="space-y-2">
                <label>Select Team:</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsJoinDialogOpen(false);
                  setSelectedLeague(null);
                  setJoinType("player");
                  setSelectedTeam("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRequest}
                disabled={joinType === "team" && !selectedTeam}
              >
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default LeagueFinder;
