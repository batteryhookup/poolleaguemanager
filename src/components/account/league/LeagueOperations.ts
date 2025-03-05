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
  console.log("Transforming league for backend:", league);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  
  // Ensure we have valid session data
  const validSessions = league.sessions.map(session => {
    // Create a default schedule if none exists
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDate = new Date();
    const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
    
    return {
      name: session.sessionName || session.name,
      startDate: startDate,
      endDate: endDate,
      teams: Array.isArray(session.teams) ? session.teams : [],
      matches: [],
      standings: []
    };
  });
  
  return {
    name: league.name,
    location: league.sessions[0]?.location || "Unknown",
    gameType: league.sessions[0]?.gameType || "8-ball",
    leagueType: league.sessions[0]?.type || "singles",
    schedule: "Weekly", // Default value
    status: "active",
    sessions: validSessions,
    // Include the user ID for the backend
    createdBy: currentUser.id || null
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
              createdBy: JSON.parse(localStorage.getItem("currentUser") || "{}").username || "unknown",
              createdAt: session.createdAt || new Date().toISOString()
            })) || [],
            password: '',
            createdBy: JSON.parse(localStorage.getItem("currentUser") || "{}").username || "unknown",
            createdAt: createdLeague.createdAt || new Date().toISOString()
          };
          
          // Update local state
          setLeagues(prevLeagues => [...prevLeagues, frontendLeague]);
          
          // IMPORTANT: Also update localStorage with the new league
          const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
          const updatedLeagues = [...existingLeagues, frontendLeague];
          localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
          
          // Dispatch custom event for other components to listen to
          window.dispatchEvent(new CustomEvent("leaguesUpdated", { detail: updatedLeagues }));
          
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
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const currentUsername = currentUser.username || "unknown";
  
  // Ensure createdBy is set to the current username
  const leagueWithCorrectCreator = {
    ...newLeague,
    createdBy: currentUsername,
    sessions: newLeague.sessions.map(session => ({
      ...session,
      createdBy: currentUsername
    }))
  };
  
  // Generate a unique ID if not provided
  const leagueWithId: League = {
    ...leagueWithCorrectCreator,
    id: newLeague.id || generateNumericId(),
    createdAt: new Date().toISOString(),
  };
  
  console.log("Creating league in localStorage:", leagueWithId);

  // Update state and localStorage
  const updatedLeagues = [...leagues, leagueWithId];
  setLeagues(updatedLeagues);
  localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
  console.log("Updated localStorage with new league. Total leagues:", updatedLeagues.length);

  // Dispatch custom event for other components to listen to
  window.dispatchEvent(new CustomEvent("leaguesUpdated", { detail: updatedLeagues }));
  console.log("Dispatched leaguesUpdated event");

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
    // Find the parent league
    const parentLeague = leagues.find(league => league.id === leagueId);
    if (!parentLeague) {
      toast({
        title: "Error",
        description: "Parent league not found.",
        variant: "destructive",
      });
      return null;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Find the backend ID for this league
        const allBackendLeagues = await fetch(`${API_URL}/leagues`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => res.json());
        
        const backendLeague = allBackendLeagues.find((bl: any) => 
          bl.name === parentLeague.name
        );
        
        if (!backendLeague) {
          console.warn("Could not find backend league, falling back to localStorage");
          return createLeagueSessionLocalStorage(leagueId, newSession, leagues, setLeagues, onSuccess);
        }
        
        // Transform the session data for the backend
        const backendSessionData = transformSessionForBackend(newSession);
        
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
          
          // Transform the backend response to frontend format
          const frontendSession: LeagueSession = {
            id: typeof createdSession._id === 'string' ? parseInt(createdSession._id.substring(0, 8), 16) : Date.now(),
            parentLeagueId: leagueId,
            name: createdSession.name,
            sessionName: createdSession.name,
            location: parentLeague.sessions[0]?.location || '',
            password: '',
            teams: createdSession.teams || [],
            type: parentLeague.sessions[0]?.type || 'singles',
            gameType: parentLeague.sessions[0]?.gameType || '',
            schedule: [],
            createdBy: JSON.parse(localStorage.getItem("currentUser") || "{}").username || "unknown",
            createdAt: createdSession.createdAt || new Date().toISOString()
          };
          
          // Update local state
          const updatedLeagues = leagues.map(league => {
            if (league.id === leagueId) {
              return {
                ...league,
                sessions: [...league.sessions, frontendSession]
              };
            }
            return league;
          });
          
          setLeagues(updatedLeagues);
          
          // IMPORTANT: Also update localStorage with the new session
          localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
          console.log("Updated localStorage with new session. Total leagues:", updatedLeagues.length);
          
          // Dispatch custom event for other components to listen to
          window.dispatchEvent(new CustomEvent("leaguesUpdated", { detail: updatedLeagues }));
          console.log("Dispatched leaguesUpdated event with updated leagues");
          
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
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const currentUsername = currentUser.username || "unknown";
  
  // Ensure createdBy is set to the current username
  const sessionWithCreator = {
    ...newSession,
    createdBy: currentUsername,
    parentLeagueId: leagueId
  };
  
  // Generate a unique ID if not provided
  const sessionWithId: LeagueSession = {
    ...sessionWithCreator,
    id: newSession.id || generateNumericId(),
    createdAt: new Date().toISOString(),
  };
  
  console.log("Creating session in localStorage:", sessionWithId);

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
  console.log("Updated localStorage with new session. Total leagues:", updatedLeagues.length);

  // Dispatch custom event for other components to listen to
  window.dispatchEvent(new CustomEvent("leaguesUpdated", { detail: updatedLeagues }));
  console.log("Dispatched leaguesUpdated event with updated leagues");

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

export const deleteSession = async (
  session: LeagueSession,
  password: string,
  leagues: League[],
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>
): Promise<boolean> => {
  console.log("Deleting session:", session);
  console.log("Available leagues:", leagues);
  
  // Check if the password matches
  if (session.password !== password) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Incorrect session password.",
    });
    return false;
  }

  try {
    // Find the parent league - try multiple methods to find it
    let parentLeague = leagues.find(league => league.id === session.parentLeagueId);
    
    // If not found by ID, try to find by checking if the session is in the league's sessions array
    if (!parentLeague) {
      parentLeague = leagues.find(league => 
        league.sessions.some(s => s.id === session.id)
      );
    }
    
    if (!parentLeague) {
      console.error("Parent league not found for session:", session);
      console.log("Available leagues:", leagues.map(l => ({ id: l.id, name: l.name, sessions: l.sessions.map(s => s.id) })));
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Parent league not found. Please refresh and try again.",
      });
      return false;
    }

    console.log("Found parent league:", parentLeague.name);

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Find the backend ID for this league and session
        const allBackendLeagues = await fetch(`${API_URL}/leagues`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => res.json());
        
        const backendLeague = allBackendLeagues.find((bl: any) => 
          bl.name === parentLeague.name
        );
        
        if (!backendLeague) {
          console.warn("Could not find backend league, falling back to localStorage");
          return deleteSessionLocalStorage(session, leagues, setLeagues, parentLeague);
        }
        
        // Find the session in the backend league
        const backendSession = backendLeague.sessions.find((s: any) => 
          s.name === session.name || s.name === session.sessionName
        );
        
        if (!backendSession) {
          console.warn("Could not find backend session, falling back to localStorage");
          return deleteSessionLocalStorage(session, leagues, setLeagues, parentLeague);
        }
        
        // Try to delete session via API
        const response = await fetch(`${API_URL}/leagues/${backendLeague._id}/sessions/${backendSession._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          console.log("Session deleted via API");
          
          // Update local state
          const updatedLeagues = leagues.map(league => {
            if (league.id === parentLeague.id) {
              return {
                ...league,
                sessions: league.sessions.filter(s => s.id !== session.id)
              };
            }
            return league;
          });
          
          setLeagues(updatedLeagues);
          localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
          
          toast({
            title: "Success",
            description: "Session deleted successfully!",
          });
          
          window.dispatchEvent(new Event('leagueUpdate'));
          return true;
        } else {
          // Fall back to localStorage if API fails
          console.warn("Failed to delete session via API, falling back to localStorage");
          return deleteSessionLocalStorage(session, leagues, setLeagues, parentLeague);
        }
      } catch (error) {
        console.error("Error deleting session via API:", error);
        return deleteSessionLocalStorage(session, leagues, setLeagues, parentLeague);
      }
    } else {
      // No token, use localStorage
      return deleteSessionLocalStorage(session, leagues, setLeagues, parentLeague);
    }
  } catch (error) {
    console.error("Error in deleteSession:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to delete session. Please try again.",
    });
    return false;
  }
};

// Fallback function that uses localStorage
const deleteSessionLocalStorage = (
  session: LeagueSession,
  leagues: League[],
  setLeagues: React.Dispatch<React.SetStateAction<League[]>>,
  parentLeague?: League
): boolean => {
  try {
    // Find the parent league if not provided
    if (!parentLeague) {
      parentLeague = leagues.find(league => league.id === session.parentLeagueId);
      
      // If still not found, try to find by checking if the session is in the league's sessions array
      if (!parentLeague) {
        parentLeague = leagues.find(league => 
          league.sessions.some(s => s.id === session.id)
        );
      }
      
      if (!parentLeague) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Parent league not found.",
        });
        return false;
      }
    }

    // Update the league with the session removed
    const updatedLeagues = leagues.map(league => {
      if (league.id === parentLeague.id) {
        return {
          ...league,
          sessions: league.sessions.filter(s => s.id !== session.id)
        };
      }
      return league;
    });

    // Update state and localStorage
    setLeagues(updatedLeagues);
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new Event('leagueUpdate'));

    toast({
      title: "Success",
      description: "Session deleted successfully!",
    });

    return true;
  } catch (error) {
    console.error("Error deleting session:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to delete session. Please try again.",
    });
    return false;
  }
};
