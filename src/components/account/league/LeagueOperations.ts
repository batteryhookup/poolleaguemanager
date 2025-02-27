
import { League } from "../types/league";
import { Team } from "../types/team";
import { toast } from "@/hooks/use-toast";

export const createLeague = (newLeague: League, leagues: League[], setLeagues: (leagues: League[]) => void) => {
  const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
  const updatedLeagues = [...existingLeagues, newLeague];
  localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
  setLeagues([...leagues, newLeague]);
};

export const deleteLeague = (
  selectedLeague: League,
  password: string,
  leagues: League[],
  setLeagues: (leagues: League[]) => void
): boolean => {
  if (password !== selectedLeague.password) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Incorrect league password.",
    });
    return false;
  }

  try {
    const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = existingLeagues.filter((league: League) => league.id !== selectedLeague.id);
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
    setLeagues(leagues.filter(league => league.id !== selectedLeague.id));
    
    // Dispatch the leagueUpdate event
    window.dispatchEvent(new Event('leagueUpdate'));
    
    toast({
      title: "Success",
      description: "League deleted successfully!",
    });
    return true;
  } catch (error) {
    console.error("Error deleting league:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to delete league. Please try again.",
    });
    return false;
  }
};

export const addTeam = (
  selectedLeague: League,
  teamName: string,
  leagues: League[],
  setLeagues: (leagues: League[]) => void
): boolean => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return false;

  const userData = JSON.parse(currentUser);
  
  const newTeam: Team = {
    id: Date.now(),
    name: teamName,
    password: selectedLeague.password,
    createdAt: new Date().toISOString(),
    createdBy: userData.username,
    members: [userData.username]
  };

  try {
    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = allLeagues.map((league: League) => 
      league.id === selectedLeague.id
        ? {
            ...league,
            teams: [...(league.teams || []), newTeam]
          }
        : league
    );

    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    const updatedLeague = {
      ...selectedLeague,
      teams: [...(selectedLeague.teams || []), newTeam]
    };

    setLeagues(leagues.map(league =>
      league.id === updatedLeague.id ? updatedLeague : league
    ));

    // Dispatch the leagueUpdate event
    window.dispatchEvent(new Event('leagueUpdate'));

    toast({
      title: "Success",
      description: "Team added successfully!",
    });
    return true;
  } catch (error) {
    console.error("Error adding team:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to add team. Please try again.",
    });
    return false;
  }
};

export const deleteTeam = (
  selectedLeague: League,
  selectedTeam: Team,
  password: string,
  leagues: League[],
  setLeagues: (leagues: League[]) => void
): boolean => {
  if (password !== selectedLeague.password) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Incorrect league password.",
    });
    return false;
  }

  try {
    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = allLeagues.map((league: League) => 
      league.id === selectedLeague.id
        ? {
            ...league,
            teams: league.teams.filter(team => team.id !== selectedTeam.id)
          }
        : league
    );

    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    const updatedLeague = {
      ...selectedLeague,
      teams: selectedLeague.teams.filter(team => team.id !== selectedTeam.id)
    };

    setLeagues(leagues.map(league =>
      league.id === updatedLeague.id ? updatedLeague : league
    ));

    // Dispatch the leagueUpdate event
    window.dispatchEvent(new Event('leagueUpdate'));

    toast({
      title: "Success",
      description: "Team deleted successfully!",
    });
    return true;
  } catch (error) {
    console.error("Error deleting team:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to delete team. Please try again.",
    });
    return false;
  }
};

export const updateLeague = (
  updatedLeague: League,
  leagues: League[],
  setLeagues: (leagues: League[]) => void
) => {
  const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
  const updatedLeagues = existingLeagues.map((league: League) =>
    league.id === updatedLeague.id ? updatedLeague : league
  );
  localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
  setLeagues(leagues.map(league =>
    league.id === updatedLeague.id ? updatedLeague : league
  ));
  
  // Dispatch the leagueUpdate event
  window.dispatchEvent(new Event('leagueUpdate'));
};
