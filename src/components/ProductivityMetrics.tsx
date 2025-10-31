import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, FileText, Users, Clock } from 'lucide-react';

interface ProductivityMetricsProps {
  dateRange: string;
}

export function ProductivityMetrics({ dateRange }: ProductivityMetricsProps) {
  const productivityData = {
    toolsUsage: [
      { tool: 'Document Analysis', uses: 342, hours: 89, efficiency: 92 },
      { tool: 'Legal Research', uses: 298, hours: 156, efficiency: 88 },
      { tool: 'Brief Generator', uses: 187, hours: 67, efficiency: 94 },
      { tool: 'Case Law Database', uses: 156, hours: 78, efficiency: 85 },
      { tool: 'Motion Templates', uses: 143, hours: 45, efficiency: 91 },
      { tool: 'Contract Drafting', uses: 121, hours: 98, efficiency: 87 }
    ],
    attorneyProductivity: [
      { name: 'Sarah Johnson', casesCompleted: 23, avgTime: 6.2, toolsUsed: 89, score: 94 },
      { name: 'Michael Chen', casesCompleted: 21, avgTime: 5.8, toolsUsed: 92, score: 96 },
      { name: 'Emily Rodriguez', casesCompleted: 19, avgTime: 7.1, toolsUsed: 76, score: 88 },
      { name: 'David Thompson', casesCompleted: 18, avgTime: 6.8, toolsUsed: 82, score: 91 },
      { name: 'Lisa Anderson', casesCompleted: 16, avgTime: 7.5, toolsUsed: 71, score: 85 }
    ],
    taskCompletion: [
      { category: 'Document Review', completed: 156, total: 178, rate: 87.6 },
      { category: 'Client Communications', completed: 234, total: 245, rate: 95.5 },
      { category: 'Court Filings', completed: 89, total: 92, rate: 96.7 },
      { category: 'Research Tasks', completed: 167, total: 189, rate: 88.4 },
      { category: 'Case Preparation', completed: 134, total: 156, rate: 85.9 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Productivity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tool Usage</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <p className="text-xs text-muted-foreground">Total tool interactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89.5%</div>
            <p className="text-xs text-muted-foreground">Across all tools</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">247h</div>
            <p className="text-xs text-muted-foreground">Through automation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Score</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">90.8</div>
            <p className="text-xs text-muted-foreground">Average productivity score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legal Tools Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Legal Tools Usage Analytics</CardTitle>
            <CardDescription>Usage frequency and efficiency by tool</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {productivityData.toolsUsage.map((tool) => (
              <div key={tool.tool} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{tool.tool}</span>
                  <span className="font-medium">{tool.uses} uses</span>
                </div>
                <Progress value={(tool.uses / 350) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{tool.hours}h saved</span>
                  <span className="text-green-600">{tool.efficiency}% efficiency</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Task Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rates</CardTitle>
            <CardDescription>Completion rates by task category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {productivityData.taskCompletion.map((task) => (
              <div key={task.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{task.category}</span>
                  <span className="font-medium">{task.completed}/{task.total}</span>
                </div>
                <Progress value={task.rate} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  <span className={task.rate >= 90 ? 'text-green-600' : task.rate >= 85 ? 'text-yellow-600' : 'text-red-600'}>
                    {task.rate}% completion rate
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Attorney Productivity Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Attorney Productivity Analysis</CardTitle>
          <CardDescription>Individual performance metrics and tool adoption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Attorney</th>
                  <th className="text-right p-2">Cases Completed</th>
                  <th className="text-right p-2">Avg Time (days)</th>
                  <th className="text-right p-2">Tools Used</th>
                  <th className="text-right p-2">Productivity Score</th>
                  <th className="text-right p-2">Rank</th>
                </tr>
              </thead>
              <tbody>
                {productivityData.attorneyProductivity.map((attorney, index) => (
                  <tr key={attorney.name} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{attorney.name}</td>
                    <td className="text-right p-2">{attorney.casesCompleted}</td>
                    <td className="text-right p-2">{attorney.avgTime}</td>
                    <td className="text-right p-2">{attorney.toolsUsed}</td>
                    <td className="text-right p-2">
                      <span className={`font-medium ${
                        attorney.score >= 95 ? 'text-green-600' : 
                        attorney.score >= 90 ? 'text-blue-600' : 
                        'text-yellow-600'
                      }`}>
                        {attorney.score}
                      </span>
                    </td>
                    <td className="text-right p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Productivity Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Productivity Trends</CardTitle>
            <CardDescription>Productivity scores over the past 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'].map((week, index) => {
                const score = [85, 87, 89, 91, 88, 92, 90, 94][index];
                const maxScore = 100;
                const percentage = (score / maxScore) * 100;
                
                return (
                  <div key={week} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{week}</span>
                      <span className="font-medium">{score}/100</span>
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
            <CardTitle>Tool Adoption Rates</CardTitle>
            <CardDescription>Percentage of team using each tool</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productivityData.toolsUsage.slice(0, 5).map((tool, index) => {
                const adoptionRate = [95, 88, 82, 76, 91][index];
                
                return (
                  <div key={tool.tool} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{tool.tool}</span>
                    <span className={`font-bold ${
                      adoptionRate >= 90 ? 'text-green-600' : 
                      adoptionRate >= 80 ? 'text-blue-600' : 
                      'text-yellow-600'
                    }`}>
                      {adoptionRate}%
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