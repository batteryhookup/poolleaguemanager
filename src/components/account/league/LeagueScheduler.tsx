import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format, addWeeks, isSameDay, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trash2 } from "lucide-react";

interface LeagueSchedulerProps {
  onScheduleChange: (schedule: { date: string; startTime: string; endTime: string; }[]) => void;
  initialSchedule?: { date: string; startTime: string; endTime: string; }[];
}

export function LeagueScheduler({ onScheduleChange, initialSchedule = [] }: LeagueSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("22:00");
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [weeks, setWeeks] = useState("8");
  const [schedule, setSchedule] = useState<{ date: string; startTime: string; endTime: string; }[]>(initialSchedule);

  useEffect(() => {
    setSchedule(initialSchedule);
  }, [initialSchedule]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setShowTimeDialog(true);
  };

  const handleAddSession = (recurring: boolean = false) => {
    if (!selectedDate) return;

    let newSchedule = [...schedule];
    const baseSession = {
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime,
      endTime,
    };

    if (recurring) {
      const numWeeks = parseInt(weeks);
      for (let i = 0; i < numWeeks; i++) {
        const date = addWeeks(selectedDate, i);
        newSchedule.push({
          ...baseSession,
          date: format(date, "yyyy-MM-dd"),
        });
      }
    } else {
      newSchedule.push(baseSession);
    }

    // Sort sessions by date
    newSchedule.sort((a, b) => a.date.localeCompare(b.date));
    
    console.log('Adding session(s):', newSchedule);
    // Update both local state and parent component
    setSchedule(newSchedule);
    onScheduleChange(newSchedule);
    
    // Reset dialogs and selected date
    setShowTimeDialog(false);
    setShowRecurringDialog(false);
    setSelectedDate(undefined);
  };

  const removeSession = (sessionDate: string) => {
    const newSchedule = schedule.filter(session => session.date !== sessionDate);
    setSchedule(newSchedule);
    onScheduleChange(newSchedule);
  };

  const isDateSelected = (date: Date) => {
    return schedule.some(session => 
      isSameDay(parseISO(session.date), date)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            modifiers={{ selected: isDateSelected }}
            modifiersClassNames={{
              selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            }}
          />
        </div>
        <div className="flex-1">
          <ScrollArea className="h-[350px] rounded-md border p-4">
            <div className="space-y-2">
              <h4 className="font-medium">Scheduled Sessions</h4>
              {schedule.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions scheduled</p>
              ) : (
                schedule.map((session) => (
                  <div
                    key={session.date}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {format(parseISO(session.date), "EEE, MMM d, yyyy")}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSession(session.date)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Session Time</DialogTitle>
            <DialogDescription>
              Select the start and end time for this session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowTimeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowTimeDialog(false);
              setShowRecurringDialog(true);
            }}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRecurringDialog} onOpenChange={setShowRecurringDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recurring Sessions</DialogTitle>
            <DialogDescription>
              Would you like this session to repeat weekly?
            </DialogDescription>
          </DialogHeader>
          {selectedDate && (
            <div className="space-y-4">
              <p className="text-sm">
                First session: {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
              <div className="space-y-2">
                <Label htmlFor="weeks">Number of Weeks</Label>
                <Input
                  id="weeks"
                  type="number"
                  min="1"
                  max="52"
                  value={weeks}
                  onChange={(e) => setWeeks(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleAddSession(false)}>
              One Day Only
            </Button>
            <Button onClick={() => handleAddSession(true)}>
              Yes, Make It Weekly
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
