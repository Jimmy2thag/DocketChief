import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Users, 
  Clock, 
  MessageSquare,
  Upload,
  Search
} from 'lucide-react';

interface QuickActionsProps {
  onCreateCase: () => void;
  onUploadDocument: () => void;
  onScheduleEvent: () => void;
  onAddClient: () => void;
}

export function QuickActions({ 
  onCreateCase, 
  onUploadDocument, 
  onScheduleEvent, 
  onAddClient 
}: QuickActionsProps) {
  const actions = [
    {
      title: 'New Case',
      description: 'Create a new legal case',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onCreateCase,
    },
    {
      title: 'Upload Document',
      description: 'Add documents to a case',
      icon: Upload,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onUploadDocument,
    },
    {
      title: 'Schedule Event',
      description: 'Add calendar event',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onScheduleEvent,
    },
    {
      title: 'Add Client',
      description: 'Register new client',
      icon: Users,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: onAddClient,
    },
    {
      title: 'Time Entry',
      description: 'Log billable hours',
      icon: Clock,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => console.log('Time entry'),
    },
    {
      title: 'Send Message',
      description: 'Contact team or client',
      icon: MessageSquare,
      color: 'bg-pink-500 hover:bg-pink-600',
      onClick: () => console.log('Send message'),
    },
    {
      title: 'Search Cases',
      description: 'Find cases quickly',
      icon: Search,
      color: 'bg-teal-500 hover:bg-teal-600',
      onClick: () => console.log('Search cases'),
    },
    {
      title: 'Generate Brief',
      description: 'AI-powered brief creation',
      icon: FileText,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => console.log('Generate brief'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto p-4 flex flex-col items-center space-y-2 ${action.color} text-white hover:text-white transition-colors`}
              onClick={action.onClick}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="text-sm font-semibold">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}