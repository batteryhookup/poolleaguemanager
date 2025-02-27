
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { League } from "../types/league";

interface CreateLeagueFormProps {
  onCreateLeague: (league: League) => void;
  onComplete: () => void;
}

export function CreateLeagueForm({ onCreateLeague, onComplete }: CreateLeagueFormProps) {
  const [leagueName, setLeagueName] = useState("");
  const [leagueLocation, setLeagueLocation] = useState("");
  const [leaguePassword, setLeaguePassword] = useState("");
  const { toast } = useToast();

  const handleCreateLeague = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    
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

    const newLeague: League = {
      id: Date.now(),
      name: leagueName,
      location: leagueLocation,
      password: leaguePassword,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username,
      teams: [],
    };

    onCreateLeague(newLeague);
    setLeagueName("");
    setLeagueLocation("");
    setLeaguePassword("");
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

      <Button type="submit" className="w-full">
        Create League
      </Button>
    </form>
  );
}
