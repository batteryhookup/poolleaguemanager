import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Users2, LineChart, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leagueName, setLeagueName] = useState("");
  const [leagueLocation, setLeagueLocation] = useState("");
  const [leaguePassword, setLeaguePassword] = useState("");
  const [activeTab, setActiveTab] = useState("my-leagues");
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [deleteLeaguePassword, setDeleteLeaguePassword] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [expandedLeagues, setExpandedLeagues] = useState<number[]>([]);
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
    ).map((league: League) => ({
      ...league,
      teams: league.teams || []
    }));
    setLeagues(userLeagues);
  }, [navigate]);

  const handleCreateLeague = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    
    const isDuplicate = existingLeagues.some(
      (league: League) => league.name.toLowerCase() === leagueName.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A league with this name already exists.",
      });
      return;
    }

    const newLeague = {
      id: Date.now(),
      name: leagueName,
      location: leagueLocation,
      password: leaguePassword,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username,
      teams: [],
    };

    const updatedLeagues = [...existingLeagues, newLeague];
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    setLeagues(prev => [...prev, newLeague]);

    setLeagueName("");
    setLeagueLocation("");
    setLeaguePassword("");
    setActiveTab("my-leagues");

    toast({
      title: "Success",
      description: "League created successfully!",
    });
  };

  const handleAddTeam = () => {
    if (!selectedLeague || !newTeamName.trim()) return;

    const newTeam = {
      id: Date.now(),
      name: newTeamName.trim(),
    };

    const updatedLeagues = leagues.map(league => {
      if (league.id === selectedLeague.id) {
        return {
          ...league,
          teams: [...(league.teams || []), newTeam],
        };
      }
      return league;
    });

    setLeagues(updatedLeagues);
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    setNewTeamName("");
    setIsAddTeamDialogOpen(false);
    toast({
      title: "Success",
      description: "Team added successfully!",
    });
  };

  const toggleLeagueExpansion = (leagueId: number) => {
    setExpandedLeagues(prev => 
      prev.includes(leagueId) 
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const handleDeleteLeague = () => {
    if (!selectedLeague) return;

    if (deleteLeaguePassword !== selectedLeague.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect league password.",
      });
      return;
    }

    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = allLeagues.filter(
      (league: League) => league.id !== selectedLeague.id
    );
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    setLeagues(leagues.filter(league => league.id !== selectedLeague.id));

    setDeleteLeaguePassword("");
    setSelectedLeague(null);
    setIsDeleteDialogOpen(false);

    toast({
      title: "Success",
      description: "League deleted successfully!",
    });
  };

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

    const updatedUsers = users.filter((u: { username: string }) => 
      u.username !== currentUser.username
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = allLeagues.filter(
      (league: League) => league.createdBy !== currentUser.username
    );
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    localStorage.removeItem("currentUser");

    toast({
      title: "Success",
      description: "Your account has been deleted.",
    });
    
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        
        <div className="grid gap-8">
          <section>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Trophy className="w-8 h-8 text-emerald-600" />
                <div>
                  <CardTitle>My Leagues</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="my-leagues">My Leagues</TabsTrigger>
                    <TabsTrigger value="create">Create League</TabsTrigger>
                  </TabsList>
                  <TabsContent value="my-leagues">
                    {leagues.length === 0 ? (
                      <p className="text-muted-foreground">You haven't created any leagues yet.</p>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {leagues.map((league) => (
                          <Card key={league.id}>
                            <CardHeader className="flex flex-row items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{league.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{league.location}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedLeague(league);
                                    setIsAddTeamDialogOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedLeague(league);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </CardHeader>
                            {league.teams && league.teams.length > 0 && (
                              <CardContent>
                                <div className="space-y-2">
                                  <Button
                                    variant="ghost"
                                    className="w-full flex justify-between"
                                    onClick={() => toggleLeagueExpansion(league.id)}
                                  >
                                    Teams
                                    {expandedLeagues.includes(league.id) ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                  {expandedLeagues.includes(league.id) && (
                                    <ul className="space-y-2 pl-4">
                                      {league.teams.map(team => (
                                        <li key={team.id} className="text-sm">
                                          {team.name}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="create">
                    <form onSubmit={handleCreateLeague} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="leagueName">League Name</Label>
                        <Input
                          id="leagueName"
                          placeholder="Enter league name"
                          value={leagueName}
                          onChange={(e) => setLeagueName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="Enter league location"
                          value={leagueLocation}
                          onChange={(e) => setLeagueLocation(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">League Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          value={leaguePassword}
                          onChange={(e) => setLeaguePassword(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Create League
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

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

          <section>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Users2 className="w-8 h-8 text-emerald-600" />
                <div>
                  <CardTitle>Log Out</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </section>

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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete League</DialogTitle>
            <DialogDescription>
              To delete "{selectedLeague?.name}", please enter the league password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="deleteLeaguePassword">League Password</Label>
              <Input
                id="deleteLeaguePassword"
                type="password"
                value={deleteLeaguePassword}
                onChange={(e) => setDeleteLeaguePassword(e.target.value)}
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteLeague}
              className="w-full"
            >
              Delete League
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTeamDialogOpen} onOpenChange={setIsAddTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team</DialogTitle>
            <DialogDescription>
              Add a new team to {selectedLeague?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddTeam}
              className="w-full"
            >
              Add Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MyAccount;
