
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeagueManagement } from "@/components/account/LeagueManagement";
import { TeamManagement } from "@/components/account/TeamManagement";
import { StatsManagement } from "@/components/account/StatsManagement";
import { AccountActions } from "@/components/account/AccountActions";

interface Team {
  id: number;
  name: string;
}

interface League {
  id: number;
  name: string;
  location: string;
  createdAt: string;
  createdBy: string;
  password: string;
  teams: Team[];
}

const MyAccount = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
      return;
    }

    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const userLeagues = allLeagues.filter(
      (league: League) => league.createdBy === JSON.parse(currentUser).username
    ).map((league: League) => ({
      ...league,
      teams: league.teams || []
    }));
    setLeagues(userLeagues);
  }, [navigate]);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        
        <div className="grid gap-8">
          <section>
            <LeagueManagement leagues={leagues} setLeagues={setLeagues} />
          </section>

          <section>
            <TeamManagement />
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
