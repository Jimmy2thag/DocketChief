import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DeadlineComplianceProps {
  dateRange: string;
}

export function DeadlineCompliance({ dateRange }: DeadlineComplianceProps) {
  const deadlineData = {
    overallCompliance: 94.2,
    totalDeadlines: 287,
    metOnTime: 270,
    missedDeadlines: 17,
    complianceByArea: [
      { area: 'Court Filings', total: 89, met: 87, rate: 97.8, avgDays: 2.1 },
      { area: 'Client Communications', total: 156, met: 148, rate: 94.9, avgDays: 1.3 },
      { area: 'Document Review', total: 67, met: 62, rate: 92.5, avgDays: 3.2 },
      { area: 'Discovery Responses', total: 45, met: 41, rate: 91.1, avgDays: 4.8 },
      { area: 'Contract Deadlines', total: 34, met: 32, rate: 94.1, avgDays: 2.7 }
    ],
    attorneyCompliance: [
      { name: 'Sarah Johnson', deadlines: 58, met: 56, rate: 96.6, avgEarly: 1.8 },
      { name: 'Michael Chen', deadlines: 52, met: 51, rate: 98.1, avgEarly: 2.3 },
      { name: 'Emily Rodriguez', deadlines: 47, met: 43, rate: 91.5, avgEarly: 0.9 },
      { name: 'David Thompson', deadlines: 43, met: 41, rate: 95.3, avgEarly: 1.5 },
      { name: 'Lisa Anderson', deadlines: 39, met: 36, rate: 92.3, avgEarly: 1.1 }
    ],
    upcomingDeadlines: [
      { task: 'Motion Filing - Johnson vs State', due: '2024-09-28', priority: 'High', daysLeft: 1 },
      { task: 'Discovery Response - TechCorp Case', due: '2024-09-30', priority: 'Medium', daysLeft: 3 },
      { task: 'Contract Review - Global Enterprises', due: '2024-10-02', priority: 'High', daysLeft: 5 },
      { task: 'Client Meeting Prep - Martinez Settlement', due: '2024-10-05', priority: 'Low', daysLeft: 8 },
      { task: 'Appeal Brief - Smith Divorce', due: '2024-10-08', priority: 'High', daysLeft: 11 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Deadline Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deadlineData.overallCompliance}%</div>
            <p className="text-xs text-muted-foreground">
              {deadlineData.metOnTime} of {deadlineData.totalDeadlines} deadlines met
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Deadlines</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{deadlineData.missedDeadlines}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">23</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Early Completion</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">1.7</div>
            <p className="text-xs text-muted-foreground">Days ahead of deadline</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance by Practice Area */}
        <Card>
          <CardHeader>
            <CardTitle>Deadline Compliance by Area</CardTitle>
            <CardDescription>Compliance rates across different practice areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deadlineData.complianceByArea.map((area) => (
              <div key={area.area} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{area.area}</span>
                  <span className="font-medium">{area.met}/{area.total} ({area.rate}%)</span>
                </div>
                <Progress value={area.rate} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  Avg completion: {area.avgDays} days early
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Attorney Compliance Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Attorney Deadline Performance</CardTitle>
            <CardDescription>Individual compliance rates and timing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deadlineData.attorneyCompliance.map((attorney) => (
              <div key={attorney.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{attorney.name}</span>
                  <span className="font-medium">{attorney.met}/{attorney.deadlines}</span>
                </div>
                <Progress value={attorney.rate} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className={attorney.rate >= 95 ? 'text-green-600' : attorney.rate >= 90 ? 'text-yellow-600' : 'text-red-600'}>
                    {attorney.rate}% compliance
                  </span>
                  <span>Avg {attorney.avgEarly} days early</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Critical Deadlines</CardTitle>
          <CardDescription>High-priority deadlines requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deadlineData.upcomingDeadlines.map((deadline, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                deadline.priority === 'High' ? 'border-red-500 bg-red-50' :
                deadline.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{deadline.task}</h4>
                    <p className="text-sm text-gray-600 mt-1">Due: {deadline.due}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      deadline.priority === 'High' ? 'bg-red-100 text-red-800' :
                      deadline.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {deadline.priority}
                    </span>
                    <p className={`text-sm font-medium mt-1 ${
                      deadline.daysLeft <= 2 ? 'text-red-600' :
                      deadline.daysLeft <= 7 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {deadline.daysLeft} days left
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deadline Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Compliance Trends</CardTitle>
            <CardDescription>Compliance rates over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['January', 'February', 'March', 'April', 'May', 'June'].map((month, index) => {
                const compliance = [91.2, 93.5, 89.8, 95.1, 92.7, 94.2][index];
                
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{month}</span>
                      <span className="font-medium">{compliance}%</span>
                    </div>
                    <Progress value={compliance} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deadline Risk Assessment</CardTitle>
            <CardDescription>Risk levels for upcoming deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div>
                  <span className="font-medium text-red-800">High Risk</span>
                  <div className="text-xs text-red-600">Due within 48 hours</div>
                </div>
                <span className="text-red-600 font-bold text-xl">3</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div>
                  <span className="font-medium text-yellow-800">Medium Risk</span>
                  <div className="text-xs text-yellow-600">Due within 7 days</div>
                </div>
                <span className="text-yellow-600 font-bold text-xl">8</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div>
                  <span className="font-medium text-green-800">Low Risk</span>
                  <div className="text-xs text-green-600">Due after 7 days</div>
                </div>
                <span className="text-green-600 font-bold text-xl">12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}