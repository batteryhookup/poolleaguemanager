
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Team } from "../types/team";

interface CreateTeamFormProps {
  onCreateTeam: (team: Team) => void;
  onComplete: () => void;
}

export function CreateTeamForm({ onCreateTeam, onComplete }: CreateTeamFormProps) {
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.username) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login first to create a team.",
      });
      return;
    }

    const existingTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const isDuplicate = existingTeams.some(
      (team: Team) => team.name.toLowerCase() === teamName.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A team with this name already exists.",
      });
      return;
    }

    const newTeam: Team = {
      id: Date.now(),
      name: teamName,
      password,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username,
      members: [currentUser.username],
    };

    onCreateTeam(newTeam);
    setTeamName("");
    setPassword("");
    setConfirmPassword("");
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="teamName">Team Name</Label>
        <Input
          id="teamName"
          placeholder="Enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Team Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Create Team
      </Button>
    </form>
  );
}
