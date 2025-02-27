
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

const MyAccount = () => {
  const [activeLeagues, setActiveLeagues] = useState<League[]>([]);
  const [archivedLeagues, setArchivedLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
      return;
    }

    const userData = JSON.parse(currentUser);
    setUsername(userData.username);

    // Filter leagues and separate active from archived
    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const userLeagues = allLeagues.filter(
      (league: League) => league.createdBy === userData.username
    ).map((league: League) => ({
      ...league,
      teams: league.teams || [],
      type: league.type || 'singles',
    }));

    // Separate active and archived leagues
    const { active, archived } = userLeagues.reduce(
      (acc: { active: League[]; archived: League[] }, league: League) => {
        const lastSession = league.schedule?.length > 0 
          ? parseISO(league.schedule[league.schedule.length - 1].date)
          : null;

        if (lastSession && isPast(lastSession)) {
          acc.archived.push(league);
        } else {
          acc.active.push(league);
        }
        return acc;
      },
      { active: [], archived: [] }
    );

    setActiveLeagues(active);
    setArchivedLeagues(archived);

    // Filter teams
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const userTeams = allTeams.filter((team: Team) => 
      team.createdBy === userData.username || team.members.includes(userData.username)
    );
    setTeams(userTeams);
  }, [navigate]);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold capitalize">{username}</h1>
        
        <div className="grid gap-8">
          <section>
            <LeagueManagement 
              leagues={activeLeagues} 
              setLeagues={setActiveLeagues} 
              archivedLeagues={archivedLeagues}
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
