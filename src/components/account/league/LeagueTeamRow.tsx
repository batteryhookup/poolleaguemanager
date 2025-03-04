import { Button } from "@/components/ui/button";
import { Team } from "../types/team";
import { Trash2 } from "lucide-react";

interface LeagueTeamRowProps {
  team: Team;
  onDelete: () => void;
}

export function LeagueTeamRow({ team, onDelete }: LeagueTeamRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div>
        <p className="font-medium">{team.name}</p>
        <p className="text-sm text-muted-foreground">
          Members: {team.members.join(", ")}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
