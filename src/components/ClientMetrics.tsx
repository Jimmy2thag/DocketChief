import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Star, DollarSign } from 'lucide-react';

interface ClientMetricsProps {
  dateRange: string;
}

export function ClientMetrics({ dateRange }: ClientMetricsProps) {
  const clientData = {
    totalClients: 156,
    newClients: 23,
    retainedClients: 142,
    retentionRate: 91.0,
    acquisitionSources: [
      { source: 'Referrals', count: 45, percentage: 28.8 },
      { source: 'Website/SEO', count: 38, percentage: 24.4 },
      { source: 'Social Media', count: 22, percentage: 14.1 },
      { source: 'Previous Clients', count: 19, percentage: 12.2 },
      { source: 'Legal Directories', count: 16, percentage: 10.3 },
      { source: 'Networking Events', count: 16, percentage: 10.3 }
    ],
    satisfactionRatings: [
      { rating: 5, count: 89, percentage: 67.4 },
      { rating: 4, count: 28, percentage: 21.2 },
      { rating: 3, count: 12, percentage: 9.1 },
      { rating: 2, count: 2, percentage: 1.5 },
      { rating: 1, count: 1, percentage: 0.8 }
    ],
    practiceAreaClients: [
      { area: 'Criminal Defense', clients: 42, avgValue: 8500 },
      { area: 'Corporate Law', clients: 28, avgValue: 15200 },
      { area: 'Family Law', clients: 31, avgValue: 6800 },
      { area: 'Personal Injury', clients: 19, avgValue: 22000 },
      { area: 'Real Estate', clients: 24, avgValue: 4200 },
      { area: 'Immigration', clients: 12, avgValue: 3800 }
    ]
  };

  const avgSatisfaction = (
    clientData.satisfactionRatings.reduce((sum, rating) => sum + (rating.rating * rating.count), 0) /
    clientData.satisfactionRatings.reduce((sum, rating) => sum + rating.count, 0)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Client Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clientData.totalClients}</div>
            <p className="text-xs text-muted-foreground">+{clientData.newClients} new this period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientData.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">{clientData.retainedClients} retained clients</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{avgSatisfaction}/5.0</div>
            <p className="text-xs text-muted-foreground">Based on 132 reviews</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Client Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$9,850</div>
            <p className="text-xs text-muted-foreground">Lifetime value per client</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Acquisition Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Client Acquisition Sources</CardTitle>
            <CardDescription>How new clients are finding your practice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientData.acquisitionSources.map((source) => (
              <div key={source.source} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{source.source}</span>
                  <span className="font-medium">{source.count} ({source.percentage}%)</span>
                </div>
                <Progress value={source.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Client Satisfaction Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>Client Satisfaction Ratings</CardTitle>
            <CardDescription>Distribution of client feedback scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientData.satisfactionRatings.map((rating) => (
              <div key={rating.rating} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span>{rating.rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <span className="font-medium">{rating.count} ({rating.percentage}%)</span>
                </div>
                <Progress value={rating.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Clients by Practice Area */}
      <Card>
        <CardHeader>
          <CardTitle>Clients by Practice Area</CardTitle>
          <CardDescription>Client distribution and average case values across practice areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Practice Area</th>
                  <th className="text-right p-2">Active Clients</th>
                  <th className="text-right p-2">Avg Case Value</th>
                  <th className="text-right p-2">Total Revenue</th>
                  <th className="text-right p-2">% of Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {clientData.practiceAreaClients.map((area) => {
                  const totalRevenue = area.clients * area.avgValue;
                  const percentage = ((area.clients / clientData.totalClients) * 100).toFixed(1);
                  
                  return (
                    <tr key={area.area} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{area.area}</td>
                      <td className="text-right p-2">{area.clients}</td>
                      <td className="text-right p-2">${area.avgValue.toLocaleString()}</td>
                      <td className="text-right p-2 text-green-600">
                        ${totalRevenue.toLocaleString()}
                      </td>
                      <td className="text-right p-2">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Client Growth Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Acquisition Trends</CardTitle>
            <CardDescription>Monthly new client acquisition over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['January', 'February', 'March', 'April', 'May', 'June'].map((month, index) => {
                const clients = [18, 22, 19, 25, 21, 23][index];
                const maxClients = 25;
                const percentage = (clients / maxClients) * 100;
                
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{month}</span>
                      <span className="font-medium">{clients} new clients</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Retention Analysis</CardTitle>
            <CardDescription>Client retention rates by practice area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientData.practiceAreaClients.slice(0, 4).map((area, index) => {
                const retentionRate = [94, 88, 92, 96][index];
                
                return (
                  <div key={area.area} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{area.area}</span>
                    <span className={`font-bold ${retentionRate >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {retentionRate}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}