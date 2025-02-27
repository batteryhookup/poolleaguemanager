
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

interface AcceptCaptainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam: Team | null;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  onConfirmAccept: () => void;
}

export function AcceptCaptainDialog({
  isOpen,
  onClose,
  selectedTeam,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onConfirmAccept,
}: AcceptCaptainDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept Team Captain Role</DialogTitle>
          <DialogDescription>
            Please set a new team password to accept the captain role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new team password"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button onClick={onConfirmAccept} disabled={!newPassword || !confirmPassword}>
              Accept & Set Password
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
