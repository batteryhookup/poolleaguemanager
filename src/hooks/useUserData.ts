import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { League, LeagueSession } from "@/components/account/types/league";
import { Team } from "@/components/account/types/team";
import { isAfter } from "date-fns";

export const categorizeLeague = (league: League): "archived" | "upcoming" | "active" => {
  // Get current date and set to midnight to avoid timezone issues
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Debug logging
  console.log('=== League Categorization Debug ===');
  console.log(`League: ${league.name}`);
  console.log('Current date:', now.toISOString());
  console.log('================================');

  // Categorize each session
  const categorizedSessions = league.sessions.map(session => {
    if (!session.schedule || session.schedule.length === 0) return null;
    
    const firstDate = new Date(session.schedule[0].date);
    const lastDate = new Date(session.schedule[session.schedule.length - 1].date);
    firstDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    console.log(`Session: ${session.sessionName}`);
    console.log('First date:', firstDate.toISOString());
    console.log('Last date:', lastDate.toISOString());

    // If the first date is in the future, it's upcoming
    if (firstDate > now) {
      console.log('Session is upcoming');
      return "upcoming";
    }
    
    // If the last date is in the past, it's archived
    if (lastDate < now) {
      console.log('Session is archived');
      return "archived";
    }
    
    // If we're between first and last date, it's active
    console.log('Session is active');
    return "active";
  }).filter(Boolean);

  // If any session is upcoming, the league is upcoming
  if (categorizedSessions.some(cat => cat === "upcoming")) {
    return "upcoming";
  }
  
  // If all sessions are archived, the league is archived
  if (categorizedSessions.every(cat => cat === "archived")) {
    return "archived";
  }
  
  // If there's at least one active session, the league is active
  if (categorizedSessions.some(cat => cat === "active")) {
    return "active";
  }

  // Default to archived if no sessions
  return "archived";
};

export const useUserData = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [upcomingLeagues, setUpcomingLeagues] = useState<League[]>([]);
  const [archivedLeagues, setArchivedLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateLeagueLists = () => {
    // Get leagues from localStorage
    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]") as League[];
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    console.log("All leagues from localStorage:", allLeagues.map(l => ({ id: l.id, name: l.name })));

    // Ensure no duplicate leagues by using a Map with league ID as key
    const uniqueLeaguesMap = new Map<number, League>();
    allLeagues.forEach(league => {
      if (uniqueLeaguesMap.has(league.id)) {
        // If we already have this league, merge its sessions
        const existingLeague = uniqueLeaguesMap.get(league.id)!;
        
        // Merge sessions, avoiding duplicates
        const sessionMap = new Map<number, LeagueSession>();
        [...existingLeague.sessions, ...league.sessions].forEach(session => {
          sessionMap.set(session.id, session);
        });
        
        existingLeague.sessions = Array.from(sessionMap.values());
        uniqueLeaguesMap.set(league.id, existingLeague);
      } else {
        uniqueLeaguesMap.set(league.id, { ...league });
      }
    });
    
    const uniqueLeagues = Array.from(uniqueLeaguesMap.values());
    
    // If we found and removed duplicates, update localStorage
    if (uniqueLeagues.length < allLeagues.length) {
      console.warn(`Found and merged ${allLeagues.length - uniqueLeagues.length} duplicate leagues`);
      localStorage.setItem("leagues", JSON.stringify(uniqueLeagues));
    }

    // Filter leagues where the user is either the creator or a member of any team
    const userLeagues = uniqueLeagues.filter(league => {
      const isCreator = league.createdBy === currentUser.username;
      const isMember = league.sessions.some(session =>
        session.teams.some(team =>
          team.members.includes(currentUser.username)
        )
      );
      return isCreator || isMember;
    });

    // Categorize sessions within each league
    type CategorizedLeagues = {
      active: League[];
      upcoming: League[];
      archived: League[];
    };
    
    const categorizedLeagues = userLeagues.reduce<CategorizedLeagues>(
      (acc, league: League) => {
        // Create copies of the league for each category
        const activeLeague = { ...league, sessions: [] };
        const upcomingLeague = { ...league, sessions: [] };
        const archivedLeague = { ...league, sessions: [] };

        // Categorize each session
        league.sessions.forEach(session => {
          if (!session.schedule || session.schedule.length === 0) return;

          const firstDate = new Date(session.schedule[0].date);
          const lastDate = new Date(session.schedule[session.schedule.length - 1].date);
          firstDate.setHours(0, 0, 0, 0);
          lastDate.setHours(0, 0, 0, 0);
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          if (firstDate > now) {
            upcomingLeague.sessions.push(session);
          } else if (lastDate < now) {
            archivedLeague.sessions.push(session);
          } else {
            activeLeague.sessions.push(session);
          }
        });

        // Only add leagues to categories if they have sessions
        if (activeLeague.sessions.length > 0) {
          acc.active.push(activeLeague);
        }
        if (upcomingLeague.sessions.length > 0) {
          acc.upcoming.push(upcomingLeague);
        }
        if (archivedLeague.sessions.length > 0) {
          acc.archived.push(archivedLeague);
        }

        return acc;
      }, 
      { active: [], upcoming: [], archived: [] }
    );

    console.log('Categorized leagues:', {
      active: categorizedLeagues.active.map((l: League) => ({ name: l.name, sessions: l.sessions.map(s => s.sessionName) })),
      upcoming: categorizedLeagues.upcoming.map((l: League) => ({ name: l.name, sessions: l.sessions.map(s => s.sessionName) })),
      archived: categorizedLeagues.archived.map((l: League) => ({ name: l.name, sessions: l.sessions.map(s => s.sessionName) }))
    });

    setLeagues(categorizedLeagues.active);
    setUpcomingLeagues(categorizedLeagues.upcoming);
    setArchivedLeagues(categorizedLeagues.archived);
  };

  useEffect(() => {
    updateLeagueLists();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "leagues" || e.key === "currentUser") {
        updateLeagueLists();
      }
    };

    const handleLeagueUpdate = () => {
      updateLeagueLists();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("leagueUpdate", handleLeagueUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("leagueUpdate", handleLeagueUpdate);
    };
  }, []);

  return {
    leagues,
    setLeagues,
    upcomingLeagues,
    archivedLeagues,
    teams,
    setTeams,
    username,
    setUsername,
  };
};
