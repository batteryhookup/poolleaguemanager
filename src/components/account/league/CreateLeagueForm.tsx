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
import { createLeague, createLeagueSession } from "../league/LeagueOperations";
import { useUserData } from "@/hooks/useUserData";

interface CreateLeagueFormProps {
  onSubmit: (league: League) => void;
  onClose: () => void;
}

export function CreateLeagueForm({ onSubmit, onClose }: CreateLeagueFormProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { leagues, setLeagues } = useUserData();

  // Get user's existing leagues
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  // Get all leagues (active, upcoming, and archived)
  const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]") as League[];
  
  // Debug: Log all leagues in localStorage
  console.log("All leagues in localStorage:", allLeagues.map(l => ({ id: l.id, name: l.name, createdBy: l.createdBy })));
  
  // Filter to only show leagues created by the current user
  const userLeagues = allLeagues.filter((league: League) => {
    const isCreator = league.createdBy === currentUser.username;
    console.log(`League ${league.name} (${league.id}) - Created by: ${league.createdBy}, Current user: ${currentUser.username}, Is creator: ${isCreator}`);
    return isCreator;
  });
  
  // Debug: Log user's leagues after filtering
  console.log("User leagues after filtering:", userLeagues.map(l => ({ id: l.id, name: l.name })));
  
  // Ensure no duplicate leagues in the dropdown by using a Map with league ID as key
  const uniqueUserLeagues = Array.from(
    new Map(userLeagues.map(league => [league.id, league])).values()
  );
  
  // Debug: Log unique user leagues
  console.log("Unique user leagues for dropdown:", uniqueUserLeagues.map(l => ({ id: l.id, name: l.name })));

  // Reset form when switching between new and existing league
  useEffect(() => {
    if (selectedLeagueId !== "new") {
      const selectedLeague = uniqueUserLeagues.find(league => league.id === selectedLeagueId);
      if (selectedLeague) {
        setLeagueName(selectedLeague.name);
      }
    }
  }, [selectedLeagueId, uniqueUserLeagues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (schedule.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please schedule at least one session for the league.",
        });
        setIsSubmitting(false);
        return;
      }

      if (selectedLeagueId === "new" && !leaguePassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a league password.",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!sessionPassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a session password.",
        });
        setIsSubmitting(false);
        return;
      }
      
      const finalGameType = gameType === "specify" ? customGameType : gameType;
      
      // Generate unique IDs for the league and session
      // Use separate IDs for league and session to avoid conflicts
      const leagueId = Date.now();
      const sessionId = leagueId + 1; // Ensure session ID is different
      
      console.log(`Generated IDs - League: ${leagueId}, Session: ${sessionId}`);
      
      // Validate current user
      const currentUserData = localStorage.getItem("currentUser");
      if (!currentUserData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a league.",
        });
        setIsSubmitting(false);
        return;
      }
      
      const currentUser = JSON.parse(currentUserData);
      
      // Create a new session object
      const newSession = {
        id: sessionId,
        name: leagueName,
        sessionName: sessionName,
        parentLeagueId: selectedLeagueId === "new" ? leagueId : selectedLeagueId,
        password: sessionPassword,
        teams: [],
        schedule: schedule,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username,
        location: leagueLocation,
        type: leagueType,
        gameType: finalGameType,
        ...(leagueType === "team" && {
          maxPlayersPerTeam: parseInt(maxPlayersPerTeam),
          playersPerNight: parseInt(playersPerNight),
        }),
      };
      
      // Check if we're creating a new league or adding to existing
      if (selectedLeagueId === "new") {
        // Creating a new league with a new session
        const newLeague: League = {
          id: leagueId,
          name: leagueName,
          password: leaguePassword,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.username,
          sessions: [newSession],
        };
        
        console.log("Creating new league:", newLeague);
        
        // Reset form
        resetForm();
        onClose();
        
        // Call the onSubmit callback with the new league
        onSubmit(newLeague);
      } else {
        // Adding a new session to an existing league
        const selectedLeague = uniqueUserLeagues.find(league => league.id === selectedLeagueId);
        
        if (!selectedLeague) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Selected league not found.",
          });
          setIsSubmitting(false);
          return;
        }
        
        console.log("Adding new session to existing league:", {
          leagueId: selectedLeague.id,
          leagueName: selectedLeague.name,
          newSession
        });
        
        // Create an updated league object with the new session
        const updatedLeague = {
          ...selectedLeague,
          sessions: [...selectedLeague.sessions, newSession]
        };
        
        // Reset form
        resetForm();
        onClose();
        
        // Call the onSubmit callback with the updated league
        onSubmit(updatedLeague);
      }
    } catch (error) {
      console.error("Error creating league:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create league. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  // Helper function to reset the form
  const resetForm = () => {
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
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {uniqueUserLeagues.length > 0 && (
        <div className="space-y-2">
          <Label>Create For</Label>
          <Select value={selectedLeagueId.toString()} onValueChange={(value) => setSelectedLeagueId(value === "new" ? "new" : parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select league or create new" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Create New League</SelectItem>
              {uniqueUserLeagues.map(league => (
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : (selectedLeagueId === "new" ? "Create League" : "Add Session")}
      </Button>
    </form>
  );
}
