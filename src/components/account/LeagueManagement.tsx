
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateLeagueForm } from "./league/CreateLeagueForm";
import { LeagueList } from "./league/LeagueList";
import { LeagueDialogs } from "./league/LeagueDialogs";
import { League, LeagueManagementProps, Team } from "./types/league";

export function LeagueManagement({ leagues, setLeagues }: LeagueManagementProps) {
  const [activeTab, setActiveTab] = useState("my-leagues");
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDeleteTeamDialogOpen, setIsDeleteTeamDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateLeague = (newLeague: League) => {
    const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = [...existingLeagues, newLeague];
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
    setLeagues(leagues => [...leagues, newLeague]);
  };

  const handleDeleteLeague = (password: string) => {
    if (!selectedLeague) return;

    if (password !== selectedLeague.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect league password.",
      });
      return;
    }

    const updatedLeagues = leagues.filter(league => league.id !== selectedLeague.id);
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
    setLeagues(updatedLeagues);
    setSelectedLeague(null);
    setIsDeleteDialogOpen(false);

    toast({
      title: "Success",
      description: "League deleted successfully!",
    });
  };

  const handleAddTeam = (teamName: string) => {
    if (!selectedLeague || !teamName.trim()) return;

    const newTeam: Team = {
      id: Date.now(),
      name: teamName.trim(),
    };

    const updatedLeagues = leagues.map(league => {
      if (league.id === selectedLeague.id) {
        return {
          ...league,
          teams: [...(league.teams || []), newTeam],
        };
      }
      return league;
    });

    setLeagues(updatedLeagues);
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
    setIsAddTeamDialogOpen(false);

    toast({
      title: "Success",
      description: "Team added successfully!",
    });
  };

  const handleDeleteTeam = (password: string) => {
    if (!selectedLeague || !selectedTeam) return;

    if (password !== selectedLeague.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect league password.",
      });
      return;
    }

    const updatedLeagues = leagues.map(league => {
      if (league.id === selectedLeague.id) {
        return {
          ...league,
          teams: league.teams.filter(team => team.id !== selectedTeam.id),
        };
      }
      return league;
    });

    setLeagues(updatedLeagues);
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
    setSelectedTeam(null);
    setIsDeleteTeamDialogOpen(false);

    toast({
      title: "Success",
      description: "Team deleted successfully!",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Trophy className="w-8 h-8 text-emerald-600" />
        <div>
          <CardTitle>My Leagues</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-leagues">My Leagues</TabsTrigger>
            <TabsTrigger value="create">Create League</TabsTrigger>
          </TabsList>
          <TabsContent value="my-leagues">
            {leagues.length === 0 ? (
              <p className="text-muted-foreground">You haven't created any leagues yet.</p>
            ) : (
              <LeagueList
                leagues={leagues}
                onDeleteLeague={(league) => {
                  setSelectedLeague(league);
                  setIsDeleteDialogOpen(true);
                }}
                onAddTeam={(league) => {
                  setSelectedLeague(league);
                  setIsAddTeamDialogOpen(true);
                }}
                onDeleteTeam={(league, team) => {
                  setSelectedLeague(league);
                  setSelectedTeam(team);
                  setIsDeleteTeamDialogOpen(true);
                }}
              />
            )}
          </TabsContent>
          <TabsContent value="create">
            <CreateLeagueForm
              onCreateLeague={handleCreateLeague}
              onComplete={() => setActiveTab("my-leagues")}
            />
          </TabsContent>
        </Tabs>

        <LeagueDialogs
          selectedLeague={selectedLeague}
          isDeleteDialogOpen={isDeleteDialogOpen}
          isAddTeamDialogOpen={isAddTeamDialogOpen}
          isDeleteTeamDialogOpen={isDeleteTeamDialogOpen}
          onDeleteLeague={handleDeleteLeague}
          onAddTeam={handleAddTeam}
          onDeleteTeam={handleDeleteTeam}
          onCloseDeleteDialog={() => setIsDeleteDialogOpen(false)}
          onCloseAddTeamDialog={() => setIsAddTeamDialogOpen(false)}
          onCloseDeleteTeamDialog={() => setIsDeleteTeamDialogOpen(false)}
          selectedTeam={selectedTeam}
        />
      </CardContent>
    </Card>
  );
}
