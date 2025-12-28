import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  Users,
  Plus
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
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

interface CalendarViewProps {
  view?: 'month' | 'week' | 'day';
  onEventClick?: (event: CalendarEvent) => void;
  onCreateEvent?: (date: Date) => void;
}

export function CalendarView({ 
  view = 'month', 
  onEventClick,
  onCreateEvent 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .order('start_time');

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      court_date: 'bg-red-500 text-white',
      meeting: 'bg-blue-500 text-white',
      deadline: 'bg-orange-500 text-white',
      appointment: 'bg-green-500 text-white',
      consultation: 'bg-purple-500 text-white'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => onCreateEvent?.(new Date())}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map(date => {
            const dayEvents = getEventsForDay(date);
            const isToday = isSameDay(date, new Date());
            const isCurrentMonth = isSameMonth(date, currentDate);

            return (
              <div
                key={date.toISOString()}
                className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                onClick={() => onCreateEvent?.(date)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(date, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer ${
                        getEventTypeColor(event.event_type)
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      {event.is_all_day ? (
                        event.title
                      ) : (
                        `${format(new Date(event.start_time), 'HH:mm')} ${event.title}`
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
