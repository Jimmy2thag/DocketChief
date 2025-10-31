import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface Deadline {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  case_id: string;
  case_title: string;
  completed: boolean;
}

export function DeadlinesList() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .select(`
          *,
          cases(title)
        `)
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      
      const formattedDeadlines = data?.map(deadline => ({
        ...deadline,
        case_title: deadline.cases?.title || 'Unknown Case'
      })) || [];
      
      setDeadlines(formattedDeadlines);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUrgencyStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const tomorrow = addDays(now, 1);
    const nextWeek = addDays(now, 7);

    if (isBefore(due, now)) {
      return { status: 'overdue', color: 'text-red-600', icon: AlertTriangle };
    } else if (isBefore(due, tomorrow)) {
      return { status: 'due-today', color: 'text-orange-600', icon: Clock };
    } else if (isBefore(due, nextWeek)) {
      return { status: 'due-soon', color: 'text-yellow-600', icon: Calendar };
    } else {
      return { status: 'upcoming', color: 'text-gray-600', icon: Calendar };
    }
  };

  const markCompleted = async (deadlineId: string) => {
    try {
      const { error } = await supabase
        .from('deadlines')
        .update({ completed: true })
        .eq('id', deadlineId);

      if (error) throw error;
      
      setDeadlines(prev => prev.filter(d => d.id !== deadlineId));
    } catch (error) {
      console.error('Error marking deadline as completed:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
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
        <CardTitle>Upcoming Deadlines</CardTitle>
        <Button size="sm" onClick={() => console.log('Add deadline')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Deadline
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming deadlines</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            deadlines.map((deadline) => {
              const urgency = getUrgencyStatus(deadline.due_date);
              const UrgencyIcon = urgency.icon;
              
              return (
                <div key={deadline.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(deadline.priority)} mt-2`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {deadline.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <UrgencyIcon className={`h-4 w-4 ${urgency.color}`} />
                        <Badge variant="outline" className="text-xs">
                          {deadline.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{deadline.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{deadline.case_title}</span>
                        <span>•</span>
                        <span className={urgency.color}>
                          Due {format(new Date(deadline.due_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => markCompleted(deadline.id)}
                        className="text-xs"
                      >
                        Mark Complete
                      </Button>
                    </div>
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