
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Users2, LineChart, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface League {
  id: number;
  name: string;
  location: string;
  createdAt: string;
  createdBy: string;
}

const MyAccount = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleDeleteAccount = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: { username: string; password: string }) => 
      u.username === currentUser.username && u.password === password
    );

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect password.",
      });
      return;
    }

    // Remove user from users array
    const updatedUsers = users.filter((u: { username: string }) => 
      u.username !== currentUser.username
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Remove user's leagues
    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = allLeagues.filter(
      (league: League) => league.createdBy !== currentUser.username
    );
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    // Remove current user from localStorage
    localStorage.removeItem("currentUser");

    toast({
      title: "Success",
      description: "Your account has been deleted.",
    });
    
    navigate("/");
  };

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

          {/* Delete Account Section */}
          <section>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Trash2 className="w-8 h-8 text-destructive" />
                <div>
                  <CardTitle>Delete Account</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete My Account</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Confirm your password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        className="w-full"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default MyAccount;
