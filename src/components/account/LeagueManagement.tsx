
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Archive, CalendarClock } from "lucide-react";
import { CreateLeagueForm } from "./league/CreateLeagueForm";
import { LeagueList } from "./league/LeagueList";
import { LeagueDialogs } from "./league/LeagueDialogs";
import { League, LeagueManagementProps } from "./types/league";
import { Team } from "./types/team";
import {
  createLeague,
  deleteLeague,
  addTeam,
  deleteTeam,
  updateLeague,
} from "./league/LeagueOperations";

export interface ExtendedLeagueManagementProps extends LeagueManagementProps {
  upcomingLeagues: League[];
  archivedLeagues: League[];
}

export function LeagueManagement({
  leagues,
  upcomingLeagues,
  setLeagues,
  archivedLeagues
}: ExtendedLeagueManagementProps) {
  const [activeTab, setActiveTab] = useState("my-leagues");
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDeleteTeamDialogOpen, setIsDeleteTeamDialogOpen] = useState(false);

  const handleCreateLeague = (newLeague: League) => {
    createLeague(newLeague, leagues, setLeagues, true);
  };

  const handleDeleteLeague = (password: string) => {
    if (!selectedLeague) return;
    if (deleteLeague(selectedLeague, password, leagues, setLeagues)) {
      setSelectedLeague(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleAddTeam = (teamName: string) => {
    if (!selectedLeague) return;
    if (addTeam(selectedLeague, teamName, leagues, setLeagues)) {
      setIsAddTeamDialogOpen(false);
    }
  };

  const handleDeleteTeam = (password: string) => {
    if (!selectedLeague || !selectedTeam) return;
    if (deleteTeam(selectedLeague, selectedTeam, password, leagues, setLeagues)) {
      setSelectedTeam(null);
      setIsDeleteTeamDialogOpen(false);
    }
  };

  const handleUpdateLeague = (updatedLeague: League) => {
    updateLeague(updatedLeague, leagues, setLeagues);
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
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
          <TabsContent value="upcoming">
            {upcomingLeagues.length === 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarClock className="w-4 h-4" />
                <p>No upcoming leagues found.</p>
              </div>
            ) : (
              <LeagueList
                leagues={upcomingLeagues}
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
                <Archive className="w-4 w-4" />
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
