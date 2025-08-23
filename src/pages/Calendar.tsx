import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Clock, BookOpen, Target } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCalendarEvents, useUpcomingEvents, useCreateCalendarEvent } from "@/hooks/useCalendar";
import { useCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_time: "",
    event_type: "personal" as const,
    course_id: ""
  });

  const { data: events } = useCalendarEvents(selectedDate);
  const { data: upcomingEvents } = useUpcomingEvents();
  const { data: courses } = useCourses();
  const createEvent = useCreateCalendarEvent();
  const { toast } = useToast();

  const handleCreateEvent = async () => {
    if (!selectedDate || !newEvent.title) return;

    try {
      await createEvent.mutateAsync({
        title: newEvent.title,
        description: newEvent.description,
        event_date: selectedDate.toISOString().split('T')[0],
        event_time: newEvent.event_time || undefined,
        event_type: newEvent.event_type,
        course_id: newEvent.course_id || undefined
      });

      setIsCreateEventOpen(false);
      setNewEvent({
        title: "",
        description: "",
        event_time: "",
        event_type: "personal",
        course_id: ""
      });

      toast({
        title: "Event created",
        description: "Your event has been successfully created."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <Target className="h-4 w-4" />;
      case 'session': return <Clock className="h-4 w-4" />;
      case 'reminder': return <CalendarIcon className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getEventTypeBadge = (type: string) => {
    const variants = {
      deadline: "destructive",
      session: "default",
      reminder: "secondary",
      personal: "outline"
    } as const;
    
    return variants[type as keyof typeof variants] || "outline";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your learning schedule and deadlines
            </p>
          </div>
          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({...prev, title: e.target.value}))}
                    placeholder="Event title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({...prev, description: e.target.value}))}
                    placeholder="Event description (optional)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent(prev => ({...prev, event_time: e.target.value}))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent(prev => ({...prev, event_type: value as any}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="session">Study Session</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newEvent.event_type !== "personal" && (
                  <div className="grid gap-2">
                    <Label htmlFor="course">Course (Optional)</Label>
                    <Select value={newEvent.course_id} onValueChange={(value) => setNewEvent(prev => ({...prev, course_id: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} disabled={!newEvent.title}>
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Learning Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border w-full"
                />
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            {selectedDate && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>
                    Events for {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {events && events.length > 0 ? (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                          <div className="flex items-center space-x-2">
                            {getEventTypeIcon(event.event_type)}
                            <span className="font-medium">{event.title}</span>
                          </div>
                          <Badge variant={getEventTypeBadge(event.event_type)}>
                            {event.event_type}
                          </Badge>
                          {event.event_time && (
                            <span className="text-sm text-muted-foreground">
                              {event.event_time}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No events scheduled for this date
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upcoming Events */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="space-y-1 p-3 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(event.event_type)}
                          <span className="font-medium text-sm">{event.title}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.event_date), "MMM d")}
                            {event.event_time && ` at ${event.event_time}`}
                          </span>
                          <Badge variant={getEventTypeBadge(event.event_type)} className="text-xs">
                            {event.event_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    No upcoming events
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}