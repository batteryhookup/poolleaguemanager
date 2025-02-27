
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTeamForm } from "./team/CreateTeamForm";
import { TeamList } from "./team/TeamList";
import { Users } from "lucide-react";
import { Team } from "./types/team";
import { DeleteTeamDialog } from "./team/DeleteTeamDialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamManagementProps {
  userTeams: Team[];
  setUserTeams: (teams: Team[]) => void;
}

export function TeamManagement({ userTeams, setUserTeams }: TeamManagementProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isLeaveTeamDialogOpen, setIsLeaveTeamDialogOpen] = useState(false);
  const [teamToLeave, setTeamToLeave] = useState<Team | null>(null);
  const [leavePassword, setLeavePassword] = useState("");
  const { toast } = useToast();

  // Effect to watch for team invite acceptances
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) return;
      
      const username = JSON.parse(currentUser).username;
      const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      const userTeams = allTeams.filter((team: Team) => 
        team.createdBy === username || team.members.includes(username)
      );
      setUserTeams(userTeams);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setUserTeams]);

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

  const handleLeaveTeam = (team: Team) => {
    setTeamToLeave(team);
    setIsLeaveTeamDialogOpen(true);
  };

  const handleConfirmLeave = async () => {
    if (!teamToLeave) return;

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;

    const userData = JSON.parse(currentUser);
    if (leavePassword !== userData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect password.",
      });
      return;
    }

    const existingTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const updatedTeams = existingTeams.map((t: Team) => {
      if (t.id === teamToLeave.id) {
        return {
          ...t,
          members: t.members.filter((member: string) => member !== userData.username)
        };
      }
      return t;
    });

    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setUserTeams(userTeams.filter(t => 
      t.id !== teamToLeave.id || t.createdBy === userData.username
    ));

    setIsLeaveTeamDialogOpen(false);
    setTeamToLeave(null);
    setLeavePassword("");

    toast({
      title: "Success",
      description: "You have left the team.",
    });
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
      <CardContent>
        <Tabs defaultValue="my-teams" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-teams">My Teams</TabsTrigger>
            <TabsTrigger value="create-team">Create Team</TabsTrigger>
          </TabsList>
          <TabsContent value="my-teams" className="space-y-4">
            <TeamList 
              teams={userTeams} 
              onDeleteTeam={handleDeleteTeam}
              onLeaveTeam={handleLeaveTeam}
            />
          </TabsContent>
          <TabsContent value="create-team">
            <CreateTeamForm 
              onCreateTeam={handleCreateTeam} 
              onComplete={() => {
                toast({
                  title: "Success",
                  description: "Team created successfully.",
                });
              }} 
            />
          </TabsContent>
        </Tabs>
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

      <DeleteTeamDialog
        isOpen={isLeaveTeamDialogOpen}
        onClose={() => {
          setIsLeaveTeamDialogOpen(false);
          setLeavePassword("");
        }}
        selectedTeam={teamToLeave}
        onConfirmDelete={handleConfirmLeave}
        deletePassword={leavePassword}
        onDeletePasswordChange={setLeavePassword}
        title="Leave Team"
        description="Are you sure you want to leave this team? Please enter your account password to confirm."
        confirmText="Leave Team"
      />
    </Card>
  );
}
