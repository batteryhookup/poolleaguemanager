
export interface Team {
  id: number;
  name: string;
}

export interface LeagueSession {
  date: string;
  startTime: string;
  endTime: string;
}

export interface League {
  id: number;
  name: string;
  location: string;
  createdAt: string;
  createdBy: string;
  password: string;
  teams: Team[];
  type: 'team' | 'singles';
  maxPlayersPerTeam?: number;
  playersPerNight?: number;
  gameType: string;
  schedule: LeagueSession[];
}

export interface LeagueManagementProps {
  leagues: League[];
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>;
}

export interface EditLeagueDialogProps {
  league: League | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLeague: League) => void;
}
