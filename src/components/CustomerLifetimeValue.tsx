import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

interface CustomerLifetimeValueProps {
  averageClv: number;
  averageLifespan: number;
  clvByPlan: Array<{ plan: string; clv: number; customers: number }>;
  cohortData: Array<{ cohort: string; clv: number; retention: number }>;
}

export function CustomerLifetimeValue({ 
  averageClv, 
  averageLifespan, 
  clvByPlan,
  cohortData 
}: CustomerLifetimeValueProps) {
  return (
    <div className="space-y-6">
      {/* CLV Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average CLV</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${averageClv.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per customer lifetime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Lifespan</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{averageLifespan} months</div>
            <p className="text-xs text-muted-foreground">Customer retention period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CLV:CAC Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">3.2:1</div>
            <p className="text-xs text-muted-foreground">Healthy ratio (3:1 target)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CLV by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Lifetime Value by Plan</CardTitle>
            <CardDescription>Average CLV and customer count per subscription tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clvByPlan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="clv" fill="#3b82f6" name="CLV ($)" />
                <Bar yAxisId="right" dataKey="customers" fill="#8b5cf6" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cohort Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cohort Analysis</CardTitle>
            <CardDescription>CLV and retention by signup cohort</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cohortData.map((cohort) => (
                <div key={cohort.cohort} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{cohort.cohort}</span>
                    <span className="text-green-600 font-bold">${cohort.clv.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${cohort.retention}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{cohort.retention}% retained</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}