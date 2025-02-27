
import { format, parseISO } from "date-fns";
import { LeagueScheduleDisplayProps } from "./types";

export const LeagueScheduleDisplay = ({ league }: LeagueScheduleDisplayProps) => {
  if (!league.schedule || league.schedule.length === 0) {
    return <>No schedule available</>;
  }

  const firstSession = parseISO(`${league.schedule[0].date}T${league.schedule[0].startTime}`);
  const lastSession = parseISO(`${league.schedule[league.schedule.length - 1].date}T${league.schedule[league.schedule.length - 1].endTime}`);
  const dayOfWeek = format(firstSession, "EEEE");
  const timeOfDay = parseInt(league.schedule[0].startTime.split(":")[0]) < 17 ? "afternoons" : "nights";
  
  const dateRange = `${format(firstSession, "MMM d, yyyy")} - ${format(lastSession, "MMM d, yyyy")}`;
  
  if (firstSession > new Date()) {
    const startingIn = format(firstSession, "'Starting' MMM d, yyyy");
    return <>{`${dayOfWeek} ${timeOfDay}, ${startingIn}`}</>;
  }

  return <>{`${dayOfWeek} ${timeOfDay}, ${dateRange}`}</>;
};
