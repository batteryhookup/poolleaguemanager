
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { JoinLeagueDialogProps } from "./types";

export const JoinLeagueDialog = ({
  isOpen,
  onOpenChange,
  selectedLeague,
  userTeams,
  onJoinRequest,
}: JoinLeagueDialogProps) => {
  const [joinType, setJoinType] = useState<"player" | "team">("player");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const handleJoinRequest = () => {
    onJoinRequest(joinType, selectedTeam);
    setJoinType("player");
    setSelectedTeam("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join League</DialogTitle>
          <DialogDescription>
            Choose how you would like to join {selectedLeague?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label>Join as:</label>
            <Select
              value={joinType}
              onValueChange={(value: "player" | "team") => setJoinType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select join type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Individual Player</SelectItem>
                {userTeams.length > 0 && (
                  <SelectItem value="team">Team</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {joinType === "team" && userTeams.length > 0 && (
            <div className="space-y-2">
              <label>Select Team:</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {userTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinRequest}
              disabled={joinType === "team" && !selectedTeam}
            >
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
