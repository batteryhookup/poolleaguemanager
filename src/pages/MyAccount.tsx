
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Users2, LineChart } from "lucide-react";

interface League {
  id: number;
  name: string;
  location: string;
  createdAt: string;
  createdBy: string;
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
    );
    setLeagues(userLeagues);
  }, [navigate]);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        
        <div className="grid gap-8">
          {/* Leagues Section */}
          <section>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Trophy className="w-8 h-8 text-emerald-600" />
                <div>
                  <CardTitle>My Leagues</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {leagues.length === 0 ? (
                  <p className="text-muted-foreground">You haven't created any leagues yet.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {leagues.map((league) => (
                      <Card key={league.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{league.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{league.location}</p>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Teams Section */}
          <section>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Users2 className="w-8 h-8 text-emerald-600" />
                <div>
                  <CardTitle>My Teams</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Team management coming soon!</p>
              </CardContent>
            </Card>
          </section>

          {/* Stats Section */}
          <section>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <LineChart className="w-8 h-8 text-emerald-600" />
                <div>
                  <CardTitle>My Stats</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Statistics tracking coming soon!</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default MyAccount;
