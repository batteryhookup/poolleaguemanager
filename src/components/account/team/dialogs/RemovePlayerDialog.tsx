
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

interface RemovePlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam: Team | null;
  selectedPlayer: string | null;
  removePassword: string;
  setRemovePassword: (password: string) => void;
  onConfirmRemove: () => void;
}

export function RemovePlayerDialog({
  isOpen,
  onClose,
  selectedTeam,
  selectedPlayer,
  removePassword,
  setRemovePassword,
  onConfirmRemove,
}: RemovePlayerDialogProps) {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
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
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirmRemove}
              disabled={!removePassword}
            >
              Remove Player
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
