import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Settings,
  Bell,
  ExternalLink
} from 'lucide-react';
import { CalendarView } from './CalendarView';
import { EventCreationModal } from './EventCreationModal';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_all_day: boolean;
  status: string;
  case_id?: string;
  client_id?: string;
}

interface UpcomingEvent extends CalendarEvent {
  case_title?: string;
  client_name?: string;
}

export function CalendarDashboard() {
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [todayEvents, setTodayEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          cases(title),
          clients(name)
        `)
        .gte('start_time', today.toISOString())
        .lte('start_time', nextWeek.toISOString())
        .order('start_time')
        .limit(10);

      if (error) throw error;

      const events = (data || []).map(event => ({
        ...event,
        case_title: event.cases?.title,
        client_name: event.clients?.name
      }));

      setUpcomingEvents(events);
      setTodayEvents(events.filter(event => isToday(new Date(event.start_time))));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    fetchUpcomingEvents();
    setShowEventModal(false);
  };

  const handleCreateEvent = (date?: Date) => {
    if (date) setSelectedDate(date);
    setShowEventModal(true);
  };

  const handleViewChange = (value: string) => {
    if (value === 'month' || value === 'week' || value === 'day') {
      setCurrentView(value);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      court_date: 'bg-red-100 text-red-800 border-red-200',
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      deadline: 'bg-orange-100 text-orange-800 border-orange-200',
      appointment: 'bg-green-100 text-green-800 border-green-200',
      consultation: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatEventTime = (event: UpcomingEvent) => {
    if (event.is_all_day) return 'All day';
    return `${format(new Date(event.start_time), 'h:mm a')} - ${format(new Date(event.end_time), 'h:mm a')}`;
  };

  const getEventDateLabel = (date: string) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return 'Today';
    if (isTomorrow(eventDate)) return 'Tomorrow';
    return format(eventDate, 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Manage your schedule and appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => handleCreateEvent()}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Tabs value={currentView} onValueChange={handleViewChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
            <TabsContent value="month" className="mt-4">
              <CalendarView
                view="month"
                onCreateEvent={handleCreateEvent}
                onEventClick={(event) => console.log('Event clicked:', event)}
              />
            </TabsContent>
            <TabsContent value="week" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Week view coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="day" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Day view coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : todayEvents.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No events today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(event => (
                    <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatEventTime(event)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                        {event.case_title && (
                          <div className="text-blue-600">
                            Case: {event.case_title}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="font-medium">
                          {getEventDateLabel(event.start_time)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatEventTime(event)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                        {event.case_title && (
                          <div className="text-blue-600">
                            Case: {event.case_title}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleCreateEvent()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleCreateEvent()}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Add Court Date
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => console.log('External calendar integration')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Sync External Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <EventCreationModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onEventCreated={handleEventCreated}
        initialDate={selectedDate}
      />
    </div>
  );
}
