
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Team } from "../../types/team";

interface LeaveTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam: Team | null;
  leaveTeamPassword: string;
  setLeaveTeamPassword: (password: string) => void;
  onConfirmLeave: () => void;
}

export function LeaveTeamDialog({
  isOpen,
  onClose,
  selectedTeam,
  leaveTeamPassword,
  setLeaveTeamPassword,
  onConfirmLeave,
}: LeaveTeamDialogProps) {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
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
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirmLeave}
              disabled={!leaveTeamPassword}
            >
              Leave Team
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
