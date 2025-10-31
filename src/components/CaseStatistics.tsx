import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Users } from 'lucide-react';

interface CaseStats {
  totalCases: number;
  activeCases: number;
  upcomingDeadlines: number;
  recentDocuments: number;
}

interface CaseStatisticsProps {
  stats: CaseStats;
}

export function CaseStatistics({ stats }: CaseStatisticsProps) {
  const statItems = [
    {
      title: 'Total Cases',
      value: stats.totalCases,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Cases',
      value: stats.activeCases,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      icon: Calendar,
      color: 'bg-orange-500',
    },
    {
      title: 'Recent Documents',
      value: stats.recentDocuments,
      icon: Clock,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {item.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${item.color}`}>
              <item.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}