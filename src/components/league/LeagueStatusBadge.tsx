import { Badge } from "@/components/ui/badge";
import { parseISO } from "date-fns";
import { LeagueSession } from "@/components/account/types/league";

interface LeagueStatusBadgeProps {
  session: LeagueSession;
}

export const LeagueStatusBadge = ({ session }: LeagueStatusBadgeProps) => {
  if (!session.schedule || session.schedule.length === 0) return null;

  const now = new Date();
  const firstSession = parseISO(`${session.schedule[0].date}T${session.schedule[0].startTime}`);
  const lastSession = parseISO(`${session.schedule[session.schedule.length - 1].date}T${session.schedule[session.schedule.length - 1].endTime}`);

  if (now > lastSession) {
    return <Badge variant="secondary">Ended</Badge>;
  } else if (now < firstSession) {
    return <Badge variant="default">Upcoming</Badge>;
  } else {
    return <Badge variant="default" className="bg-green-500">Ongoing</Badge>;
  }
};
