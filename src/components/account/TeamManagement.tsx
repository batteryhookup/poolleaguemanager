
import { useState } from "react";
import { Users2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Team } from "./types/team";
import { CreateTeamForm } from "./team/CreateTeamForm";
import { TeamList } from "./team/TeamList";
import { DeleteTeamDialog } from "./team/DeleteTeamDialog";

export function TeamManagement() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [teams, setTeams] = useState<Team[]>(() => {
    return JSON.parse(localStorage.getItem("teams") || "[]");
  });
  const [activeTab, setActiveTab] = useState("my-teams");
  const { toast } = useToast();

  const handleCreateTeam = (newTeam: Team) => {
    const updatedTeams = [...teams, newTeam];
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setTeams(updatedTeams);

    toast({
      title: "Success",
      description: "Team created successfully!",
    });
  };

  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTeam = (password: string) => {
    if (!selectedTeam) return;

    if (password !== selectedTeam.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect team password.",
      });
      return;
    }

    const updatedTeams = teams.filter((team) => team.id !== selectedTeam.id);
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
    setIsDeleteDialogOpen(false);
    setSelectedTeam(null);
    setDeletePassword("");

    toast({
      title: "Success",
      description: "Team deleted successfully!",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Users2 className="w-8 h-8 text-emerald-600" />
        <div>
          <CardTitle>My Teams</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-teams">My Teams</TabsTrigger>
            <TabsTrigger value="create">Create Team</TabsTrigger>
          </TabsList>
          <TabsContent value="my-teams">
            <TeamList teams={teams} onDeleteTeam={handleDeleteTeam} />
          </TabsContent>
          <TabsContent value="create">
            <CreateTeamForm
              onCreateTeam={handleCreateTeam}
              onComplete={() => setActiveTab("my-teams")}
            />
          </TabsContent>
        </Tabs>

        <DeleteTeamDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          selectedTeam={selectedTeam}
          onConfirmDelete={confirmDeleteTeam}
          deletePassword={deletePassword}
          onDeletePasswordChange={setDeletePassword}
        />
      </CardContent>
    </Card>
  );
}
