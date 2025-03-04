import { Team } from "./team";

export interface LeagueSchedule {
  date: string;
  startTime: string;
  endTime: string;
}

export interface LeagueBase {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface LeagueSession extends LeagueBase {
  parentLeagueId: number;
  sessionName: string;
  location: string;
  password: string;
  teams: Team[];
  type: 'team' | 'singles';
  maxPlayersPerTeam?: number;
  playersPerNight?: number;
  gameType: string;
  schedule: LeagueSchedule[];
}

export interface League extends LeagueBase {
  sessions: LeagueSession[];
  password: string;  // League-level password for deleting the entire league
}

export interface LeagueManagementProps {
  leagues: League[];
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>;
}

export interface EditLeagueDialogProps {
  league: League | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedLeague: League) => void;
}
