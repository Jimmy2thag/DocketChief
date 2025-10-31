import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, MapPin, Users, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface Case {
  id: string;
  title: string;
  case_number: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  initialDate?: Date;
}

export function EventCreationModal({ 
  isOpen, 
  onClose, 
  onEventCreated,
  initialDate = new Date()
}: EventCreationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    start_date: initialDate,
    start_time: '09:00',
    end_date: initialDate,
    end_time: '10:00',
    location: '',
    is_all_day: false,
    case_id: '',
    client_id: '',
    reminder_minutes: 15,
    attendees: ''
  });

  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCasesAndClients();
    }
  }, [isOpen]);

  const fetchCasesAndClients = async () => {
    try {
      const [casesResult, clientsResult] = await Promise.all([
        supabase.from('cases').select('id, title, case_number').limit(50),
        supabase.from('clients').select('id, name, email').limit(50)
      ]);

      if (casesResult.data) setCases(casesResult.data);
      if (clientsResult.data) setClients(clientsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(formData.start_date);
      const endDateTime = new Date(formData.end_date);

      if (!formData.is_all_day) {
        const [startHour, startMinute] = formData.start_time.split(':');
        const [endHour, endMinute] = formData.end_time.split(':');
        
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute));
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute));
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: formData.location || null,
        is_all_day: formData.is_all_day,
        case_id: formData.case_id || null,
        client_id: formData.client_id || null,
        reminder_minutes: formData.reminder_minutes,
        attendees: formData.attendees ? formData.attendees.split(',').map(email => email.trim()) : []
      };

      const { error } = await supabase
        .from('calendar_events')
        .insert([eventData]);

      if (error) throw error;

      onEventCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'meeting',
      start_date: initialDate,
      start_time: '09:00',
      end_date: initialDate,
      end_time: '10:00',
      location: '',
      is_all_day: false,
      case_id: '',
      client_id: '',
      reminder_minutes: 15,
      attendees: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="court_date">Court Date</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="case_id">Related Case</Label>
              <Select
                value={formData.case_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, case_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map(case_ => (
                    <SelectItem key={case_.id} value={case_.id}>
                      {case_.case_number} - {case_.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_id">Related Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="is_all_day"
                checked={formData.is_all_day}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_all_day: checked }))}
              />
              <Label htmlFor="is_all_day">All Day Event</Label>
            </div>

            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.start_date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!formData.is_all_day && (
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
            )}

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.end_date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, end_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!formData.is_all_day && (
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location (optional)"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="reminder_minutes">Reminder</Label>
              <Select
                value={formData.reminder_minutes.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reminder_minutes: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No reminder</SelectItem>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="attendees">Attendees</Label>
              <Input
                id="attendees"
                value={formData.attendees}
                onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
                placeholder="Email addresses, separated by commas"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}