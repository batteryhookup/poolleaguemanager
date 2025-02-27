
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users2, Trash2 } from "lucide-react";
import { Team } from "./types/team";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function TeamManagement() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [teams, setTeams] = useState<Team[]>(() => {
    return JSON.parse(localStorage.getItem("teams") || "[]");
  });
  const [activeTab, setActiveTab] = useState("my-teams");
  const { toast } = useToast();

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.username) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login first to create a team.",
      });
      return;
    }

    const existingTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const isDuplicate = existingTeams.some(
      (team: Team) => team.name.toLowerCase() === teamName.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A team with this name already exists.",
      });
      return;
    }

    const newTeam: Team = {
      id: Date.now(),
      name: teamName,
      password,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username,
      members: [currentUser.username],
    };

    const updatedTeams = [...existingTeams, newTeam];
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setTeams(updatedTeams);

    toast({
      title: "Success",
      description: "Team created successfully!",
    });

    setTeamName("");
    setPassword("");
    setConfirmPassword("");
    setActiveTab("my-teams");
  };

  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTeam = () => {
    if (!selectedTeam) return;

    const updatedTeams = teams.filter((team) => team.id !== selectedTeam.id);
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
    setIsDeleteDialogOpen(false);
    setSelectedTeam(null);

    toast({
      title: "Success",
      description: "Team deleted successfully!",
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Users2 className="w-8 h-8 text-emerald-600" />
            <div>
              <CardTitle>My Teams</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-teams">My Teams</TabsTrigger>
              <TabsTrigger value="create">Create Team</TabsTrigger>
            </TabsList>
            <TabsContent value="my-teams">
              {teams.length === 0 ? (
                <p className="text-muted-foreground">
                  You haven't created any teams yet.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teams.map((team) => (
                    <Card key={team.id}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Members: {team.members.length}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTeam(team)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                        </Button>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="create">
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Team Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Team
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTeam}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
