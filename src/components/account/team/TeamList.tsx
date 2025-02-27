
import { useState } from "react";
import { Team } from "../types/team";
import { EditTeamDialog } from "./EditTeamDialog";
import { useToast } from "@/hooks/use-toast";
import { TeamCard } from "./components/TeamCard";
import { handlePlayerRemoval, handleCaptainTransfer, updateTeamInStorage } from "./utils/teamOperations";
import { RemovePlayerDialog } from "./dialogs/RemovePlayerDialog";
import { LeaveTeamDialog } from "./dialogs/LeaveTeamDialog";
import { AcceptCaptainDialog } from "./dialogs/AcceptCaptainDialog";

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
    updateTeamInStorage(updatedTeam);
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

    if (handlePlayerRemoval(selectedTeam, selectedPlayer, removePassword, toast)) {
      setIsRemovePlayerDialogOpen(false);
      setSelectedTeam(null);
      setSelectedPlayer(null);
      setRemovePassword("");

      toast({
        title: "Success",
        description: `${selectedPlayer} has been removed from the team.`,
      });
    }
  };

  const handleLeaveTeam = () => {
    if (!selectedTeam) return;

    if (leaveTeamPassword !== currentUser.password) {
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

    handleCaptainTransfer(selectedTeam.id, newCaptain, selectedTeam.name);

    setIsEditTeamOpen(false);
    setSelectedTeam(null);

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
    <>
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
            <TeamCard
              key={team.id}
              team={team}
              currentUser={currentUser}
              isCreator={isCreator}
              isPendingNewCaptain={isPendingNewCaptain}
              pendingInvites={pendingInvites}
              onEditTeam={handleEditTeam}
              onDeleteTeam={onDeleteTeam}
              onRemovePlayer={initiateRemovePlayer}
              onLeaveTeam={initiateLeaveTeam}
              onAcceptCaptain={handleAcceptCaptain}
            />
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

      <RemovePlayerDialog
        isOpen={isRemovePlayerDialogOpen}
        onClose={() => {
          setIsRemovePlayerDialogOpen(false);
          setRemovePassword("");
          setSelectedPlayer(null);
          setSelectedTeam(null);
        }}
        selectedTeam={selectedTeam}
        selectedPlayer={selectedPlayer}
        removePassword={removePassword}
        setRemovePassword={setRemovePassword}
        onConfirmRemove={handleRemovePlayer}
      />

      <LeaveTeamDialog
        isOpen={isLeaveTeamDialogOpen}
        onClose={() => {
          setIsLeaveTeamDialogOpen(false);
          setLeaveTeamPassword("");
          setSelectedTeam(null);
        }}
        selectedTeam={selectedTeam}
        leaveTeamPassword={leaveTeamPassword}
        setLeaveTeamPassword={setLeaveTeamPassword}
        onConfirmLeave={handleLeaveTeam}
      />

      <AcceptCaptainDialog
        isOpen={isAcceptCaptainOpen}
        onClose={() => {
          setIsAcceptCaptainOpen(false);
          setNewPassword("");
          setConfirmPassword("");
          setSelectedTeam(null);
        }}
        selectedTeam={selectedTeam}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        onConfirmAccept={submitAcceptCaptain}
      />
    </>
  );
}
