
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { League } from "@/components/account/types/league";
import { Team } from "@/components/account/types/team";
import { parseISO, isAfter, isBefore } from "date-fns";

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

      // Get all leagues from localStorage
      const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      console.log("All leagues from localStorage:", allLeagues);
      
      // Process all leagues
      const { active, upcoming, archived } = allLeagues.reduce(
        (acc: { active: League[]; upcoming: League[]; archived: League[] }, league: League) => {
          console.log(`Processing league: ${league.name}, created by: ${league.createdBy}`);
          
          const now = new Date();

          // Check if user is creator or member of any team in the league
          const isUserLeague = league.createdBy === userData.username;
          const isUserMember = league.teams?.some((team: Team) => 
            team.members?.includes(userData.username)
          );

          console.log(`League ${league.name} - User is creator: ${isUserLeague}, User is member: ${isUserMember}`);

          // Only process leagues where user is creator or member
          if (isUserLeague || isUserMember) {
            if (league.schedule && league.schedule.length > 0) {
              const firstSession = parseISO(`${league.schedule[0].date}T${league.schedule[0].startTime}`);
              const lastSession = parseISO(`${league.schedule[league.schedule.length - 1].date}T${league.schedule[league.schedule.length - 1].endTime}`);
              
              console.log(`League ${league.name} - Processing dates:`, {
                firstSession: firstSession.toISOString(),
                lastSession: lastSession.toISOString(),
                now: now.toISOString()
              });

              // If the league's last session has ended (is before now)
              if (isAfter(now, lastSession)) {
                console.log(`${league.name}: Last session has ended - adding to archived`);
                acc.archived.push(league);
              }
              // If the league's first session hasn't started yet (is after now)
              else if (isAfter(firstSession, now)) {
                console.log(`${league.name}: First session hasn't started yet - adding to upcoming`);
                acc.upcoming.push(league);
              }
              // If we're between the first and last session
              else {
                console.log(`${league.name}: League is currently active - adding to active`);
                acc.active.push(league);
              }
            } else {
              // Default case (no schedule)
              console.log(`${league.name}: No schedule found - adding to active`);
              acc.active.push(league);
            }
          } else {
            console.log(`Skipping league ${league.name} - user not involved`);
          }
          
          return acc;
        },
        { active: [], upcoming: [], archived: [] }
      );

      console.log("Categorized leagues:", {
        active: active.length,
        upcoming: upcoming.length,
        archived: archived.length
      });

      setActiveLeagues(active);
      setUpcomingLeagues(upcoming);
      setArchivedLeagues(archived);

      // Filter teams - keep showing all teams where user is creator or member
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
    
    // Add event listener for league updates
    const handleLeagueUpdate = () => {
      console.log("League update detected, reloading user data");
      loadUserData();
    };
    
    window.addEventListener('leagueUpdate', handleLeagueUpdate);
    
    return () => {
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
