
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateLeague = () => {
  const [leagueName, setLeagueName] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login first to create a league.",
      });
      navigate("/");
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
      const isDuplicate = existingLeagues.some(
        (league: { name: string }) =>
          league.name.toLowerCase() === leagueName.toLowerCase()
      );

      if (isDuplicate) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "A league with this name already exists.",
        });
        return;
      }

      const newLeague = {
        id: Date.now(),
        name: leagueName,
        location,
        password,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username,
        type: "singles", // Default type
      };

      existingLeagues.push(newLeague);
      localStorage.setItem("leagues", JSON.stringify(existingLeagues));

      toast({
        title: "Success",
        description: "League created successfully!",
      });

      navigate("/leagues/find");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create league. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamJoinRequest = () => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;

    const username = JSON.parse(currentUser).username;
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const userTeams = allTeams.filter((team: { createdBy: string; members: string[] }) => 
      team.createdBy === username || team.members.includes(username)
    );

    if (userTeams.length === 0) {
      toast({
        title: "Create a Team",
        description: "You need to create a team first to join as a team. Would you like to create one now?",
        action: <Button onClick={() => navigate("/account")}>Create Team</Button>,
      });
      return;
    }

    // Continue with team join logic...
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create New League</h1>
          <p className="text-gray-500">
            Fill in the details below to create your league
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">League Password</Label>
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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create League"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateLeague;
