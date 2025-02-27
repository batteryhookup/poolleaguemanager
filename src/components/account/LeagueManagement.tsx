
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Archive, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateLeagueForm } from "./league/CreateLeagueForm";
import { LeagueList } from "./league/LeagueList";
import { LeagueDialogs } from "./league/LeagueDialogs";
import { League, LeagueManagementProps } from "./types/league";
import { Team } from "./types/team";

export interface ExtendedLeagueManagementProps extends LeagueManagementProps {
  pendingLeagues: League[];
  archivedLeagues: League[];
}

export function LeagueManagement({ leagues, pendingLeagues, setLeagues, archivedLeagues }: ExtendedLeagueManagementProps) {
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

  const handleAddTeam = (teamName: string) => {
    if (!selectedLeague) return;

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;

    const userData = JSON.parse(currentUser);
    
    const newTeam: Team = {
      id: Date.now(),
      name: teamName,
      password: selectedLeague.password, // Using league's password for team
      createdAt: new Date().toISOString(),
      createdBy: userData.username,
      members: [userData.username]
    };

    const updatedLeague = {
      ...selectedLeague,
      teams: [...(selectedLeague.teams || []), newTeam]
    };

    handleUpdateLeague(updatedLeague);
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

    const updatedLeague = {
      ...selectedLeague,
      teams: selectedLeague.teams.filter(team => team.id !== selectedTeam.id)
    };

    handleUpdateLeague(updatedLeague);
    setSelectedTeam(null);
    setIsDeleteTeamDialogOpen(false);

    toast({
      title: "Success",
      description: "Team deleted successfully!",
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="my-leagues">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
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
                  setSelectedTeam(team as Team);
                  setIsDeleteTeamDialogOpen(true);
                }}
                onUpdateLeague={handleUpdateLeague}
              />
            )}
          </TabsContent>
          <TabsContent value="pending">
            {pendingLeagues.length === 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <p>No pending leagues found.</p>
              </div>
            ) : (
              <LeagueList
                leagues={pendingLeagues}
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
                  setSelectedTeam(team as Team);
                  setIsDeleteTeamDialogOpen(true);
                }}
                onUpdateLeague={handleUpdateLeague}
              />
            )}
          </TabsContent>
          <TabsContent value="archives">
            {archivedLeagues.length === 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Archive className="w-4 h-4" />
                <p>No archived leagues found.</p>
              </div>
            ) : (
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
                  setSelectedTeam(team as Team);
                  setIsDeleteTeamDialogOpen(true);
                }}
                onUpdateLeague={handleUpdateLeague}
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
