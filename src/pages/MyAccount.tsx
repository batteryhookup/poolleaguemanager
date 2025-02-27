
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeagueManagement } from "@/components/account/LeagueManagement";
import { TeamManagement } from "@/components/account/TeamManagement";
import { StatsManagement } from "@/components/account/StatsManagement";
import { AccountActions } from "@/components/account/AccountActions";
import { League } from "@/components/account/types/league";
import { Team } from "@/components/account/types/team";
import { isPast, parseISO, isFuture } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const MyAccount = () => {
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
          
          const firstSession = league.schedule?.length > 0
            ? parseISO(league.schedule[0].date)
            : null;
          const lastSession = league.schedule?.length > 0 
            ? parseISO(league.schedule[league.schedule.length - 1].date)
            : null;
          
          // Check if user is creator or member of any team in the league
          const isUserLeague = league.createdBy === userData.username;
          const isUserMember = league.teams?.some((team: Team) => 
            team.members?.includes(userData.username)
          );

          console.log(`League ${league.name} - User is creator: ${isUserLeague}, User is member: ${isUserMember}`);

          // Only process leagues where user is creator or member
          if (isUserLeague || isUserMember) {
            // If the league has ended (last session is in the past)
            if (lastSession && isPast(lastSession)) {
              console.log(`Adding ${league.name} to archived`);
              acc.archived.push(league);
            }
            // If the league hasn't started yet (first session is in the future)
            else if (firstSession && isFuture(firstSession)) {
              console.log(`Adding ${league.name} to upcoming`);
              acc.upcoming.push(league);
            }
            // If the league has started but not ended, or has no schedule
            else {
              console.log(`Adding ${league.name} to active`);
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
  }, [navigate]);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold capitalize">{username}</h1>
        
        <div className="grid gap-8">
          <section>
            <LeagueManagement 
              leagues={activeLeagues}
              upcomingLeagues={upcomingLeagues}
              archivedLeagues={archivedLeagues} 
              setLeagues={setActiveLeagues}
            />
          </section>

          <section>
            <TeamManagement userTeams={teams} setUserTeams={setTeams} />
          </section>

          <section>
            <StatsManagement />
          </section>

          <section>
            <AccountActions />
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default MyAccount;
