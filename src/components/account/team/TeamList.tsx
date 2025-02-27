
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Crown, Trash2 } from "lucide-react";
import { Team } from "../types/team";
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
import { useToast } from "@/hooks/use-toast";

interface TeamListProps {
  teams: Team[];
  onDeleteTeam: (team: Team) => void;
  onLeaveTeam: (team: Team) => void;
}

export function TeamList({ teams, onDeleteTeam, onLeaveTeam }: TeamListProps) {
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [isAcceptCaptainOpen, setIsAcceptCaptainOpen] = useState(false);
  const [isRemovePlayerDialogOpen, setIsRemovePlayerDialogOpen] = useState(false);
  const [isLeaveTeamDialogOpen, setIsLeaveTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [removePassword, setRemovePassword] = useState("");
  const [leaveTeamPassword, setLeaveTeamPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

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

  const initiateRemovePlayer = (team: Team, playerToRemove: string) => {
    if (team.createdBy === playerToRemove) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You cannot remove the team captain.",
      });
      return;
    }

    setSelectedTeam(team);
    setSelectedPlayer(playerToRemove);
    setIsRemovePlayerDialogOpen(true);
  };

  const initiateLeaveTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsLeaveTeamDialogOpen(true);
  };

  const handleRemovePlayer = () => {
    if (!selectedTeam || !selectedPlayer) return;

    if (removePassword !== selectedTeam.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect team password.",
      });
      return;
    }

    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const updatedTeams = allTeams.map((t: Team) => {
      if (t.id === selectedTeam.id) {
        return {
          ...t,
          members: t.members.filter((member) => member !== selectedPlayer),
        };
      }
      return t;
    });
    localStorage.setItem("teams", JSON.stringify(updatedTeams));

    window.dispatchEvent(new Event("storage"));

    setIsRemovePlayerDialogOpen(false);
    setSelectedTeam(null);
    setSelectedPlayer(null);
    setRemovePassword("");

    toast({
      title: "Success",
      description: `${selectedPlayer} has been removed from the team.`,
    });
  };

  const handleLeaveTeam = () => {
    if (!selectedTeam) return;

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;

    const userData = JSON.parse(currentUser);
    if (leaveTeamPassword !== userData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect user password.",
      });
      return;
    }

    onLeaveTeam(selectedTeam);
    setIsLeaveTeamDialogOpen(false);
    setSelectedTeam(null);
    setLeaveTeamPassword("");
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

    setIsEditTeamOpen(false);
    setSelectedTeam(null);

    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Success",
      description: `Team captain transfer request sent to ${newCaptain}`,
    });
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
                  {isCreator && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTeam(team)}
                      className="mt-2"
                    >
                      Edit Team
                    </Button>
                  )}
                  <div className="text-sm text-muted-foreground mt-2">
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
                          <div className="flex gap-2">
                            {isCreator && member !== currentUser.username && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                    onClick={() => initiateRemovePlayer(team, member)}
                                  >
                                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remove player</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {member === currentUser.username && !isCreator && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                    onClick={() => initiateLeaveTeam(team)}
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {isCreator && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteTeam(team)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
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

      <EditTeamDialog
        isOpen={isEditTeamOpen}
        onClose={() => {
          setIsEditTeamOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        onUpdateTeam={handleUpdateTeam}
        onTransferCaptain={onTransferCaptain}
      />

      <Dialog 
        open={isRemovePlayerDialogOpen} 
        onOpenChange={(open) => {
          setIsRemovePlayerDialogOpen(open);
          if (!open) {
            setRemovePassword("");
            setSelectedPlayer(null);
            setSelectedTeam(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Player</DialogTitle>
            <DialogDescription>
              Please enter the team password to confirm removing {selectedPlayer} from {selectedTeam?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="removePassword">Team Password</Label>
              <Input
                id="removePassword"
                type="password"
                value={removePassword}
                onChange={(e) => setRemovePassword(e.target.value)}
                placeholder="Enter team password"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRemovePlayerDialogOpen(false);
                  setRemovePassword("");
                  setSelectedPlayer(null);
                  setSelectedTeam(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRemovePlayer}
                disabled={!removePassword}
              >
                Remove Player
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isLeaveTeamDialogOpen} 
        onOpenChange={(open) => {
          setIsLeaveTeamDialogOpen(open);
          if (!open) {
            setLeaveTeamPassword("");
            setSelectedTeam(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Team</DialogTitle>
            <DialogDescription>
              Please enter your account password to confirm leaving {selectedTeam?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="leaveTeamPassword">Your Password</Label>
              <Input
                id="leaveTeamPassword"
                type="password"
                value={leaveTeamPassword}
                onChange={(e) => setLeaveTeamPassword(e.target.value)}
                placeholder="Enter your account password"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLeaveTeamDialogOpen(false);
                  setLeaveTeamPassword("");
                  setSelectedTeam(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleLeaveTeam}
                disabled={!leaveTeamPassword}
              >
                Leave Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </TooltipProvider>
  );
}
