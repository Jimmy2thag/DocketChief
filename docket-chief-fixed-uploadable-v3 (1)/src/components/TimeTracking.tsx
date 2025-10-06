import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, Users } from 'lucide-react';

interface TimeTrackingProps {
  dateRange: string;
}

export function TimeTracking({ dateRange }: TimeTrackingProps) {
  const timeData = {
    totalHours: 1247,
    billableHours: 1089,
    billableRate: 87.3,
    practiceAreas: [
      { area: 'Criminal Defense', hours: 342, percentage: 27.4, rate: '$450/hr' },
      { area: 'Corporate Law', hours: 298, percentage: 23.9, rate: '$525/hr' },
      { area: 'Family Law', hours: 187, percentage: 15.0, rate: '$375/hr' },
      { area: 'Personal Injury', hours: 156, percentage: 12.5, rate: '$400/hr' },
      { area: 'Real Estate', hours: 143, percentage: 11.5, rate: '$350/hr' },
      { area: 'Immigration', hours: 121, percentage: 9.7, rate: '$325/hr' }
    ],
    attorneys: [
      { name: 'Sarah Johnson', hours: 186, billable: 162, efficiency: 87 },
      { name: 'Michael Chen', hours: 174, billable: 155, efficiency: 89 },
      { name: 'Emily Rodriguez', hours: 168, billable: 142, efficiency: 85 },
      { name: 'David Thompson', hours: 159, billable: 138, efficiency: 87 },
      { name: 'Lisa Anderson', hours: 152, billable: 129, efficiency: 85 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Time Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{timeData.totalHours}</div>
            <p className="text-xs text-muted-foreground">Across all practice areas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{timeData.billableHours}</div>
            <p className="text-xs text-muted-foreground">{timeData.billableRate}% billable rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Efficiency</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">86.8%</div>
            <p className="text-xs text-muted-foreground">Team-wide average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time by Practice Area */}
        <Card>
          <CardHeader>
            <CardTitle>Time Distribution by Practice Area</CardTitle>
            <CardDescription>Hours logged across different legal specialties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeData.practiceAreas.map((area) => (
              <div key={area.area} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{area.area}</span>
                  <span className="font-medium">{area.hours}h ({area.percentage}%)</span>
                </div>
                <Progress value={area.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  Avg Rate: {area.rate}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Time Tracking Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking Visualization</CardTitle>
            <CardDescription>Visual breakdown of time allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758954137457_6dda9e01.webp"
                alt="Time tracking analytics chart"
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attorney Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Attorney Time Tracking Performance</CardTitle>
          <CardDescription>Individual attorney efficiency and billable hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Attorney</th>
                  <th className="text-right p-2">Total Hours</th>
                  <th className="text-right p-2">Billable Hours</th>
                  <th className="text-right p-2">Non-Billable</th>
                  <th className="text-right p-2">Efficiency</th>
                  <th className="text-right p-2">Avg Daily Hours</th>
                </tr>
              </thead>
              <tbody>
                {timeData.attorneys.map((attorney) => {
                  const nonBillable = attorney.hours - attorney.billable;
                  const avgDaily = (attorney.hours / 30).toFixed(1);
                  
                  return (
                    <tr key={attorney.name} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{attorney.name}</td>
                      <td className="text-right p-2">{attorney.hours}</td>
                      <td className="text-right p-2 text-green-600">{attorney.billable}</td>
                      <td className="text-right p-2 text-gray-600">{nonBillable}</td>
                      <td className="text-right p-2">
                        <span className={`font-medium ${attorney.efficiency >= 87 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {attorney.efficiency}%
                        </span>
                      </td>
                      <td className="text-right p-2">{avgDaily}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Time Tracking Trends</CardTitle>
          <CardDescription>Time allocation patterns over the past weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758954139197_3d63cfb5.webp"
              alt="Weekly time tracking trends"
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}