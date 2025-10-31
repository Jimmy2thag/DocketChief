import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CaseAnalyticsProps {
  dateRange: string;
}

export function CaseAnalytics({ dateRange }: CaseAnalyticsProps) {
  const caseData = {
    winRates: {
      'Criminal Defense': 92,
      'Corporate Law': 85,
      'Family Law': 78,
      'Personal Injury': 94,
      'Real Estate': 88,
      'Immigration': 82
    },
    caseTypes: [
      { type: 'Criminal Defense', total: 45, won: 41, pending: 8 },
      { type: 'Corporate Law', total: 32, won: 27, pending: 12 },
      { type: 'Family Law', total: 28, won: 22, pending: 6 },
      { type: 'Personal Injury', total: 18, won: 17, pending: 4 },
      { type: 'Real Estate', total: 25, won: 22, pending: 7 },
      { type: 'Immigration', total: 22, won: 18, pending: 5 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rates by Practice Area */}
        <Card>
          <CardHeader>
            <CardTitle>Win Rates by Practice Area</CardTitle>
            <CardDescription>Success rates across different legal specialties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(caseData.winRates).map(([area, rate]) => (
              <div key={area} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{area}</span>
                  <span className="font-medium">{rate}%</span>
                </div>
                <Progress value={rate} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Case Analytics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Case Win Rate Visualization</CardTitle>
            <CardDescription>Visual representation of success rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758954133313_7438cfa9.webp"
                alt="Case win rate analytics chart"
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Case Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Case Statistics by Practice Area</CardTitle>
          <CardDescription>Detailed breakdown of cases won, lost, and pending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Practice Area</th>
                  <th className="text-right p-2">Total Cases</th>
                  <th className="text-right p-2">Won</th>
                  <th className="text-right p-2">Lost</th>
                  <th className="text-right p-2">Pending</th>
                  <th className="text-right p-2">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {caseData.caseTypes.map((item) => {
                  const lost = item.total - item.won - item.pending;
                  const winRate = ((item.won / (item.total - item.pending)) * 100).toFixed(1);
                  
                  return (
                    <tr key={item.type} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{item.type}</td>
                      <td className="text-right p-2">{item.total}</td>
                      <td className="text-right p-2 text-green-600">{item.won}</td>
                      <td className="text-right p-2 text-red-600">{lost}</td>
                      <td className="text-right p-2 text-blue-600">{item.pending}</td>
                      <td className="text-right p-2 font-medium">{winRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Case Outcomes Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Case Outcomes</CardTitle>
            <CardDescription>Trend analysis of case resolutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758954135031_c1133eda.webp"
                alt="Monthly case outcomes trend"
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Duration Analysis</CardTitle>
            <CardDescription>Average time to resolution by case type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseData.caseTypes.slice(0, 4).map((item, index) => {
                const avgDays = [120, 180, 95, 210][index];
                return (
                  <div key={item.type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{item.type}</span>
                    <span className="text-blue-600 font-bold">{avgDays} days</span>
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