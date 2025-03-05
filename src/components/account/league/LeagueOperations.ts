import { League, LeagueSession } from "../types/league";
import { Team } from "../types/team";
import { toast } from "@/components/ui/use-toast";

const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5001'
  : 'https://pool-league-manager-backend.onrender.com';

// Helper function to generate a numeric ID without using uuid
const generateNumericId = (): number => {
  // Generate a timestamp-based ID with some randomness
  return parseInt(
    Date.now().toString().slice(-10) + 
    Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
    10
  );
};

// Helper function to transform frontend League to backend format
const transformLeagueForBackend = (league: League) => {
  return {
    name: league.name,
    location: league.sessions[0]?.location || "Unknown",
    gameType: league.sessions[0]?.gameType || "8-ball",
    leagueType: league.sessions[0]?.type || "singles",
    schedule: "Weekly", // Default value
    status: "active",
    sessions: league.sessions.map(session => ({
      name: session.sessionName || session.name,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      teams: session.teams || [],
      matches: [],
      standings: []
    }))
  };
};

// Helper function to transform frontend LeagueSession to backend format
const transformSessionForBackend = (session: LeagueSession) => {
  return {
    name: session.sessionName || session.name,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    teams: session.teams || [],
    matches: [],
    standings: []
  };
};

export const createLeague = async (
  newLeague: League,
  leagues: League[],
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>,
  onSuccess?: () => void
): Promise<League | null> => {
  try {
    // Check if a league with the same name already exists
    const existingLeague = leagues.find(league => league.name === newLeague.name);
    if (existingLeague) {
      toast({
        title: "Error",
        description: "A league with this name already exists.",
        variant: "destructive",
      });
      return null;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Transform the league data for the backend
        const backendLeagueData = transformLeagueForBackend(newLeague);
        console.log("Sending league data to backend:", backendLeagueData);
        
        // Try to create league via API
        const response = await fetch(`${API_URL}/leagues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(backendLeagueData)
        });
        
        if (response.ok) {
          const createdLeague = await response.json();
          console.log("Backend response for created league:", createdLeague);
          
          // Transform the backend response to frontend format
          const frontendLeague: League = {
            id: typeof createdLeague._id === 'string' ? parseInt(createdLeague._id.substring(0, 8), 16) : Date.now(),
            name: createdLeague.name,
            sessions: createdLeague.sessions?.map((session: any) => ({
              id: typeof session._id === 'string' ? parseInt(session._id.substring(0, 8), 16) : Date.now(),
              parentLeagueId: typeof createdLeague._id === 'string' ? parseInt(createdLeague._id.substring(0, 8), 16) : Date.now(),
              name: session.name,
              sessionName: session.name,
              location: createdLeague.location || '',
              password: '',
              teams: session.teams || [],
              type: createdLeague.leagueType === 'team' ? 'team' : 'singles',
              gameType: createdLeague.gameType || '',
              schedule: [],
              createdBy: typeof createdLeague.createdBy === 'string' ? createdLeague.createdBy : 'unknown',
              createdAt: session.createdAt || new Date().toISOString()
            })) || [],
            password: '',
            createdBy: typeof createdLeague.createdBy === 'string' ? createdLeague.createdBy : 'unknown',
            createdAt: createdLeague.createdAt || new Date().toISOString()
          };
          
          // Update local state
          setLeagues(prevLeagues => [...prevLeagues, frontendLeague]);
          
          toast({
            title: "Success",
            description: "League created successfully!",
          });
          
          if (onSuccess) onSuccess();
          
          return frontendLeague;
        } else {
          // Fall back to localStorage if API fails
          console.warn("Failed to create league via API, falling back to localStorage");
          return createLeagueLocalStorage(newLeague, leagues, setLeagues, onSuccess);
        }
      } catch (error) {
        console.error("Error creating league via API:", error);
        return createLeagueLocalStorage(newLeague, leagues, setLeagues, onSuccess);
      }
    } else {
      // No token, use localStorage
      return createLeagueLocalStorage(newLeague, leagues, setLeagues, onSuccess);
    }
  } catch (error) {
    console.error("Error in createLeague:", error);
    toast({
      title: "Error",
      description: "Failed to create league. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

// Fallback function that uses localStorage
const createLeagueLocalStorage = (
  newLeague: League,
  leagues: League[],
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>,
  onSuccess?: () => void
): League => {
  // Generate a unique ID if not provided
  const leagueWithId: League = {
    ...newLeague,
    id: newLeague.id || generateNumericId(),
    createdAt: new Date().toISOString(),
  };

  // Update state and localStorage
  const updatedLeagues = [...leagues, leagueWithId];
  setLeagues(updatedLeagues);
  localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

  // Dispatch custom event for other components to listen to
  window.dispatchEvent(new CustomEvent("leaguesUpdated", { detail: updatedLeagues }));

  toast({
    title: "Success",
    description: "League created successfully!",
  });

  if (onSuccess) onSuccess();

  return leagueWithId;
};

export const createLeagueSession = async (
  leagueId: number,
  newSession: LeagueSession,
  leagues: League[],
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>,
  onSuccess?: () => void
): Promise<LeagueSession | null> => {
  try {
    // Find the league
    const leagueIndex = leagues.findIndex(league => league.id === leagueId);
    if (leagueIndex === -1) {
      toast({
        title: "Error",
        description: "League not found.",
        variant: "destructive",
      });
      return null;
    }

    const league = leagues[leagueIndex];

    // Check if a session with the same name already exists
    const existingSession = league.sessions?.find(session => session.name === newSession.name);
    if (existingSession) {
      toast({
        title: "Error",
        description: "A session with this name already exists in this league.",
        variant: "destructive",
      });
      return null;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Find the backend ID for this league
        // This is a bit of a hack - we're assuming the backend ID is stored in localStorage
        const allBackendLeagues = await fetch(`${API_URL}/leagues`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => res.json());
        
        const backendLeague = allBackendLeagues.find((bl: any) => 
          bl.name === league.name
        );
        
        if (!backendLeague) {
          console.warn("Could not find backend league, falling back to localStorage");
          return createLeagueSessionLocalStorage(leagueId, newSession, leagues, setLeagues, onSuccess);
        }
        
        // Transform the session data for the backend
        const backendSessionData = transformSessionForBackend(newSession);
        console.log("Sending session data to backend:", backendSessionData);
        
        // Try to create session via API
        const response = await fetch(`${API_URL}/leagues/${backendLeague._id}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(backendSessionData)
        });
        
        if (response.ok) {
          const createdSession = await response.json();
          console.log("Backend response for created session:", createdSession);
          
          // Transform the backend response to frontend format
          const frontendSession: LeagueSession = {
            id: typeof createdSession._id === 'string' ? parseInt(createdSession._id.substring(0, 8), 16) : Date.now(),
            parentLeagueId: leagueId,
            name: createdSession.name,
            sessionName: createdSession.name,
            location: league.sessions[0]?.location || '',
            password: '',
            teams: createdSession.teams || [],
            type: league.sessions[0]?.type || 'singles',
            gameType: league.sessions[0]?.gameType || '8-ball',
            schedule: [],
            createdBy: league.createdBy,
            createdAt: createdSession.createdAt || new Date().toISOString()
          };
          
          // Update local state
          const updatedLeagues = [...leagues];
          if (!updatedLeagues[leagueIndex].sessions) {
            updatedLeagues[leagueIndex].sessions = [];
          }
          updatedLeagues[leagueIndex].sessions.push(frontendSession);
          setLeagues(updatedLeagues);
          
          toast({
            title: "Success",
            description: "Session created successfully!",
          });
          
          if (onSuccess) onSuccess();
          
          return frontendSession;
        } else {
          // Fall back to localStorage if API fails
          console.warn("Failed to create session via API, falling back to localStorage");
          return createLeagueSessionLocalStorage(leagueId, newSession, leagues, setLeagues, onSuccess);
        }
      } catch (error) {
        console.error("Error creating session via API:", error);
        return createLeagueSessionLocalStorage(leagueId, newSession, leagues, setLeagues, onSuccess);
      }
    } else {
      // No token, use localStorage
      return createLeagueSessionLocalStorage(leagueId, newSession, leagues, setLeagues, onSuccess);
    }
  } catch (error) {
    console.error("Error in createLeagueSession:", error);
    toast({
      title: "Error",
      description: "Failed to create session. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

// Fallback function that uses localStorage
const createLeagueSessionLocalStorage = (
  leagueId: number,
  newSession: LeagueSession,
  leagues: League[],
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>,
  onSuccess?: () => void
): LeagueSession => {
  // Generate a unique ID if not provided
  const sessionWithId: LeagueSession = {
    ...newSession,
    id: newSession.id || generateNumericId(),
    parentLeagueId: leagueId,
    createdAt: new Date().toISOString(),
  };

  // Update the league with the new session
  const updatedLeagues = leagues.map(league => {
    if (league.id === leagueId) {
      return {
        ...league,
        sessions: [...(league.sessions || []), sessionWithId],
      };
    }
    return league;
  });

  // Update state and localStorage
  setLeagues(updatedLeagues);
  localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

  // Dispatch custom event for other components to listen to
  window.dispatchEvent(new CustomEvent("leaguesUpdated", { detail: updatedLeagues }));

  toast({
    title: "Success",
    description: "Session created successfully!",
  });

  if (onSuccess) onSuccess();

  return sessionWithId;
};

export const deleteLeague = (
  selectedLeague: League,
  password: string,
  leagues: League[],
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>
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
    
    // Update state without triggering navigation
    setLeagues(leagues.filter(league => league.id !== selectedLeague.id));
    
    // Delay the event dispatch to prevent UI freezing
    setTimeout(() => {
      window.dispatchEvent(new Event('leagueUpdate'));
      
      toast({
        title: "Success",
        description: "League deleted successfully!",
      });
    }, 50);
    
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
