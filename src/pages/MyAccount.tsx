
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
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
      return;
    }

    try {
      const userData = JSON.parse(currentUser);
      setUsername(userData.username);

      // Get all leagues from localStorage
      const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      
      // Process all leagues
      const { active, upcoming, archived } = allLeagues.reduce(
        (acc: { active: League[]; upcoming: League[]; archived: League[] }, league: League) => {
          const lastSession = league.schedule?.length > 0 
            ? parseISO(league.schedule[league.schedule.length - 1].date)
            : null;
          const firstSession = league.schedule?.length > 0
            ? parseISO(league.schedule[0].date)
            : null;
          
          const isUserLeague = league.createdBy === userData.username;
          const isUserMember = league.teams?.some((team: Team) => 
            team.members?.includes(userData.username)
          );

          if (lastSession && isPast(lastSession)) {
            if (isUserLeague) {
              acc.archived.push(league);
            }
          } else if (isUserLeague) {
            // If the user created the league
            if (firstSession && isFuture(firstSession)) {
              // If the league hasn't started yet, put it in upcoming
              acc.upcoming.push(league);
            } else {
              // If the league has started or has no schedule, put it in active
              acc.active.push(league);
            }
          } else if (isUserMember) {
            // If the user is just a member, it goes to upcoming
            acc.upcoming.push(league);
          }
          
          return acc;
        },
        { active: [], upcoming: [], archived: [] }
      );

      setActiveLeagues(active);
      setUpcomingLeagues(upcoming);
      setArchivedLeagues(archived);

      // Filter teams - keep showing all teams where user is creator or member
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
