
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTeamForm } from "./team/CreateTeamForm";
import { TeamList } from "./team/TeamList";
import { Users } from "lucide-react";
import { Team } from "./types/team";
import { DeleteTeamDialog } from "./team/DeleteTeamDialog";
import { useToast } from "@/hooks/use-toast";

interface TeamManagementProps {
  userTeams: Team[];
  setUserTeams: (teams: Team[]) => void;
}

export function TeamManagement({ userTeams, setUserTeams }: TeamManagementProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const { toast } = useToast();

  const handleCreateTeam = (newTeam: Team) => {
    const existingTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const updatedTeams = [...existingTeams, newTeam];
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setUserTeams([...userTeams, newTeam]);
  };

  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (password: string) => {
    if (!teamToDelete) return;

    if (password !== teamToDelete.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect team password.",
      });
      return;
    }

    const existingTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const updatedTeams = existingTeams.filter((t: Team) => t.id !== teamToDelete.id);
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    
    setUserTeams(userTeams.filter(t => t.id !== teamToDelete.id));
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
    setDeletePassword("");

    toast({
      title: "Success",
      description: "Team deleted successfully.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Users className="w-8 h-8 text-emerald-600" />
        <div>
          <CardTitle>My Teams</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CreateTeamForm 
          onCreateTeam={handleCreateTeam} 
          onComplete={() => {
            toast({
              title: "Success",
              description: "Team created successfully.",
            });
          }} 
        />
        <TeamList teams={userTeams} onDeleteTeam={handleDeleteTeam} />
      </CardContent>

      <DeleteTeamDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletePassword("");
        }}
        selectedTeam={teamToDelete}
        onConfirmDelete={handleConfirmDelete}
        deletePassword={deletePassword}
        onDeletePasswordChange={setDeletePassword}
      />
    </Card>
  );
}
