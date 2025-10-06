import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Filter, Calendar, TrendingUp, Users, Clock, DollarSign, Target } from 'lucide-react';
import { CaseAnalytics } from './CaseAnalytics';
import { TimeTracking } from './TimeTracking';
import { ClientMetrics } from './ClientMetrics';
import { RevenueAnalysis } from './RevenueAnalysis';
import { ProductivityMetrics } from './ProductivityMetrics';
import { DeadlineCompliance } from './DeadlineCompliance';
import { CustomReports } from './CustomReports';

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('30d');

  const handleExport = (format: string) => {
    console.log(`Exporting analytics data as ${format}`);
    // Mock export functionality
    const data = { analytics: 'data', format, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-analytics-${format}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="relative bg-cover bg-center py-16"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://d64gsuwffb70l.cloudfront.net/68d655106ee34a31072787c7_1758954129108_c7f0c53d.webp')`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">Legal Practice Analytics</h1>
            <p className="text-xl opacity-90 drop-shadow">Comprehensive insights for data-driven legal practice management</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setDateRange('7d')} className={dateRange === '7d' ? 'bg-blue-50' : ''}>
              <Calendar className="w-4 h-4 mr-2" />
              Last 7 Days
            </Button>
            <Button variant="outline" onClick={() => setDateRange('30d')} className={dateRange === '30d' ? 'bg-blue-50' : ''}>
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline" onClick={() => setDateRange('90d')} className={dateRange === '90d' ? 'bg-blue-50' : ''}>
              <Calendar className="w-4 h-4 mr-2" />
              Last 90 Days
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => handleExport('pdf')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => handleExport('excel')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Case Win Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">87.3%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Case Duration</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">142 days</div>
              <p className="text-xs text-muted-foreground">-8 days from last period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$284,750</div>
              <p className="text-xs text-muted-foreground">+12.3% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">156</div>
              <p className="text-xs text-muted-foreground">+7 new this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="cases">Case Analytics</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="clients">Client Metrics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            <TabsTrigger value="reports">Custom Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <CaseAnalytics dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="time">
            <TimeTracking dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="clients">
            <ClientMetrics dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="revenue">
            <RevenueAnalysis dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="productivity">
            <ProductivityMetrics dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="deadlines">
            <DeadlineCompliance dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="reports">
            <CustomReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}