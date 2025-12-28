import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Calendar, User, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { supabase } from '@/lib/supabase';

interface Case {
  id: string;
  case_number: string;
  case_title: string;
  case_type: string;
  status: string;
  client_name: string;
  updated_date: string;
}

export const CaseManagementDashboard: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    caseTitle: '',
    caseType: '',
    clientName: '',
    opposingParty: '',
    court: '',
    description: ''
  });

  const fetchCases = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions
        .invoke('case-management', {
          body: { action: 'list', userId: user.id }
        });

      if (error) throw error;
      setCases(data.cases || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterCases = useCallback(() => {
    let filtered = cases;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, statusFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    filterCases();
  }, [filterCases]);

  const handleCreateCase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions
        .invoke('case-management', {
          body: { 
            action: 'create', 
            userId: user.id,
            caseData: newCase
          }
        });

      if (error) throw error;

      setCases(prev => [data.case, ...prev]);
      setIsCreateModalOpen(false);
      setNewCase({
        caseTitle: '',
        caseType: '',
        clientName: '',
        opposingParty: '',
        court: '',
        description: ''
      });
    } catch (error) {
      console.error('Error creating case:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading cases...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Case Management</h1>
          <p className="text-gray-600">Manage your legal cases and client matters</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="caseTitle">Case Title</Label>
                <Input
                  id="caseTitle"
                  value={newCase.caseTitle}
                  onChange={(e) => setNewCase(prev => ({ ...prev, caseTitle: e.target.value }))}
                  placeholder="Enter case title"
                />
              </div>
              <div>
                <Label htmlFor="caseType">Case Type</Label>
                <Select value={newCase.caseType} onValueChange={(value) => setNewCase(prev => ({ ...prev, caseType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Personal Injury">Personal Injury</SelectItem>
                    <SelectItem value="Criminal">Criminal</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={newCase.clientName}
                  onChange={(e) => setNewCase(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCase.description}
                  onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief case description"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateCase} className="w-full">
                Create Case
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((case_) => (
          <Card key={case_.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{case_.case_title}</h3>
                <p className="text-sm text-gray-600">{case_.case_number}</p>
              </div>
              <Badge className={getStatusColor(case_.status)}>
                {case_.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                {case_.client_name}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                {case_.case_type}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {new Date(case_.updated_date).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                View Details
              </Button>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first case to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CaseManagementDashboard;
