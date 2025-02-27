
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Team } from "../types/league";

interface LeagueTeamRowProps {
  team: Team;
  onDeleteTeam: () => void;
}

export function LeagueTeamRow({ team, onDeleteTeam }: LeagueTeamRowProps) {
  return (
    <li className="text-sm group flex items-center justify-between p-2 hover:bg-accent rounded-md">
      {team.name}
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteTeam();
        }}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </li>
  );
}
