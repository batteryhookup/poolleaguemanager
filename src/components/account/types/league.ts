
export interface Team {
  id: number;
  name: string;
}

export interface League {
  id: number;
  name: string;
  location: string;
  createdAt: string;
  createdBy: string;
  password: string;
  teams: Team[];
}

export interface LeagueManagementProps {
  leagues: League[];
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>;
}
