
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { League } from "../types/league";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EditLeagueDialog({
  league,
  isOpen,
  onClose,
  onSave,
}: {
  league: League | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLeague: League) => void;
}) {
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [editedLeague, setEditedLeague] = useState<League | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  const handleVerifyPassword = () => {
    if (league && password === league.password) {
      setIsVerified(true);
      setEditedLeague({ ...league });
      setPassword("");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect password",
      });
    }
  };

  const handleSave = () => {
    if (!editedLeague) return;

    let updatedLeague = { ...editedLeague };

    if (isChangingPassword) {
      if (newPassword !== confirmNewPassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "New passwords do not match",
        });
        return;
      }
      updatedLeague.password = newPassword;
    }

    onSave(updatedLeague);
    handleClose();
    toast({
      title: "Success",
      description: "League updated successfully",
    });
  };

  const handleClose = () => {
    setPassword("");
    setIsVerified(false);
    setEditedLeague(null);
    setNewPassword("");
    setConfirmNewPassword("");
    setIsChangingPassword(false);
    onClose();
  };

  if (!league) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit League: {league.name}</DialogTitle>
        </DialogHeader>

        {!isVerified ? (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="password">Enter League Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleVerifyPassword} className="w-full">
              Verify Password
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">League Name</Label>
              <Input
                id="name"
                value={editedLeague?.name}
                onChange={(e) =>
                  setEditedLeague(prev =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editedLeague?.location}
                onChange={(e) =>
                  setEditedLeague(prev =>
                    prev ? { ...prev, location: e.target.value } : null
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameType">Game Type</Label>
              <Select
                value={editedLeague?.gameType}
                onValueChange={(value) =>
                  setEditedLeague(prev =>
                    prev ? { ...prev, gameType: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8-ball">8 Ball</SelectItem>
                  <SelectItem value="9-ball">9 Ball</SelectItem>
                  <SelectItem value="10-ball">10 Ball</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editedLeague?.type === "team" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="maxPlayersPerTeam">Max Players Per Team</Label>
                  <Input
                    id="maxPlayersPerTeam"
                    type="number"
                    value={editedLeague?.maxPlayersPerTeam}
                    onChange={(e) =>
                      setEditedLeague(prev =>
                        prev ? { ...prev, maxPlayersPerTeam: parseInt(e.target.value) } : null
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playersPerNight">Players Per Night</Label>
                  <Input
                    id="playersPerNight"
                    type="number"
                    value={editedLeague?.playersPerNight}
                    onChange={(e) =>
                      setEditedLeague(prev =>
                        prev ? { ...prev, playersPerNight: parseInt(e.target.value) } : null
                      )
                    }
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="w-full"
              >
                {isChangingPassword ? "Cancel Password Change" : "Change Password"}
              </Button>

              {isChangingPassword && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              )}
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

