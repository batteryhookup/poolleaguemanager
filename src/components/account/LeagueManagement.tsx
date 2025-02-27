
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface LeagueManagementProps {
  leagues: League[];
  setLeagues: (leagues: League[]) => void;
}

export function LeagueManagement({ leagues, setLeagues }: LeagueManagementProps) {
  const [activeTab, setActiveTab] = useState("my-leagues");
  const [leagueName, setLeagueName] = useState("");
  const [leagueLocation, setLeagueLocation] = useState("");
  const [leaguePassword, setLeaguePassword] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [deleteLeaguePassword, setDeleteLeaguePassword] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [expandedLeagues, setExpandedLeagues] = useState<number[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDeleteTeamDialogOpen, setIsDeleteTeamDialogOpen] = useState(false);
  const [deleteTeamPassword, setDeleteTeamPassword] = useState("");
  const { toast } = useToast();

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

  const handleDeleteTeam = () => {
    if (!selectedLeague || !selectedTeam) return;

    if (deleteTeamPassword !== selectedLeague.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect league password.",
      });
      return;
    }

    const updatedLeagues = leagues.map(league => {
      if (league.id === selectedLeague.id) {
        return {
          ...league,
          teams: league.teams.filter(team => team.id !== selectedTeam.id),
        };
      }
      return league;
    });

    setLeagues(updatedLeagues);
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    setDeleteTeamPassword("");
    setSelectedTeam(null);
    setIsDeleteTeamDialogOpen(false);

    toast({
      title: "Success",
      description: "Team deleted successfully!",
    });
  };

  const toggleLeagueExpansion = (leagueId: number) => {
    setExpandedLeagues(prev => 
      prev.includes(leagueId) 
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  return (
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
                                <li 
                                  key={team.id} 
                                  className="text-sm group flex items-center justify-between p-2 hover:bg-accent rounded-md"
                                >
                                  {team.name}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLeague(league);
                                      setSelectedTeam(team);
                                      setIsDeleteTeamDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
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

      <Dialog open={isDeleteTeamDialogOpen} onOpenChange={setIsDeleteTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              To delete "{selectedTeam?.name}" from "{selectedLeague?.name}", please enter the league password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="deleteTeamPassword">League Password</Label>
              <Input
                id="deleteTeamPassword"
                type="password"
                value={deleteTeamPassword}
                onChange={(e) => setDeleteTeamPassword(e.target.value)}
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteTeam}
              className="w-full"
            >
              Delete Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
