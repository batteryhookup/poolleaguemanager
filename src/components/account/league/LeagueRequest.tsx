
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, UserCheck, UserX, Users } from "lucide-react";

export interface LeagueRequest {
  id: number;
  leagueId: number;
  requestType: "player" | "team";
  username: string;
  teamId: string | null;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
}

interface LeagueRequestProps {
  request: LeagueRequest;
  expanded: boolean;
  teamName: string;
  teamMembers: string[];
  onToggleExpand: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export function LeagueRequest({
  request,
  expanded,
  teamName,
  teamMembers,
  onToggleExpand,
  onAccept,
  onReject,
}: LeagueRequestProps) {
  if (request.requestType === "team") {
    return (
      <Collapsible open={expanded} onOpenChange={onToggleExpand} className="w-full">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Team: {teamName}</span>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </Button>
          </CollapsibleTrigger>
          <ActionButtons onAccept={onAccept} onReject={onReject} />
        </div>
        <CollapsibleContent className="mt-2">
          <div className="pl-6 space-y-1">
            <p className="text-sm text-muted-foreground">Team Members:</p>
            {teamMembers.map((member) => (
              <p key={member} className="text-sm pl-2">{member}</p>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <span className="font-medium">Player: {request.username}</span>
      <ActionButtons onAccept={onAccept} onReject={onReject} />
    </div>
  );
}

function ActionButtons({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onAccept}>
              <UserCheck className="h-4 w-4 text-green-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Accept request</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onReject}>
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decline request</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
