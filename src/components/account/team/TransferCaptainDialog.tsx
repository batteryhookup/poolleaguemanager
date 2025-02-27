
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Team } from "../types/team";

interface TransferCaptainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onTransferCaptain: (newCaptain: string, password: string) => void;
}

export function TransferCaptainDialog({
  isOpen,
  onClose,
  team,
  onTransferCaptain,
}: TransferCaptainDialogProps) {
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = () => {
    if (selectedMember && newPassword) {
      onTransferCaptain(selectedMember, newPassword);
      setSelectedMember("");
      setNewPassword("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Team Captain Role</DialogTitle>
          <DialogDescription>
            Select a new team captain and set a new team password. You will be able
            to leave the team after transferring captaincy.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
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
                  <SelectItem key={member} value={member}>
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedMember || !newPassword}>
              Transfer Captaincy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
