import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Crown, Trash2, UserPlus, Pencil } from "lucide-react";
import { Team } from "../types/team";
import { SearchPlayerDialog } from "./SearchPlayerDialog";
import { TransferCaptainDialog } from "./TransferCaptainDialog";
import { EditTeamDialog } from "./EditTeamDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface TeamListProps {
  teams: Team[];
  onDeleteTeam: (team: Team) => void;
  onLeaveTeam: (team: Team) => void;
}

export function TeamList({ teams, onDeleteTeam, onLeaveTeam }: TeamListProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAcceptCaptainOpen, setIsAcceptCaptainOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const handleAddPlayers = (team: Team) => {
    setSelectedTeam(team);
    setIsSearchOpen(true);
  };

  const handleTransferCaptain = (team: Team) => {
    setSelectedTeam(team);
    setIsTransferOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsEditTeamOpen(true);
  };

  const handleUpdateTeam = (updatedTeam: Team) => {
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const updatedTeams = allTeams.map((t: Team) =>
      t.id === updatedTeam.id ? updatedTeam : t
    );
    localStorage.setItem("teams", JSON.stringify(updatedTeams));

    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Success",
      description: "Team updated successfully.",
    });
  };

  const onTransferCaptain = (newCaptain: string) => {
    if (!selectedTeam) return;

    const pendingTransfers = JSON.parse(localStorage.getItem("pendingCaptainTransfers") || "[]");
    pendingTransfers.push({
      teamId: selectedTeam.id,
      newCaptain: newCaptain,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("pendingCaptainTransfers", JSON.stringify(pendingTransfers));

    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    notifications.push({
      id: Date.now(),
      userId: newCaptain,
      message: `You have been selected as the new team captain for "${selectedTeam.name}". Please accept the role and set a new team password.`,
      read: false,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("notifications", JSON.stringify(notifications));

    setIsTransferOpen(false);
    setSelectedTeam(null);

    window.dispatchEvent(new Event("storage"));
  };

  const handleAcceptCaptain = (team: Team) => {
    setSelectedTeam(team);
    setIsAcceptCaptainOpen(true);
  };

  const submitAcceptCaptain = () => {
    if (!selectedTeam || !newPassword || newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: newPassword !== confirmPassword ? 
          "Passwords do not match" : 
          "Please enter a new password",
      });
      return;
    }

    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const updatedTeams = allTeams.map((t: Team) => {
      if (t.id === selectedTeam.id) {
        return {
          ...t,
          createdBy: currentUser.username,
          password: newPassword,
        };
      }
      return t;
    });
    localStorage.setItem("teams", JSON.stringify(updatedTeams));

    const pendingTransfers = JSON.parse(localStorage.getItem("pendingCaptainTransfers") || "[]");
    const filteredTransfers = pendingTransfers.filter(
      (transfer: any) => transfer.teamId !== selectedTeam.id
    );
    localStorage.setItem("pendingCaptainTransfers", JSON.stringify(filteredTransfers));

    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    notifications.push({
      id: Date.now(),
      userId: selectedTeam.createdBy,
      message: `${currentUser.username} has accepted the team captain role for "${selectedTeam.name}".`,
      read: false,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("notifications", JSON.stringify(notifications));

    setIsAcceptCaptainOpen(false);
    setSelectedTeam(null);
    setNewPassword("");
    setConfirmPassword("");

    toast({
      title: "Success",
      description: "You are now the team captain.",
    });

    window.dispatchEvent(new Event("storage"));
  };

  if (teams.length === 0) {
    return (
      <p className="text-muted-foreground">
        You haven't created any teams yet.
      </p>
    );
  }

  const pendingTransfers = JSON.parse(localStorage.getItem("pendingCaptainTransfers") || "[]");

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const pendingInvites = JSON.parse(localStorage.getItem("teamInvites") || "[]")
            .filter((invite: any) => invite.teamId === team.id && invite.status === "pending");
          const isCreator = team.createdBy === currentUser.username;
          const isPendingNewCaptain = pendingTransfers.some(
            (transfer: any) => 
              transfer.teamId === team.id && 
              transfer.newCaptain === currentUser.username
          );

          return (
            <Card key={team.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Members ({team.members.length}):
                    <div className="mt-1">
                      {team.members.map((member) => (
                        <div key={member} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2">
                            <span>{member}</span>
                            {team.createdBy === member && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Team Captain</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {isPendingNewCaptain && member === currentUser.username && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAcceptCaptain(team)}
                                className="h-7 text-xs"
                              >
                                Accept Captain Role
                              </Button>
                            )}
                          </div>
                          {member === currentUser.username && !isCreator && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                  onClick={() => onLeaveTeam(team)}
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Leave team</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isCreator && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTeam(team)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddPlayers(team)}
                      >
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTransferCaptain(team)}
                      >
                        <Crown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteTeam(team)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              {pendingInvites.length > 0 && (
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <h4 className="font-medium">Pending Invites:</h4>
                    <ul className="mt-1 space-y-1">
                      {pendingInvites.map((invite: any) => (
                        <li key={invite.id}>{invite.username}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <SearchPlayerDialog
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
      />

      <TransferCaptainDialog
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        onTransferCaptain={onTransferCaptain}
      />

      <Dialog open={isAcceptCaptainOpen} onOpenChange={setIsAcceptCaptainOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Team Captain Role</DialogTitle>
            <DialogDescription>
              Please set a new team password to accept the captain role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Team Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new team password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new team password"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAcceptCaptainOpen(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={submitAcceptCaptain} disabled={!newPassword || !confirmPassword}>
                Accept & Set Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditTeamDialog
        isOpen={isEditTeamOpen}
        onClose={() => {
          setIsEditTeamOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        onUpdateTeam={handleUpdateTeam}
      />
    </TooltipProvider>
  );
}
