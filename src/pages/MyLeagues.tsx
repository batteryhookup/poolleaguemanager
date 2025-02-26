
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

interface League {
  id: number;
  name: string;
  location: string;
  createdAt: string;
  createdBy: string;
}

const MyLeagues = () => {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Leagues</h1>
        </div>
        {leagues.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              You haven't created any leagues yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => (
              <Card key={league.id} className="transition-transform hover:scale-105">
                <CardHeader>
                  <Trophy className="w-8 h-8 text-emerald-600 mb-2" />
                  <CardTitle>{league.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{league.location}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyLeagues;
