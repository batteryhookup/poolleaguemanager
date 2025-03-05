import { Layout } from "@/components/Layout";
import { LeagueManagement } from "@/components/account/LeagueManagement";
import { TeamManagement } from "@/components/account/TeamManagement";
import { StatsManagement } from "@/components/account/StatsManagement";
import { AccountActions } from "@/components/account/AccountActions";
import { useUserData } from "@/hooks/useUserData";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MyAccount = () => {
  const navigate = useNavigate();
  const {
    leagues,
    upcomingLeagues,
    archivedLeagues,
    teams,
    username,
    setLeagues,
    setTeams,
  } = useUserData();

  useEffect(() => {
    // Check for both token and currentUser
    const token = localStorage.getItem("token");
    const currentUser = localStorage.getItem("currentUser");
    
    console.log("Auth check - Token:", token);
    console.log("Auth check - CurrentUser:", currentUser);
    
    if (!token || !currentUser) {
      toast.error("Please log in to access your account");
      navigate("/login");
      return;
    }
    
    // Validate that currentUser is a proper JSON object
    try {
      const userObj = JSON.parse(currentUser);
      if (!userObj || !userObj.username) {
        toast.error("Invalid user data. Please log in again");
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      toast.error("Session data is corrupted. Please log in again");
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold capitalize">{username}</h1>
        
        <div className="grid gap-8">
          <section>
            <LeagueManagement 
              leagues={leagues}
              upcomingLeagues={upcomingLeagues}
              archivedLeagues={archivedLeagues} 
              setLeagues={setLeagues}
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
