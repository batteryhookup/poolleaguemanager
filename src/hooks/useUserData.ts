
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { League } from "@/components/account/types/league";
import { Team } from "@/components/account/types/team";
import { isAfter } from "date-fns";

export const categorizeLeague = (league: League, username: string, now: Date = new Date()) => {
  if (!league.schedule || league.schedule.length === 0) {
    return 'active';
  }

  const firstSession = new Date(`${league.schedule[0].date}T${league.schedule[0].startTime}`);
  const lastSession = new Date(`${league.schedule[league.schedule.length - 1].date}T${league.schedule[league.schedule.length - 1].endTime}`);

  console.log('Categorizing league:', {
    leagueName: league.name,
    firstSession: firstSession.toISOString(),
    lastSession: lastSession.toISOString(),
    now: now.toISOString(),
    isAfterLast: isAfter(now, lastSession),
    isBeforeFirst: isAfter(firstSession, now)
  });

  if (isAfter(now, lastSession)) {
    return 'archived';
  } else if (isAfter(firstSession, now)) {
    return 'upcoming';
  } else {
    return 'active';
  }
};

export const useUserData = () => {
  const [activeLeagues, setActiveLeagues] = useState<League[]>([]);
  const [upcomingLeagues, setUpcomingLeagues] = useState<League[]>([]);
  const [archivedLeagues, setArchivedLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const categorizeAndSetLeagues = (allLeagues: League[], userData: any) => {
    const now = new Date();
    const categorizedLeagues = {
      active: [] as League[],
      upcoming: [] as League[],
      archived: [] as League[]
    };

    allLeagues.forEach((league: League) => {
      const isUserLeague = league.createdBy === userData.username;
      const isUserMember = league.teams?.some((team: Team) => 
        team.members?.includes(userData.username)
      );

      if (isUserLeague || isUserMember) {
        const category = categorizeLeague(league, userData.username, now);
        categorizedLeagues[category].push(league);
      }
    });

    setActiveLeagues(categorizedLeagues.active);
    setUpcomingLeagues(categorizedLeagues.upcoming);
    setArchivedLeagues(categorizedLeagues.archived);
  };

  const loadUserData = () => {
    console.log("Loading user data...");
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      console.log("No current user found, redirecting to home");
      navigate("/");
      return;
    }

    try {
      const userData = JSON.parse(currentUser);
      setUsername(userData.username);

      const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      categorizeAndSetLeagues(allLeagues, userData);

      const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      const userTeams = allTeams.filter((team: Team) => 
        team.createdBy === userData.username || team.members.includes(userData.username)
      );
      setTeams(userTeams);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your leagues and teams. Please try logging in again.",
      });
      navigate("/");
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "leagues" || e.key === "lastLeagueUpdate") {
        loadUserData();
      }
    };

    const handleLeagueUpdate = () => {
      console.log("League update event received");
      // Force an immediate update
      setTimeout(loadUserData, 0);
    };

    loadUserData();
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('leagueUpdate', handleLeagueUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leagueUpdate', handleLeagueUpdate);
    };
  }, [navigate]);

  return {
    activeLeagues,
    upcomingLeagues,
    archivedLeagues,
    teams,
    username,
    setActiveLeagues,
    setTeams,
  };
};
