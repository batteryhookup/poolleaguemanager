
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Trash2, Edit, UserCheck, UserX } from "lucide-react";
import { League, Team } from "../types/league";
import { EditLeagueDialog } from "./EditLeagueDialog";
import { useToast } from "@/hooks/use-toast";

interface LeagueListProps {
  leagues: League[];
  onDeleteLeague: (league: League) => void;
  onAddTeam: (league: League) => void;
  onDeleteTeam: (league: League, team: Team) => void;
  onUpdateLeague: (updatedLeague: League) => void;
}

interface LeagueRequest {
  id: number;
  leagueId: number;
  requestType: "player" | "team";
  username: string;
  teamId: string | null;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
}

export function LeagueList({ 
  leagues,
  onDeleteLeague,
  onAddTeam,
  onDeleteTeam,
  onUpdateLeague
}: LeagueListProps) {
  const [expandedLeagues, setExpandedLeagues] = useState<number[]>([]);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const { toast } = useToast();

  const toggleLeagueExpansion = (leagueId: number) => {
    setExpandedLeagues(prev => 
      prev.includes(leagueId) 
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const handleRequestAction = (request: LeagueRequest, action: "accept" | "reject") => {
    const allRequests = JSON.parse(localStorage.getItem("leagueRequests") || "[]");
    const updatedRequests = allRequests.map((req: LeagueRequest) =>
      req.id === request.id ? { ...req, status: action === "accept" ? "accepted" : "rejected" } : req
    );
    
    if (action === "accept") {
      const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      const updatedLeagues = [...leagues];
      const leagueIndex = updatedLeagues.findIndex(l => l.id === request.leagueId);
      
      if (leagueIndex !== -1) {
        if (request.requestType === "team") {
          const team = allTeams.find((t: Team) => t.id.toString() === request.teamId);
          if (team) {
            const leagueTeams = updatedLeagues[leagueIndex].teams || [];
            updatedLeagues[leagueIndex] = {
              ...updatedLeagues[leagueIndex],
              teams: [...leagueTeams, team]
            };
          }
        } else {
          // Handle individual player join logic if needed
          // This would depend on how you want to track individual players
        }
        
        localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
        onUpdateLeague(updatedLeagues[leagueIndex]);
      }
    }
    
    localStorage.setItem("leagueRequests", JSON.stringify(updatedRequests));
    
    toast({
      title: action === "accept" ? "Request Accepted" : "Request Rejected",
      description: `The join request has been ${action === "accept" ? "accepted" : "rejected"}.`,
    });
  };

  const getPendingRequests = (leagueId: number): LeagueRequest[] => {
    const allRequests = JSON.parse(localStorage.getItem("leagueRequests") || "[]");
    return allRequests.filter((req: LeagueRequest) => 
      req.leagueId === leagueId && req.status === "pending"
    );
  };

  const getTeamName = (teamId: string): string => {
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const team = allTeams.find((t: Team) => t.id.toString() === teamId);
    return team ? team.name : "Unknown Team";
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leagues.map((league) => (
          <Card key={league.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{league.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{league.location}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onAddTeam(league)}
                >
                  Add Teams
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingLeague(league)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteLeague(league)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pending Requests Section */}
                {getPendingRequests(league.id).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Pending Requests</h3>
                    <div className="space-y-2">
                      {getPendingRequests(league.id).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 bg-accent rounded-md">
                          <div>
                            <p className="text-sm font-medium">
                              {request.requestType === "team" 
                                ? `Team: ${getTeamName(request.teamId!)}`
                                : `Player: ${request.username}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRequestAction(request, "accept")}
                            >
                              <UserCheck className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRequestAction(request, "reject")}
                            >
                              <UserX className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teams Section */}
                {league.teams && league.teams.length > 0 && (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full flex justify-between"
                      onClick={() => toggleLeagueExpansion(league.id)}
                    >
                      Teams
                      {expandedLeagues.includes(league.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    {expandedLeagues.includes(league.id) && (
                      <ul className="space-y-2 pl-4">
                        {league.teams.map(team => (
                          <li 
                            key={team.id} 
                            className="text-sm group flex items-center justify-between p-2 hover:bg-accent rounded-md"
                          >
                            {team.name}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTeam(league, team);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditLeagueDialog
        league={editingLeague}
        isOpen={editingLeague !== null}
        onClose={() => setEditingLeague(null)}
        onSave={onUpdateLeague}
      />
    </>
  );
}

