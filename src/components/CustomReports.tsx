import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Plus, FileText, Calendar, Filter } from 'lucide-react';

export function CustomReports() {
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [filters, setFilters] = useState<string[]>([]);

  const availableMetrics = [
    { id: 'case-win-rate', label: 'Case Win Rate' },
    { id: 'revenue', label: 'Revenue Analysis' },
    { id: 'time-tracking', label: 'Time Tracking' },
    { id: 'client-satisfaction', label: 'Client Satisfaction' },
    { id: 'deadline-compliance', label: 'Deadline Compliance' },
    { id: 'productivity', label: 'Productivity Metrics' },
    { id: 'tool-usage', label: 'Tool Usage Statistics' },
    { id: 'attorney-performance', label: 'Attorney Performance' }
  ];

  const availableFilters = [
    { id: 'practice-area', label: 'Practice Area' },
    { id: 'attorney', label: 'Attorney' },
    { id: 'client-type', label: 'Client Type' },
    { id: 'case-status', label: 'Case Status' },
    { id: 'revenue-range', label: 'Revenue Range' }
  ];

  const savedReports = [
    { name: 'Monthly Performance Summary', type: 'Executive', lastRun: '2024-09-25', frequency: 'Monthly' },
    { name: 'Attorney Productivity Report', type: 'Operational', lastRun: '2024-09-24', frequency: 'Weekly' },
    { name: 'Client Satisfaction Analysis', type: 'Client Relations', lastRun: '2024-09-23', frequency: 'Quarterly' },
    { name: 'Revenue by Practice Area', type: 'Financial', lastRun: '2024-09-22', frequency: 'Monthly' },
    { name: 'Deadline Compliance Audit', type: 'Compliance', lastRun: '2024-09-21', frequency: 'Weekly' }
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleFilterToggle = (filterId: string) => {
    setFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleGenerateReport = () => {
    console.log('Generating custom report:', {
      name: reportName,
      type: reportType,
      dateRange,
      metrics: selectedMetrics,
      filters
    });

    // Mock report generation
    const reportData = {
      name: reportName || 'Custom Report',
      type: reportType,
      dateRange,
      metrics: selectedMetrics,
      filters,
      generatedAt: new Date().toISOString(),
      data: 'Mock report data would be generated here'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName || 'custom-report'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Reset form
    setReportName('');
    setReportType('');
    setDateRange('');
    setSelectedMetrics([]);
    setFilters([]);
  };

  const handleRunSavedReport = (reportName: string) => {
    console.log('Running saved report:', reportName);
    // Mock running saved report
    const reportData = {
      reportName,
      runAt: new Date().toISOString(),
      data: 'Mock saved report data'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Custom Report Builder
          </CardTitle>
          <CardDescription>Create custom reports tailored to your specific needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="Enter report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="operational">Operational Report</SelectItem>
                  <SelectItem value="financial">Financial Analysis</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="performance">Performance Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Select Metrics to Include</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  />
                  <Label htmlFor={metric.id} className="text-sm">{metric.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Apply Filters</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableFilters.map((filter) => (
                <div key={filter.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={filter.id}
                    checked={filters.includes(filter.id)}
                    onCheckedChange={() => handleFilterToggle(filter.id)}
                  />
                  <Label htmlFor={filter.id} className="text-sm">{filter.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerateReport} 
            className="w-full"
            disabled={!reportName || !reportType || selectedMetrics.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Custom Report
          </Button>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Saved Reports
          </CardTitle>
          <CardDescription>Quick access to your frequently used reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savedReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium">{report.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {report.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last run: {report.lastRun}
                    </span>
                    <span className="flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      {report.frequency}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRunSavedReport(report.name)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Run Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Pre-built report templates for common legal practice needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Monthly Partner Report', description: 'Comprehensive monthly performance overview', metrics: 8 },
              { name: 'Client Onboarding Analysis', description: 'Track client acquisition and retention', metrics: 5 },
              { name: 'Case Profitability Report', description: 'Analyze profitability by case type', metrics: 6 },
              { name: 'Attorney Utilization Report', description: 'Track attorney time and efficiency', metrics: 7 },
              { name: 'Compliance Audit Report', description: 'Monitor deadline and regulatory compliance', metrics: 4 },
              { name: 'Practice Area Performance', description: 'Compare performance across practice areas', metrics: 9 }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{template.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{template.metrics} metrics</span>
                    <Button size="sm" variant="outline">Use Template</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}