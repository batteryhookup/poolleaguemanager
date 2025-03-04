import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Team } from "../types/team";
import { LeagueSession } from "../types/league";

interface LeagueDialogsProps {
  selectedSession: LeagueSession | null;
  selectedTeam: Team | null;
  selectedLeagueToDelete: League | null;
  isDeleteDialogOpen: boolean;
  isAddTeamDialogOpen: boolean;
  isDeleteTeamDialogOpen: boolean;
  isDeleteLeagueDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsAddTeamDialogOpen: (open: boolean) => void;
  setIsDeleteTeamDialogOpen: (open: boolean) => void;
  setIsDeleteLeagueDialogOpen: (open: boolean) => void;
  onDeleteLeague: (password: string) => void;
  onAddTeam: (teamName: string) => void;
  onDeleteTeam: (password: string) => void;
  onDeleteEntireLeague: (password: string) => void;
}

export function LeagueDialogs({
  selectedSession,
  selectedTeam,
  selectedLeagueToDelete,
  isDeleteDialogOpen,
  isAddTeamDialogOpen,
  isDeleteTeamDialogOpen,
  isDeleteLeagueDialogOpen,
  setIsDeleteDialogOpen,
  setIsAddTeamDialogOpen,
  setIsDeleteTeamDialogOpen,
  setIsDeleteLeagueDialogOpen,
  onDeleteLeague,
  onAddTeam,
  onDeleteTeam,
  onDeleteEntireLeague,
}: LeagueDialogsProps) {
  const [deleteLeaguePassword, setDeleteLeaguePassword] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [deleteTeamPassword, setDeleteTeamPassword] = useState("");
  const [deleteEntireLeaguePassword, setDeleteEntireLeaguePassword] = useState("");

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

  const handleDeleteEntireLeague = () => {
    onDeleteEntireLeague(deleteEntireLeaguePassword);
    setDeleteEntireLeaguePassword("");
  };

  return (
    <>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete League</DialogTitle>
            <DialogDescription>
              To delete this session, please enter the session password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="deleteLeaguePassword">Session Password</Label>
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
              Add a new team to {selectedSession?.sessionName}
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
              To delete "{selectedTeam?.name}" from "{selectedSession?.sessionName}", please enter the session password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="deleteTeamPassword">Session Password</Label>
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

      <Dialog open={isDeleteLeagueDialogOpen} onOpenChange={setIsDeleteLeagueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entire League</DialogTitle>
            <DialogDescription>
              Warning: This will delete the league "{selectedLeagueToDelete?.name}" and ALL its sessions permanently. This action cannot be undone. Please enter the league password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="deleteEntireLeaguePassword">League Password</Label>
              <Input
                id="deleteEntireLeaguePassword"
                type="password"
                value={deleteEntireLeaguePassword}
                onChange={(e) => setDeleteEntireLeaguePassword(e.target.value)}
                placeholder="Enter league password"
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteEntireLeague}
              className="w-full"
            >
              Delete Entire League
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
