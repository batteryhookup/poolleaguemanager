
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateLeagueForm } from "./league/CreateLeagueForm";
import { LeagueList } from "./league/LeagueList";
import { LeagueDialogs } from "./league/LeagueDialogs";
import { League, LeagueManagementProps } from "./types/league";

export interface ExtendedLeagueManagementProps extends LeagueManagementProps {
  archivedLeagues: League[];
}

export function LeagueManagement({ leagues, setLeagues, archivedLeagues }: ExtendedLeagueManagementProps) {
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

    const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = existingLeagues.filter((league: League) => league.id !== selectedLeague.id);
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
    setLeagues(leagues => leagues.filter(league => league.id !== selectedLeague.id));
    setSelectedLeague(null);
    setIsDeleteDialogOpen(false);

    toast({
      title: "Success",
      description: "League deleted successfully!",
    });
  };

  const handleUpdateLeague = (updatedLeague: League) => {
    const existingLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = existingLeagues.map((league: League) =>
      league.id === updatedLeague.id ? updatedLeague : league
    );
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));
    setLeagues(prevLeagues => prevLeagues.map(league =>
      league.id === updatedLeague.id ? updatedLeague : league
    ));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Trophy className="w-8 h-8 text-emerald-600" />
        <div>
          <CardTitle>Leagues</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-leagues">Active Leagues</TabsTrigger>
            <TabsTrigger value="archives">Archives</TabsTrigger>
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
                onUpdateLeague={handleUpdateLeague}
              />
            )}
          </TabsContent>
          <TabsContent value="archives">
            {archivedLeagues.length === 0 ? (
              <p className="text-muted-foreground">No archived leagues found.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Leagues are automatically archived after their last session date.</p>
                </div>
                <LeagueList
                  leagues={archivedLeagues}
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
                  onUpdateLeague={handleUpdateLeague}
                  isArchived
                />
              </div>
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
