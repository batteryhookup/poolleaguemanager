
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Team } from "../types/team";

interface TeamListProps {
  teams: Team[];
  onDeleteTeam: (team: Team) => void;
}

export function TeamList({ teams, onDeleteTeam }: TeamListProps) {
  if (teams.length === 0) {
    return (
      <p className="text-muted-foreground">
        You haven't created any teams yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card key={team.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Members: {team.members.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteTeam(team)}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
