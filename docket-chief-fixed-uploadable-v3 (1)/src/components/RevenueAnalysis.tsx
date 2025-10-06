import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Target, CreditCard } from 'lucide-react';

interface RevenueAnalysisProps {
  dateRange: string;
}

export function RevenueAnalysis({ dateRange }: RevenueAnalysisProps) {
  const revenueData = {
    totalRevenue: 1247850,
    monthlyGrowth: 12.3,
    yearlyGrowth: 18.7,
    targetRevenue: 1500000,
    practiceAreaRevenue: [
      { area: 'Corporate Law', revenue: 425600, percentage: 34.1, growth: 15.2 },
      { area: 'Criminal Defense', revenue: 312400, percentage: 25.0, growth: 8.7 },
      { area: 'Personal Injury', revenue: 287300, percentage: 23.0, growth: 22.1 },
      { area: 'Family Law', revenue: 134200, percentage: 10.8, growth: 5.3 },
      { area: 'Real Estate', revenue: 88350, percentage: 7.1, growth: -2.1 }
    ],
    monthlyRevenue: [
      { month: 'Jan', revenue: 98500, target: 100000 },
      { month: 'Feb', revenue: 102300, target: 100000 },
      { month: 'Mar', revenue: 95800, target: 100000 },
      { month: 'Apr', revenue: 108900, target: 105000 },
      { month: 'May', revenue: 112400, target: 105000 },
      { month: 'Jun', revenue: 118200, target: 110000 }
    ],
    paymentMethods: [
      { method: 'Bank Transfer', amount: 687200, percentage: 55.1 },
      { method: 'Credit Card', amount: 312400, percentage: 25.0 },
      { method: 'Check', amount: 187300, percentage: 15.0 },
      { method: 'Cash', amount: 60950, percentage: 4.9 }
    ]
  };

  const targetProgress = (revenueData.totalRevenue / revenueData.targetRevenue) * 100;

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${revenueData.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+{revenueData.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">vs previous month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">+{revenueData.yearlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">vs previous year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Progress</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{targetProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">of ${revenueData.targetRevenue.toLocaleString()} goal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Practice Area */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Practice Area</CardTitle>
            <CardDescription>Revenue distribution across legal specialties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueData.practiceAreaRevenue.map((area) => (
              <div key={area.area} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{area.area}</span>
                  <span className="font-medium">
                    ${area.revenue.toLocaleString()} ({area.percentage}%)
                  </span>
                </div>
                <Progress value={area.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Growth: {area.growth > 0 ? '+' : ''}{area.growth}%</span>
                  <span className={area.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {area.growth > 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Revenue breakdown by payment type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueData.paymentMethods.map((method) => (
              <div key={method.method} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>{method.method}</span>
                  </div>
                  <span className="font-medium">
                    ${method.amount.toLocaleString()} ({method.percentage}%)
                  </span>
                </div>
                <Progress value={method.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Performance</CardTitle>
          <CardDescription>Revenue vs targets over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Actual Revenue</th>
                  <th className="text-right p-2">Target</th>
                  <th className="text-right p-2">Variance</th>
                  <th className="text-right p-2">Performance</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.monthlyRevenue.map((month) => {
                  const variance = month.revenue - month.target;
                  const performance = (month.revenue / month.target) * 100;
                  
                  return (
                    <tr key={month.month} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{month.month}</td>
                      <td className="text-right p-2">${month.revenue.toLocaleString()}</td>
                      <td className="text-right p-2">${month.target.toLocaleString()}</td>
                      <td className={`text-right p-2 ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
                      </td>
                      <td className={`text-right p-2 font-medium ${performance >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {performance.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecasting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecasting</CardTitle>
            <CardDescription>Projected revenue for next 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                const projectedRevenue = [125000, 132000, 128000, 135000, 142000, 148000][index];
                const confidence = [85, 82, 78, 75, 72, 68][index];
                
                return (
                  <div key={month} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{month} 2024</span>
                      <div className="text-xs text-muted-foreground">
                        {confidence}% confidence
                      </div>
                    </div>
                    <span className="text-blue-600 font-bold">
                      ${projectedRevenue.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Revenue Generators</CardTitle>
            <CardDescription>Highest value cases and clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { client: 'TechCorp Inc.', amount: 85000, type: 'Corporate Law' },
                { client: 'Johnson vs State', amount: 72000, type: 'Criminal Defense' },
                { client: 'Martinez Settlement', amount: 68000, type: 'Personal Injury' },
                { client: 'Global Enterprises', amount: 55000, type: 'Corporate Law' },
                { client: 'Smith Divorce', amount: 42000, type: 'Family Law' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{item.client}</span>
                    <div className="text-xs text-muted-foreground">{item.type}</div>
                  </div>
                  <span className="text-green-600 font-bold">
                    ${item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}