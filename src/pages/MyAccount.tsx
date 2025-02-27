
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeagueManagement } from "@/components/account/LeagueManagement";
import { TeamManagement } from "@/components/account/TeamManagement";
import { StatsManagement } from "@/components/account/StatsManagement";
import { AccountActions } from "@/components/account/AccountActions";
import { League } from "@/components/account/types/league";
import { Team } from "@/components/account/types/team";
import { isPast, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const MyAccount = () => {
  const [activeLeagues, setActiveLeagues] = useState<League[]>([]);
  const [pendingLeagues, setPendingLeagues] = useState<League[]>([]);
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
      
      // Get all leagues where the user is a creator or team member
      const userLeagues = allLeagues.map((league: League) => ({
        ...league,
        teams: league.teams || [],
        type: league.type || 'singles',
      }));

      // Separate active, pending, and archived leagues
      const { active, pending, archived } = userLeagues.reduce(
        (acc: { active: League[]; pending: League[]; archived: League[] }, league: League) => {
          // Check if user is the creator
          const isCreator = league.createdBy === userData.username;
          
          // Check if user is a member of any team in the league
          const isTeamMember = league.teams?.some((team: Team) => 
            team.members.includes(userData.username)
          );

          // Only process leagues where user is involved
          if (!isCreator && !isTeamMember) {
            return acc;
          }

          const lastSession = league.schedule?.length > 0 
            ? parseISO(league.schedule[league.schedule.length - 1].date)
            : null;

          if (lastSession && isPast(lastSession)) {
            // Archived leagues (past last session)
            acc.archived.push(league);
          } else if (isCreator) {
            // Active leagues (user is creator)
            acc.active.push(league);
          } else if (isTeamMember) {
            // Pending leagues (user is team member but not creator)
            acc.pending.push(league);
          }
          
          return acc;
        },
        { active: [], pending: [], archived: [] }
      );

      setActiveLeagues(active);
      setPendingLeagues(pending);
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
              pendingLeagues={pendingLeagues}
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
