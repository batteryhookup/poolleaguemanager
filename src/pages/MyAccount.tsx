
import { Layout } from "@/components/Layout";
import { LeagueManagement } from "@/components/account/LeagueManagement";
import { TeamManagement } from "@/components/account/TeamManagement";
import { StatsManagement } from "@/components/account/StatsManagement";
import { AccountActions } from "@/components/account/AccountActions";
import { useUserData } from "@/hooks/useUserData";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyAccount = () => {
  const navigate = useNavigate();
  const {
    activeLeagues,
    upcomingLeagues,
    archivedLeagues,
    teams,
    username,
    setActiveLeagues,
    setTeams,
  } = useUserData();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
      return;
    }
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
