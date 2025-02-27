
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, UserPlus } from "lucide-react";
import { Team } from "../types/team";
import { SearchPlayerDialog } from "./SearchPlayerDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamListProps {
  teams: Team[];
  onDeleteTeam: (team: Team) => void;
  onLeaveTeam: (team: Team) => void;
}

export function TeamList({ teams, onDeleteTeam, onLeaveTeam }: TeamListProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const handleAddPlayers = (team: Team) => {
    setSelectedTeam(team);
    setIsSearchOpen(true);
  };

  if (teams.length === 0) {
    return (
      <p className="text-muted-foreground">
        You haven't created any teams yet.
      </p>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const pendingInvites = JSON.parse(localStorage.getItem("teamInvites") || "[]")
            .filter((invite: any) => invite.teamId === team.id && invite.status === "pending");
          const isCreator = team.createdBy === currentUser.username;

          return (
            <Card key={team.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Members ({team.members.length}):
                    <div className="mt-1">
                      {team.members.map((member) => (
                        <div key={member} className="flex items-center justify-between group">
                          <span>{member}</span>
                          {member === currentUser.username && !isCreator && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                  onClick={() => onLeaveTeam(team)}
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Leave team</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddPlayers(team)}
                  >
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  {isCreator && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTeam(team)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              {pendingInvites.length > 0 && (
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <h4 className="font-medium">Pending Invites:</h4>
                    <ul className="mt-1 space-y-1">
                      {pendingInvites.map((invite: any) => (
                        <li key={invite.id}>{invite.username}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <SearchPlayerDialog
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
      />
    </TooltipProvider>
  );
}
