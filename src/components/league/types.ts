
import { League } from "../account/types/league";
import { Team } from "../account/types/team";

export interface JoinLeagueDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeague: League | null;
  userTeams: Team[];
  onJoinRequest: (joinType: "player" | "team", teamId?: string) => void;
}

export interface LeagueStatusBadgeProps {
  league: League;
}

export interface LeagueScheduleDisplayProps {
  league: League;
}
