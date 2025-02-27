
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";

interface TransferCaptainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onTransferCaptain: (newCaptain: string) => void;
}

export function TransferCaptainDialog({
  isOpen,
  onClose,
  team,
  onTransferCaptain,
}: TransferCaptainDialogProps) {
  const [selectedMember, setSelectedMember] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (selectedMember) {
      onTransferCaptain(selectedMember);
      setSelectedMember("");
      toast({
        title: "Success",
        description: `Team captain transfer request sent to ${selectedMember}`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Team Captain Role</DialogTitle>
          <DialogDescription>
            Select a team member to transfer the captain role to. They will need to accept
            the transfer and set a new team password.
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
            <Button onClick={handleSubmit} disabled={!selectedMember}>
              Send Transfer Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
