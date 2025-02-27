
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
  title?: string;
  description?: string;
  confirmText?: string;
}

export function DeleteTeamDialog({
  isOpen,
  onClose,
  selectedTeam,
  onConfirmDelete,
  deletePassword,
  onDeletePasswordChange,
  title = "Delete Team",
  description = 'To delete "{teamName}", please enter the team password.',
  confirmText = "Delete",
}: DeleteTeamDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description.replace("{teamName}", selectedTeam?.name || "")}
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
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
