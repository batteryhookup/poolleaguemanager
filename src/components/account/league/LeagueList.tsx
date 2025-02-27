
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Trash2, Edit } from "lucide-react";
import { League, Team } from "../types/league";
import { EditLeagueDialog } from "./EditLeagueDialog";

interface LeagueListProps {
  leagues: League[];
  onDeleteLeague: (league: League) => void;
  onAddTeam: (league: League) => void;
  onDeleteTeam: (league: League, team: Team) => void;
  onUpdateLeague: (updatedLeague: League) => void;
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

  const toggleLeagueExpansion = (leagueId: number) => {
    setExpandedLeagues(prev => 
      prev.includes(leagueId) 
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
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
            {league.teams && league.teams.length > 0 && (
              <CardContent>
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
              </CardContent>
            )}
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

