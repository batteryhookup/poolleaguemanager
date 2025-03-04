import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeagueSession } from "../types/league";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeagueScheduler } from "./LeagueScheduler";

interface EditSessionDialogProps {
  session: LeagueSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedSession: LeagueSession) => void;
}

export function EditSessionDialog({
  session,
  open,
  onOpenChange,
  onSave,
}: EditSessionDialogProps) {
  const [sessionName, setSessionName] = useState("");
  const [location, setLocation] = useState("");
  const [gameType, setGameType] = useState("8-ball");
  const [customGameType, setCustomGameType] = useState("");
  const [schedule, setSchedule] = useState<{ date: string; startTime: string; endTime: string; }[]>([]);
  const [leagueType, setLeagueType] = useState<"team" | "singles">("singles");
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState("");
  const [playersPerNight, setPlayersPerNight] = useState("");

  useEffect(() => {
    if (session) {
      setSessionName(session.sessionName);
      setLocation(session.location);
      setGameType(session.gameType);
      setCustomGameType(session.gameType);
      setSchedule(session.schedule || []);
      setLeagueType(session.type);
      setMaxPlayersPerTeam(session.maxPlayersPerTeam?.toString() || "");
      setPlayersPerNight(session.playersPerNight?.toString() || "");
    }
  }, [session, open]);

  const handleScheduleChange = (newSchedule: { date: string; startTime: string; endTime: string; }[]) => {
    console.log('Schedule changed:', newSchedule);
    setSchedule(newSchedule);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) return;

    const finalGameType = gameType === "specify" ? customGameType : gameType;

    const updatedSession: LeagueSession = {
      ...session,
      sessionName,
      location,
      gameType: finalGameType,
      schedule,
      type: leagueType,
      ...(leagueType === "team" && {
        maxPlayersPerTeam: parseInt(maxPlayersPerTeam),
        playersPerNight: parseInt(playersPerNight),
      }),
    };

    console.log('Saving session with schedule:', schedule);
    onSave(updatedSession);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>
            Update the session details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionName">Session Name</Label>
            <Input
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gameType">Game Type</Label>
            <Select value={gameType} onValueChange={setGameType}>
              <SelectTrigger>
                <SelectValue placeholder="Select game type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8-ball">8-Ball</SelectItem>
                <SelectItem value="9-ball">9-Ball</SelectItem>
                <SelectItem value="10-ball">10-Ball</SelectItem>
                <SelectItem value="straight">Straight Pool</SelectItem>
                <SelectItem value="specify">Other (specify)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {gameType === "specify" && (
            <div className="space-y-2">
              <Label htmlFor="customGameType">Custom Game Type</Label>
              <Input
                id="customGameType"
                value={customGameType}
                onChange={(e) => setCustomGameType(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>League Type</Label>
            <Select value={leagueType} onValueChange={(value: "team" | "singles") => setLeagueType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select league type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="singles">Singles</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {leagueType === "team" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="maxPlayersPerTeam">Maximum Players per Team</Label>
                <Input
                  id="maxPlayersPerTeam"
                  type="number"
                  min="1"
                  value={maxPlayersPerTeam}
                  onChange={(e) => setMaxPlayersPerTeam(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="playersPerNight">Players per Night</Label>
                <Input
                  id="playersPerNight"
                  type="number"
                  min="1"
                  value={playersPerNight}
                  onChange={(e) => setPlayersPerNight(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Schedule</Label>
            <LeagueScheduler 
              onScheduleChange={handleScheduleChange} 
              initialSchedule={schedule} 
            />
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 