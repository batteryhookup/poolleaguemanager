
import { Button } from "@/components/ui/button";
import { Crown, Trash2 } from "lucide-react";
import { Team } from "../../types/team";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamPlayerListProps {
  team: Team;
  currentUser: { username: string };
  isCreator: boolean;
  isPendingNewCaptain: boolean;
  onRemovePlayer: (team: Team, player: string) => void;
  onLeaveTeam: (team: Team) => void;
  onAcceptCaptain: (team: Team) => void;
}

export function TeamPlayerList({
  team,
  currentUser,
  isCreator,
  isPendingNewCaptain,
  onRemovePlayer,
  onLeaveTeam,
  onAcceptCaptain,
}: TeamPlayerListProps) {
  return (
    <div className="text-sm text-muted-foreground mt-2">
      Members ({team.members.length}):
      <div className="mt-1">
        {team.members.map((member) => (
          <div key={member} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <span>{member}</span>
              {team.createdBy === member && (
                <Tooltip>
                  <TooltipTrigger>
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Team Captain</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {isPendingNewCaptain && member === currentUser.username && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAcceptCaptain(team)}
                  className="h-7 text-xs"
                >
                  Accept Captain Role
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {isCreator && member !== currentUser.username && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => onRemovePlayer(team, member)}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove player</p>
                  </TooltipContent>
                </Tooltip>
              )}
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
          </div>
        ))}
      </div>
    </div>
  );
}

