
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Team } from "../types/team";
import { useToast } from "@/hooks/use-toast";

interface SearchPlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export function SearchPlayerDialog({ isOpen, onClose, team }: SearchPlayerDialogProps) {
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const { toast } = useToast();

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

    onClose();
    setUsername("");
    setSearchResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Players to {team?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
