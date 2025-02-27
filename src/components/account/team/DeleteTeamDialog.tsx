
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
import { Team } from "../types/team";

interface DeleteTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam: Team | null;
  onConfirmDelete: (password: string) => void;
  deletePassword: string;
  onDeletePasswordChange: (password: string) => void;
}

export function DeleteTeamDialog({
  isOpen,
  onClose,
  selectedTeam,
  onConfirmDelete,
  deletePassword,
  onDeletePasswordChange,
}: DeleteTeamDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            To delete "{selectedTeam?.name}", please enter the team password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="deletePassword">Team Password</Label>
            <Input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => onDeletePasswordChange(e.target.value)}
              placeholder="Enter team password"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onDeletePasswordChange("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onConfirmDelete(deletePassword)}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
