import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeagueSession, League } from "../types/league";
import { Team } from "../types/team";
import { LeagueTeamRow } from "./LeagueTeamRow";
import { LeagueStatusBadge } from "@/components/league/LeagueStatusBadge";
import { LeagueScheduleDisplay } from "@/components/league/LeagueScheduleDisplay";
import { Edit, Plus, Trash } from "lucide-react";

interface LeagueListProps {
  leagues: League[];
  onDeleteLeague: (league: League) => void;
  onEditLeague: (league: League) => void;
  onDeleteSession: (session: LeagueSession) => void;
  onAddTeam: (session: LeagueSession) => void;
  onDeleteTeam: (session: LeagueSession, team: Team) => void;
  onEditSession: (session: LeagueSession) => void;
}

export function LeagueList({
  leagues,
  onDeleteLeague,
  onEditLeague,
  onDeleteSession,
  onAddTeam,
  onDeleteTeam,
  onEditSession,
}: LeagueListProps) {
  return (
    <div className="space-y-4">
      {leagues.map((league) => (
        <Card key={league.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {league.sessions.map((session) => (
                <div key={session.id} className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{session.sessionName}</h3>
                      <div className="text-sm text-muted-foreground">
                        {session.location} • {session.gameType}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LeagueStatusBadge session={session} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditSession(session)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteSession(session)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddTeam(session)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <LeagueScheduleDisplay session={session} />
                  <div className="space-y-2">
                    {session.teams.map((team) => (
                      <LeagueTeamRow
                        key={team.id}
                        team={team}
                        onDelete={() => onDeleteTeam(session, team)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
