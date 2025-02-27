
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Team } from "../../types/team";
import { TeamPlayerList } from "./TeamPlayerList";

interface TeamCardProps {
  team: Team;
  currentUser: { username: string };
  isCreator: boolean;
  isPendingNewCaptain: boolean;
  pendingInvites: any[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
  onRemovePlayer: (team: Team, player: string) => void;
  onLeaveTeam: (team: Team) => void;
  onAcceptCaptain: (team: Team) => void;
}

export function TeamCard({
  team,
  currentUser,
  isCreator,
  isPendingNewCaptain,
  pendingInvites,
  onEditTeam,
  onDeleteTeam,
  onRemovePlayer,
  onLeaveTeam,
  onAcceptCaptain,
}: TeamCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{team.name}</CardTitle>
          {isCreator && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditTeam(team)}
              className="mt-2"
            >
              Edit Team
            </Button>
          )}
          <TeamPlayerList
            team={team}
            currentUser={currentUser}
            isCreator={isCreator}
            isPendingNewCaptain={isPendingNewCaptain}
            onRemovePlayer={onRemovePlayer}
            onLeaveTeam={onLeaveTeam}
            onAcceptCaptain={onAcceptCaptain}
          />
        </div>
        {isCreator && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteTeam(team)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
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
}

