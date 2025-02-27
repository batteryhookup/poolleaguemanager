
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTeamForm } from "./team/CreateTeamForm";
import { TeamList } from "./team/TeamList";
import { Users } from "lucide-react";
import { Team } from "./types/team";
import { DeleteTeamDialog } from "./team/DeleteTeamDialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamManagementProps {
  userTeams: Team[];
  setUserTeams: (teams: Team[]) => void;
}

interface TeamInvite {
  id: number;
  teamId: number;
  username: string;
  status: string;
}

export function TeamManagement({ userTeams, setUserTeams }: TeamManagementProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isLeaveTeamDialogOpen, setIsLeaveTeamDialogOpen] = useState(false);
  const [teamToLeave, setTeamToLeave] = useState<Team | null>(null);
  const [leavePassword, setLeavePassword] = useState("");
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [activeTab, setActiveTab] = useState("my-teams");
  const { toast } = useToast();

  useEffect(() => {
    const loadTeamInvites = () => {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) return;
      
      const username = JSON.parse(currentUser).username;
      const allInvites = JSON.parse(localStorage.getItem("teamInvites") || "[]");
      const pendingInvites = allInvites.filter(
        (invite: TeamInvite) => 
          invite.username === username && 
          invite.status === "pending"
      );
      setTeamInvites(pendingInvites);
    };

    const handleStorageChange = () => {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) return;
      
      const username = JSON.parse(currentUser).username;
      const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      const userTeams = allTeams.filter((team: Team) => 
        team.createdBy === username || team.members.includes(username)
      );
      setUserTeams(userTeams);
      loadTeamInvites();
    };

    loadTeamInvites();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setUserTeams]);

  const handleCreateTeam = (newTeam: Team) => {
    const existingTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const updatedTeams = [...existingTeams, newTeam];
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setUserTeams([...userTeams, newTeam]);
    setActiveTab("my-teams");
  };

  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleLeaveTeam = (team: Team) => {
    setTeamToLeave(team);
    setIsLeaveTeamDialogOpen(true);
  };

  const handleAcceptInvite = (invite: TeamInvite) => {
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const team = allTeams.find((t: Team) => t.id === invite.teamId);
    
    if (!team) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Team not found.",
      });
      return;
    }

    const updatedTeams = allTeams.map((t: Team) => {
      if (t.id === team.id) {
        return {
          ...t,
          members: [...t.members, invite.username]
        };
      }
      return t;
    });

    const allInvites = JSON.parse(localStorage.getItem("teamInvites") || "[]");
    const updatedInvites = allInvites.map((i: TeamInvite) => {
      if (i.id === invite.id) {
        return { ...i, status: "accepted" };
      }
      return i;
    });

    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    localStorage.setItem("teamInvites", JSON.stringify(updatedInvites));
    
    setTeamInvites(teamInvites.filter(i => i.id !== invite.id));
    setUserTeams(updatedTeams.filter((t: Team) => 
      t.createdBy === JSON.parse(localStorage.getItem("currentUser") || "{}").username || 
      t.members.includes(JSON.parse(localStorage.getItem("currentUser") || "{}").username)
    ));

    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Success",
      description: "You have joined the team.",
    });
  };

  const handleDeclineInvite = (invite: TeamInvite) => {
    const allInvites = JSON.parse(localStorage.getItem("teamInvites") || "[]");
    const updatedInvites = allInvites.map((i: TeamInvite) => {
      if (i.id === invite.id) {
        return { ...i, status: "declined" };
      }
      return i;
    });

    localStorage.setItem("teamInvites", JSON.stringify(updatedInvites));
    setTeamInvites(teamInvites.filter(i => i.id !== invite.id));

    toast({
      title: "Success",
      description: "Team invite declined.",
    });
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
        {teamInvites.length > 0 && (
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold">Team Invites</h3>
            <div className="grid gap-4">
              {teamInvites.map((invite) => {
                const team = JSON.parse(localStorage.getItem("teams") || "[]")
                  .find((t: Team) => t.id === invite.teamId);
                return (
                  <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{team?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited by {team?.createdBy}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleDeclineInvite(invite)}
                      >
                        Decline
                      </Button>
                      <Button
                        onClick={() => handleAcceptInvite(invite)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

      <Dialog open={isLeaveTeamDialogOpen} onOpenChange={setIsLeaveTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Team</DialogTitle>
            <DialogDescription>
              Please enter your account password to confirm leaving {teamToLeave?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="leavePassword">Your Password</Label>
              <Input
                id="leavePassword"
                type="password"
                value={leavePassword}
                onChange={(e) => setLeavePassword(e.target.value)}
                placeholder="Enter your account password"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLeaveTeamDialogOpen(false);
                  setLeavePassword("");
                  setTeamToLeave(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmLeave}
                disabled={!leavePassword}
              >
                Leave Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

