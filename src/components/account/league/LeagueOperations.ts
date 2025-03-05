import { League, LeagueSession } from "../types/league";
import { Team } from "../types/team";
import { toast } from "@/hooks/use-toast";

export const createLeague = (newLeague: League, leagues: League[], setLeagues: (leagues: League[]) => void, showToast: boolean = true) => {
  const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
  
  // Check if a league with this ID already exists
  const existingLeagueIndex = existingLeagues.findIndex((league: League) => league.id === newLeague.id);
  
  let updatedLeagues;
  if (existingLeagueIndex >= 0) {
    console.log(`League with ID ${newLeague.id} already exists, updating it`);
    // Update the existing league
    updatedLeagues = [...existingLeagues];
    updatedLeagues[existingLeagueIndex] = newLeague;
  } else {
    // Add the new league
    updatedLeagues = [...existingLeagues, newLeague];
  }
  
  localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
  
  // Update the state
  if (existingLeagueIndex >= 0) {
    setLeagues(leagues.map(league => league.id === newLeague.id ? newLeague : league));
  } else {
    setLeagues([...leagues, newLeague]);
  }
  
  window.dispatchEvent(new Event('leagueUpdate'));
  
  if (showToast) {
    toast({
      title: "Success",
      description: existingLeagueIndex >= 0 ? "League updated successfully!" : "League created successfully!",
    });
  }
  return true;
};

export const createLeagueSession = (newSession: LeagueSession, leagues: League[], setLeagues: (leagues: League[]) => void) => {
  const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
  const parentLeague = existingLeagues.find((league: League) => league.id === newSession.parentLeagueId);
  
  if (!parentLeague) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Parent league not found.",
    });
    return false;
  }

  // Check if a session with this ID already exists in the parent league
  const existingSessionIndex = parentLeague.sessions.findIndex(
    (session: LeagueSession) => session.id === newSession.id
  );

  let updatedLeague;
  if (existingSessionIndex >= 0) {
    console.log(`Session with ID ${newSession.id} already exists in league ${parentLeague.name}, updating it`);
    // Update the existing session
    const updatedSessions = [...parentLeague.sessions];
    updatedSessions[existingSessionIndex] = newSession;
    updatedLeague = {
      ...parentLeague,
      sessions: updatedSessions
    };
  } else {
    // Add the new session
    updatedLeague = {
      ...parentLeague,
      sessions: [...parentLeague.sessions, newSession]
    };
  }

  // Update the leagues array
  const updatedLeagues = existingLeagues.map((league: League) =>
    league.id === parentLeague.id ? updatedLeague : league
  );

  localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
  setLeagues(leagues.map(league => league.id === parentLeague.id ? updatedLeague : league));
  window.dispatchEvent(new Event('leagueUpdate'));

  toast({
    title: "Success",
    description: existingSessionIndex >= 0 ? "League session updated successfully!" : "League session created successfully!",
  });
  return true;
};

export const deleteLeague = (
  selectedLeague: League,
  password: string,
  leagues: League[],
  setLeagues: (leagues: League[]) => void
): boolean => {
  // Check if any session matches the password
  if (!selectedLeague.sessions || !selectedLeague.sessions.some(session => session.password === password)) {
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
  selectedSession: LeagueSession,
  teamName: string,
  leagues: League[],
  setLeagues: (leagues: League[]) => void
): boolean => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return false;

  const userData = JSON.parse(currentUser);
  
  const newTeam: Team = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: teamName,
    password: selectedSession.password,
    createdAt: new Date().toISOString(),
    createdBy: userData.username,
    members: [userData.username]
  };

  try {
    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const parentLeague = allLeagues.find((league: League) => league.id === selectedSession.parentLeagueId);
    
    if (!parentLeague) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Parent league not found.",
      });
      return false;
    }

    // Update the session within the parent league
    const updatedLeague = {
      ...parentLeague,
      sessions: parentLeague.sessions.map(session =>
        session.id === selectedSession.id
          ? { ...session, teams: [...session.teams, newTeam] }
          : session
      )
    };

    // Update all leagues
    const updatedLeagues = allLeagues.map((league: League) =>
      league.id === updatedLeague.id ? updatedLeague : league
    );

    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
    setLeagues(leagues.map(league =>
      league.id === updatedLeague.id ? updatedLeague : league
    ));

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
  selectedSession: LeagueSession,
  selectedTeam: Team,
  password: string,
  leagues: League[],
  setLeagues: (leagues: League[]) => void
): boolean => {
  if (password !== selectedSession.password) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Incorrect league password.",
    });
    return false;
  }

  try {
    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const parentLeague = allLeagues.find((league: League) => league.id === selectedSession.parentLeagueId);
    
    if (!parentLeague) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Parent league not found.",
      });
      return false;
    }

    // Update the session within the parent league
    const updatedLeague = {
      ...parentLeague,
      sessions: parentLeague.sessions.map(session =>
        session.id === selectedSession.id
          ? { ...session, teams: session.teams.filter(team => team.id !== selectedTeam.id) }
          : session
      )
    };

    // Update all leagues
    const updatedLeagues = allLeagues.map((league: League) =>
      league.id === updatedLeague.id ? updatedLeague : league
    );

    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
    setLeagues(leagues.map(league =>
      league.id === updatedLeague.id ? updatedLeague : league
    ));

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
  
  window.dispatchEvent(new Event('leagueUpdate'));
};
