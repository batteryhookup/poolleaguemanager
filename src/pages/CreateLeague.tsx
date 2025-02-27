
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categorizeLeague } from "@/hooks/useUserData";
import { League } from "@/components/account/types/league";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const CreateLeague = () => {
  const [leagueName, setLeagueName] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
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

  const handleDialogClose = () => {
    setShowExplanationDialog(false);
    navigate("/account");
  };

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
        setIsLoading(false);
        return;
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const newLeague: League = {
        id: Date.now(),
        name: leagueName,
        location,
        password,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username,
        type: "singles",
        gameType: "8-ball",
        teams: [],
        schedule: [
          {
            date: tomorrow.toISOString().split('T')[0],
            startTime: "19:00",
            endTime: "22:00"
          }
        ]
      };

      existingLeagues.push(newLeague);
      localStorage.setItem("leagues", JSON.stringify(existingLeagues));
      
      window.dispatchEvent(new Event('leagueUpdate'));

      setIsLoading(false); // Set loading to false before showing dialog
      setShowExplanationDialog(true); // Show the dialog
      
      toast({
        title: "Success",
        description: "League created successfully!",
      });
    } catch (error) {
      console.error("Error creating league:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create league. Please try again.",
      });
      setIsLoading(false);
    }
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

        <Dialog open={showExplanationDialog} onOpenChange={setShowExplanationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>League Successfully Created!</DialogTitle>
              <DialogDescription className="space-y-4 pt-4">
                <p>
                  Your league has been created and will appear in one of these tabs based on its schedule:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Upcoming:</strong> Leagues that haven't started yet</li>
                  <li><strong>Active:</strong> Leagues currently in progress</li>
                  <li><strong>Archived:</strong> Leagues that have ended</li>
                </ul>
                <p>
                  Click OK to view your leagues in their appropriate tabs.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleDialogClose}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CreateLeague;
