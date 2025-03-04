import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { League } from "../types/league";
import { toast } from "@/components/ui/use-toast";

interface EditLeagueDialogProps {
  league: League | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedLeague: League) => void;
}

export function EditLeagueDialog({
  league,
  open,
  onOpenChange,
  onSave,
}: EditLeagueDialogProps) {
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Reset form when league changes
  useEffect(() => {
    if (league) {
      setName(league.name);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [league]);

  const handleSave = () => {
    if (!league) return;

    // Only validate current password if trying to change the password
    if (newPassword && currentPassword !== league.password) {
      setError("Current password is incorrect");
      return;
    }

    // Validate new password if provided
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        return;
      }
      if (newPassword.length < 4) {
        setError("New password must be at least 4 characters");
        return;
      }
    }

    // Check for duplicate league names
    const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const isDuplicate = existingLeagues.some(
      (l: League) => l.id !== league.id && l.name === name
    );

    if (isDuplicate) {
      setError("A league with this name already exists");
      return;
    }

    // Update league
    const updatedLeague = {
      ...league,
      name,
      password: newPassword || league.password,
    };

    onSave(updatedLeague);
    onOpenChange(false);
  };

  if (!league) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit League</DialogTitle>
          <DialogDescription>
            Update your league details. You'll need to enter the current password to make changes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">League Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter league name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password (Optional)</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={!newPassword}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
