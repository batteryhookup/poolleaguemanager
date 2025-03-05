import { useState, useEffect } from "react";
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
  onSubmit: (league: League) => void;
}

export function CreateLeagueForm({ onSubmit }: CreateLeagueFormProps) {
  const [leagueName, setLeagueName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | "new">("new");
  const [leagueLocation, setLeagueLocation] = useState("");
  const [leaguePassword, setLeaguePassword] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [leagueType, setLeagueType] = useState<"team" | "singles">("singles");
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState("");
  const [playersPerNight, setPlayersPerNight] = useState("");
  const [gameType, setGameType] = useState("8-ball");
  const [customGameType, setCustomGameType] = useState("");
  const [schedule, setSchedule] = useState<{ date: string; startTime: string; endTime: string; }[]>([]);
  const { toast } = useToast();

  // Get user's existing leagues
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  // Get all leagues (active, upcoming, and archived)
  const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
  const userLeagues = allLeagues.filter((league: League) => league.createdBy === currentUser.username);

  // Reset form when switching between new and existing league
  useEffect(() => {
    if (selectedLeagueId !== "new") {
      const selectedLeague = userLeagues.find(league => league.id === selectedLeagueId);
      if (selectedLeague) {
        setLeagueName(selectedLeague.name);
      }
    }
  }, [selectedLeagueId, userLeagues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (schedule.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please schedule at least one session for the league.",
      });
      return;
    }

    if (selectedLeagueId === "new" && !leaguePassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a league password.",
      });
      return;
    }

    if (!sessionPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a session password.",
      });
      return;
    }

    const finalGameType = gameType === "specify" ? customGameType : gameType;
    const now = new Date().toISOString();

    if (selectedLeagueId === "new") {
      // Creating a new league with its first session
      const newLeague: League = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: leagueName,
        createdAt: now,
        createdBy: currentUser.username,
        sessions: [],
        password: leaguePassword
      };

      const firstSession: LeagueSession = {
        id: Date.now() + Math.floor(Math.random() * 1000) + 1,
        parentLeagueId: newLeague.id,
        name: leagueName,
        sessionName: sessionName || "Initial Session",
        location: leagueLocation,
        password: sessionPassword,
        createdAt: now,
        createdBy: currentUser.username,
        teams: [],
        type: leagueType,
        gameType: finalGameType,
        schedule,
        ...(leagueType === "team" && {
          maxPlayersPerTeam: parseInt(maxPlayersPerTeam),
          playersPerNight: parseInt(playersPerNight),
        }),
      };

      newLeague.sessions = [firstSession];
      console.log("Creating new league with first session:", {
        leagueId: newLeague.id,
        leagueName: newLeague.name,
        sessionId: firstSession.id,
        sessionName: firstSession.sessionName
      });
      onSubmit(newLeague);
    } else {
      // Creating a new session for an existing league
      const parentLeague = allLeagues.find(l => l.id === selectedLeagueId);
      if (!parentLeague) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Selected league not found.",
        });
        return;
      }

      // Generate a unique ID for the new session with high entropy to avoid collisions
      const sessionId = Date.now() + Math.floor(Math.random() * 1000000) + 1;
      
      const newSession: LeagueSession = {
        id: sessionId,
        parentLeagueId: parentLeague.id,
        name: parentLeague.name,
        sessionName: sessionName,
        location: leagueLocation,
        password: sessionPassword,
        createdAt: now,
        createdBy: currentUser.username,
        teams: [],
        type: leagueType,
        gameType: finalGameType,
        schedule,
        ...(leagueType === "team" && {
          maxPlayersPerTeam: parseInt(maxPlayersPerTeam),
          playersPerNight: parseInt(playersPerNight),
        }),
      };

      console.log("Creating new session for existing league:", {
        leagueId: parentLeague.id,
        leagueName: parentLeague.name,
        sessionId: newSession.id,
        sessionName: newSession.sessionName,
        existingSessionCount: parentLeague.sessions.length
      });

      // Create a deep copy of the parent league to avoid reference issues
      const updatedLeague = {
        ...parentLeague,
        sessions: [...parentLeague.sessions, newSession]
      };
      
      onSubmit(updatedLeague);
    }

    // Reset form
    setLeagueName("");
    setSessionName("");
    setSelectedLeagueId("new");
    setLeagueLocation("");
    setLeaguePassword("");
    setSessionPassword("");
    setLeagueType("singles");
    setMaxPlayersPerTeam("");
    setPlayersPerNight("");
    setGameType("8-ball");
    setCustomGameType("");
    setSchedule([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {userLeagues.length > 0 && (
        <div className="space-y-2">
          <Label>Create For</Label>
          <Select value={selectedLeagueId.toString()} onValueChange={(value) => setSelectedLeagueId(value === "new" ? "new" : parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select league or create new" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Create New League</SelectItem>
              {userLeagues.map(league => (
                <SelectItem key={league.id} value={league.id.toString()}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedLeagueId === "new" && (
        <>
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
            <Label htmlFor="leaguePassword">League Password</Label>
            <Input
              id="leaguePassword"
              type="password"
              placeholder="Enter league password"
              value={leaguePassword}
              onChange={(e) => setLeaguePassword(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              This password will be required to delete the entire league and all its sessions.
            </p>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="sessionName">Session Name</Label>
        <Input
          id="sessionName"
          placeholder="e.g., Summer 2024, Tournament 1, etc."
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sessionPassword">Session Password</Label>
        <Input
          id="sessionPassword"
          type="password"
          placeholder="Enter session password"
          value={sessionPassword}
          onChange={(e) => setSessionPassword(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">
          This password will be required to manage teams and cancel this session.
        </p>
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
            placeholder="Enter custom game type"
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
              placeholder="Enter maximum players per team"
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
              placeholder="Enter players per night"
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
          onScheduleChange={setSchedule} 
          initialSchedule={schedule}
        />
      </div>

      <Button type="submit" className="w-full">
        {selectedLeagueId === "new" ? "Create League" : "Add Session"}
      </Button>
    </form>
  );
}
