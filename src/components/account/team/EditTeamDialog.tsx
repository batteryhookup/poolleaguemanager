
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onUpdateTeam: (team: Team) => void;
  onTransferCaptain: (newCaptain: string) => void;
}

export function EditTeamDialog({
  isOpen,
  onClose,
  team,
  onUpdateTeam,
  onTransferCaptain,
}: EditTeamDialogProps) {
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>("");
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

  const handleSearch = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const foundUser = users.find((user: any) => user.username === username);

    if (!foundUser) {
      setSearchResult("User not found");
      return;
    }

    if (team?.members.includes(username)) {
      setSearchResult("User is already a member of this team");
      return;
    }

    setSearchResult("Player found. Click Send Invite to add them to the team.");
  };

  const handleSendInvite = () => {
    if (!team || !username) return;

    const invites = JSON.parse(localStorage.getItem("teamInvites") || "[]");
    const newInvite = {
      id: Date.now(),
      teamId: team.id,
      teamName: team.name,
      username,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("teamInvites", JSON.stringify([...invites, newInvite]));

    toast({
      title: "Success",
      description: `Invite sent to ${username}`,
    });

    setUsername("");
    setSearchResult(null);
  };

  const handleTransferCaptain = () => {
    if (selectedMember) {
      onTransferCaptain(selectedMember);
      setSelectedMember("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      setNewName("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setUsername("");
      setSearchResult(null);
      setSelectedMember("");
      onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>
            Update your team's settings
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="name" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="name">Name</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="members">Add Players</TabsTrigger>
            <TabsTrigger value="captain">Captain</TabsTrigger>
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
          <TabsContent value="members" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Player Username</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
            {searchResult && (
              <div className="space-y-4">
                <p className="text-sm">{searchResult}</p>
                {searchResult.includes("Player found") && (
                  <Button onClick={handleSendInvite} className="w-full">
                    Send Invite
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="captain" className="space-y-4">
            <div className="space-y-2">
              <Label>Select New Captain</Label>
              <Select
                value={selectedMember}
                onValueChange={setSelectedMember}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {team?.members.map((member) => (
                    member !== team.createdBy && (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleTransferCaptain} disabled={!selectedMember}>
                Send Transfer Request
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
