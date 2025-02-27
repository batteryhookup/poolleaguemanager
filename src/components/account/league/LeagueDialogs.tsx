
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { League, Team } from "../types/league";

interface LeagueDialogsProps {
  selectedLeague: League | null;
  isDeleteDialogOpen: boolean;
  isAddTeamDialogOpen: boolean;
  isDeleteTeamDialogOpen: boolean;
  onDeleteLeague: (password: string) => void;
  onAddTeam: (teamName: string) => void;
  onDeleteTeam: (password: string) => void;
  onCloseDeleteDialog: () => void;
  onCloseAddTeamDialog: () => void;
  onCloseDeleteTeamDialog: () => void;
  selectedTeam: Team | null;
}

export function LeagueDialogs({
  selectedLeague,
  isDeleteDialogOpen,
  isAddTeamDialogOpen,
  isDeleteTeamDialogOpen,
  onDeleteLeague,
  onAddTeam,
  onDeleteTeam,
  onCloseDeleteDialog,
  onCloseAddTeamDialog,
  onCloseDeleteTeamDialog,
  selectedTeam
}: LeagueDialogsProps) {
  const [deleteLeaguePassword, setDeleteLeaguePassword] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [deleteTeamPassword, setDeleteTeamPassword] = useState("");

  const handleDeleteLeague = () => {
    onDeleteLeague(deleteLeaguePassword);
    setDeleteLeaguePassword("");
  };

  const handleAddTeam = () => {
    onAddTeam(newTeamName);
    setNewTeamName("");
  };

  const handleDeleteTeam = () => {
    onDeleteTeam(deleteTeamPassword);
    setDeleteTeamPassword("");
  };

  return (
    <>
      <Dialog open={isDeleteDialogOpen} onOpenChange={onCloseDeleteDialog}>
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

      <Dialog open={isAddTeamDialogOpen} onOpenChange={onCloseAddTeamDialog}>
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

      <Dialog open={isDeleteTeamDialogOpen} onOpenChange={onCloseDeleteTeamDialog}>
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
    </>
  );
}
