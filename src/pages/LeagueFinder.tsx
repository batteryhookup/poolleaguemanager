
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
import { format, parseISO, isFuture, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";

const LeagueFinder = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    setLeagues(storedLeagues);
  }, []);

  const getLeagueStatus = (sessions: League["schedule"]) => {
    if (!sessions || sessions.length === 0) return null;

    const firstSession = parseISO(sessions[0].date);
    const lastSession = parseISO(sessions[sessions.length - 1].date);
    const now = new Date();

    if (isPast(lastSession)) {
      return <Badge variant="secondary">Ended</Badge>;
    } else if (isFuture(firstSession)) {
      return <Badge variant="default">Upcoming</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-500">Ongoing</Badge>;
    }
  };

  const getScheduleDescription = (league: League) => {
    if (!league.schedule || league.schedule.length === 0) return "No schedule available";

    const firstSession = parseISO(league.schedule[0].date);
    const lastSession = parseISO(league.schedule[league.schedule.length - 1].date);
    const dayOfWeek = format(firstSession, "EEEE");
    const timeOfDay = parseInt(league.schedule[0].startTime.split(":")[0]) < 17 ? "afternoons" : "nights";
    
    const dateRange = `${format(firstSession, "MMM d, yyyy")} - ${format(lastSession, "MMM d, yyyy")}`;
    
    if (isFuture(firstSession)) {
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
                  <TableCell>{getLeagueStatus(league.schedule)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
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
    </Layout>
  );
};

export default LeagueFinder;
