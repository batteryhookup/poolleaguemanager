
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { League } from "@/components/account/types/league";
import { Team } from "@/components/account/types/team";
import { parseISO, isAfter, isBefore } from "date-fns";

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
      console.log("Current user:", userData.username);

      const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      console.log("All leagues from localStorage:", allLeagues);
      
      const now = new Date();
      const categorizedLeagues = {
        active: [] as League[],
        upcoming: [] as League[],
        archived: [] as League[]
      };

      allLeagues.forEach((league: League) => {
        console.log(`Processing league: ${league.name}, created by: ${league.createdBy}`);
        
        const isUserLeague = league.createdBy === userData.username;
        const isUserMember = league.teams?.some((team: Team) => 
          team.members?.includes(userData.username)
        );

        console.log(`League ${league.name} - User is creator: ${isUserLeague}, User is member: ${isUserMember}`);

        if (isUserLeague || isUserMember) {
          const category = categorizeLeague(league, userData.username, now);
          categorizedLeagues[category].push(league);
          console.log(`${league.name}: Categorized as ${category}`);
        } else {
          console.log(`Skipping league ${league.name} - user not involved`);
        }
      });

      console.log("Categorized leagues:", {
        active: categorizedLeagues.active.length,
        upcoming: categorizedLeagues.upcoming.length,
        archived: categorizedLeagues.archived.length
      });

      setActiveLeagues(categorizedLeagues.active);
      setUpcomingLeagues(categorizedLeagues.upcoming);
      setArchivedLeagues(categorizedLeagues.archived);

      const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      console.log("All teams from localStorage:", allTeams);
      
      const userTeams = allTeams.filter((team: Team) => 
        team.createdBy === userData.username || team.members.includes(userData.username)
      );
      console.log("Filtered user teams:", userTeams);
      
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
    loadUserData();
    
    const handleLeagueUpdate = (event: Event) => {
      console.log("League update event received:", event);
      
      if (event instanceof CustomEvent) {
        const { league, category, action } = event.detail;
        console.log(`League update: ${action}, Category: ${category}`, league);
        
        if (action === 'create') {
          // Use the category provided by the event
          switch (category) {
            case 'active':
              setActiveLeagues(prev => [...prev, league]);
              break;
            case 'upcoming':
              setUpcomingLeagues(prev => [...prev, league]);
              break;
            case 'archived':
              setArchivedLeagues(prev => [...prev, league]);
              break;
          }
        }
      }
      
      // Reload all data to ensure consistency with other changes
      loadUserData();
    };
    
    window.addEventListener('leagueUpdate', handleLeagueUpdate);
    window.addEventListener('storage', handleLeagueUpdate);
    
    return () => {
      window.removeEventListener('leagueUpdate', handleLeagueUpdate);
      window.removeEventListener('storage', handleLeagueUpdate);
    };
  }, [navigate, username]);

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

