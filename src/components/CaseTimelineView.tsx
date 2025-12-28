import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, MessageSquare, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface TimelineEvent {
  id: string;
  event_type: string;
  title: string;
  description: string;
  event_date: string;
  created_at: string;
}

interface CaseTimelineViewProps {
  caseId: string;
}

export function CaseTimelineView({ caseId }: CaseTimelineViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimelineEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('case_events')
        .select('*')
        .eq('case_id', caseId)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchTimelineEvents();
  }, [fetchTimelineEvents]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'document':
        return FileText;
      case 'meeting':
        return Calendar;
      case 'deadline':
        return Clock;
      case 'note':
        return MessageSquare;
      default:
        return Calendar;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'document':
        return 'bg-blue-500';
      case 'meeting':
        return 'bg-green-500';
      case 'deadline':
        return 'bg-red-500';
      case 'note':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Case Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Case Timeline</CardTitle>
        <Button size="sm" onClick={() => console.log('Add event')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No timeline events yet</p>
              <p className="text-sm">Events will appear here as the case progresses</p>
            </div>
          ) : (
            events.map((event, index) => {
              const Icon = getEventIcon(event.event_type);
              const colorClass = getEventColor(event.event_type);
              
              return (
                <div key={event.id} className="flex space-x-4">
                  <div className="relative">
                    <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {index < events.length - 1 && (
                      <div className="absolute top-10 left-5 w-0.5 h-6 bg-gray-200"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.event_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
