
import { useState } from "react";
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
import { Team } from "../types/team";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface EditTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onUpdateTeam: (team: Team) => void;
}

export function EditTeamDialog({
  isOpen,
  onClose,
  team,
  onUpdateTeam,
}: EditTeamDialogProps) {
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const handleUpdateName = () => {
    if (!team || !newName.trim()) return;

    onUpdateTeam({
      ...team,
      name: newName.trim(),
    });
    setNewName("");
    onClose();
  };

  const handleUpdatePassword = () => {
    if (!team) return;

    if (currentPassword !== team.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Current password is incorrect.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match.",
      });
      return;
    }

    if (!newPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New password cannot be empty.",
      });
      return;
    }

    onUpdateTeam({
      ...team,
      password: newPassword,
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      setNewName("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>
            Update your team's name or password
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="name" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="name">Team Name</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="name" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">New Team Name</Label>
              <Input
                id="teamName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={team?.name}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateName}
                disabled={!newName.trim()}
              >
                Update Name
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="password" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
