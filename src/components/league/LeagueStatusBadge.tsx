
import { Badge } from "@/components/ui/badge";
import { parseISO } from "date-fns";
import { LeagueStatusBadgeProps } from "./types";

export const LeagueStatusBadge = ({ league }: LeagueStatusBadgeProps) => {
  if (!league.schedule || league.schedule.length === 0) return null;

  const now = new Date();
  const firstSession = parseISO(`${league.schedule[0].date}T${league.schedule[0].startTime}`);
  const lastSession = parseISO(`${league.schedule[league.schedule.length - 1].date}T${league.schedule[league.schedule.length - 1].endTime}`);

  if (now > lastSession) {
    return <Badge variant="secondary">Ended</Badge>;
  } else if (now < firstSession) {
    return <Badge variant="default">Upcoming</Badge>;
  } else {
    return <Badge variant="default" className="bg-green-500">Ongoing</Badge>;
  }
};
