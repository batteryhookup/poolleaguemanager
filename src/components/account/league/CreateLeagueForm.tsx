import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { League, LeagueSession } from "../types/league";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeagueScheduler } from "./LeagueScheduler";

interface CreateLeagueFormProps {
  onCreateLeague: (league: League) => void;
  onComplete: () => void;
}

export function CreateLeagueForm({ onCreateLeague, onComplete }: CreateLeagueFormProps) {
  const [leagueName, setLeagueName] = useState("");
  const [leagueLocation, setLeagueLocation] = useState("");
  const [leaguePassword, setLeaguePassword] = useState("");
  const [leagueType, setLeagueType] = useState<"team" | "singles">("singles");
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState("");
  const [playersPerNight, setPlayersPerNight] = useState("");
  const [gameType, setGameType] = useState("8-ball");
  const [customGameType, setCustomGameType] = useState("");
  const [sessions, setSessions] = useState<LeagueSession[]>([]);
  const { toast } = useToast();

  const handleCreateLeague = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    
    if (sessions.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please schedule at least one session for the league.",
      });
      return;
    }
    
    const isDuplicate = existingLeagues.some(
      (league: League) => league.name.toLowerCase() === leagueName.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A league with this name already exists.",
      });
      return;
    }

    if (leagueType === "team") {
      if (!maxPlayersPerTeam || !playersPerNight) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all team-related fields.",
        });
        return;
      }

      const maxPlayers = parseInt(maxPlayersPerTeam);
      const nightPlayers = parseInt(playersPerNight);

      if (nightPlayers > maxPlayers) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Players per night cannot exceed maximum players per team.",
        });
        return;
      }
    }

    const finalGameType = gameType === "specify" ? customGameType : gameType;

    const newLeague: League = {
      id: Date.now(),
      name: leagueName,
      location: leagueLocation,
      password: leaguePassword,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username,
      teams: [],
      type: leagueType,
      gameType: finalGameType,
      schedule: sessions,
      ...(leagueType === "team" && {
        maxPlayersPerTeam: parseInt(maxPlayersPerTeam),
        playersPerNight: parseInt(playersPerNight),
      }),
    };

    onCreateLeague(newLeague);
    setLeagueName("");
    setLeagueLocation("");
    setLeaguePassword("");
    setLeagueType("singles");
    setMaxPlayersPerTeam("");
    setPlayersPerNight("");
    setGameType("8-ball");
    setCustomGameType("");
    setSessions([]);
    onComplete();

    toast({
      title: "Success",
      description: "League created successfully!",
    });
  };

  return (
    <form onSubmit={handleCreateLeague} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="leagueName">League Name</Label>
        <Input
          id="leagueName"
          placeholder="Enter league name"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="Enter league location"
          value={leagueLocation}
          onChange={(e) => setLeagueLocation(e.target.value)}
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
            <SelectItem value="8-ball">8 Ball</SelectItem>
            <SelectItem value="9-ball">9 Ball</SelectItem>
            <SelectItem value="10-ball">10 Ball</SelectItem>
            <SelectItem value="specify">Specify Other</SelectItem>
          </SelectContent>
        </Select>
        {gameType === "specify" && (
          <div className="mt-2">
            <Input
              placeholder="Enter custom game type"
              value={customGameType}
              onChange={(e) => setCustomGameType(e.target.value)}
              required
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="leagueType">League Type</Label>
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
            <Label htmlFor="maxPlayers">Maximum Players per Team</Label>
            <Input
              id="maxPlayers"
              type="number"
              min="1"
              placeholder="Enter max players per team"
              value={maxPlayersPerTeam}
              onChange={(e) => setMaxPlayersPerTeam(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="playersPerNight">Players per League Night</Label>
            <Input
              id="playersPerNight"
              type="number"
              min="1"
              placeholder="Enter players per night"
              value={playersPerNight}
              onChange={(e) => setPlayersPerNight(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">League Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={leaguePassword}
          onChange={(e) => setLeaguePassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>League Schedule</Label>
        <LeagueScheduler
          sessions={sessions}
          onSessionsChange={setSessions}
        />
      </div>

      <Button type="submit" className="w-full">
        Create League
      </Button>
    </form>
  );
}
