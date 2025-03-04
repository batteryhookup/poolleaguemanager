import { useState } from "react";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { LeagueSession } from "@/components/account/types/league";

interface LeagueScheduleDisplayProps {
  session: LeagueSession;
  timezone?: string;
}

export function LeagueScheduleDisplay({ session, timezone = "America/New_York" }: LeagueScheduleDisplayProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  if (!session.schedule || session.schedule.length === 0) {
    return null;
  }

  const firstDate = parseISO(session.schedule[0].date);
  const lastDate = parseISO(session.schedule[session.schedule.length - 1].date);
  const isSingleDay = session.schedule.length === 1;
  
  // Convert times to selected timezone
  const formatTimeToZone = (time: string, includeZone: boolean = false) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    return formatInTimeZone(date, timezone, includeZone ? 'h:mm a z' : 'h:mm a');
  };

  const timeRange = `${formatTimeToZone(session.schedule[0].startTime)} - ${formatTimeToZone(session.schedule[0].endTime)} ${formatTimeToZone(session.schedule[0].startTime, true).split(' ')[2]}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowCalendar(true)}
          className="h-8 w-8"
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {isSingleDay
              ? format(firstDate, "EEEE, MMMM d, yyyy")
              : `${format(firstDate, "MMM d")} - ${format(lastDate, "MMM d, yyyy")}`}
          </span>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {timeRange}
          </div>
        </div>
      </div>

      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>League Schedule</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Calendar
                mode="single"
                selected={firstDate}
                disabled={(date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  return !session.schedule.some(s => s.date === dateStr);
                }}
                modifiers={{ selected: (date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  return session.schedule.some(s => s.date === dateStr);
                }}}
                modifiersClassNames={{
                  selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                }}
              />
            </div>
            <ScrollArea className="h-[350px] rounded-md border p-4">
              <div className="space-y-2">
                <h4 className="font-medium">All Sessions</h4>
                {session.schedule.map((s) => (
                  <div
                    key={s.date}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {format(parseISO(s.date), "EEEE, MMMM d, yyyy")}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {formatTimeToZone(s.startTime)} - {formatTimeToZone(s.endTime)} {formatTimeToZone(s.startTime, true).split(' ')[2]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
