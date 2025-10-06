import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter, Receipt, AlertCircle, CheckCircle } from 'lucide-react';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  invoiceUrl: string;
  period: string;
}

export const BillingHistory: React.FC = () => {
  const [invoices] = useState<Invoice[]>([
    {
      id: 'inv_001',
      date: '2024-01-01',
      amount: 49.99,
      status: 'paid',
      description: 'Legal Research Platform - Monthly',
      invoiceUrl: '#',
      period: 'Jan 2024'
    },
    {
      id: 'inv_002',
      date: '2023-12-01',
      amount: 49.99,
      status: 'paid',
      description: 'Legal Research Platform - Monthly',
      invoiceUrl: '#',
      period: 'Dec 2023'
    },
    {
      id: 'inv_003',
      date: '2023-11-01',
      amount: 49.99,
      status: 'failed',
      description: 'Legal Research Platform - Monthly',
      invoiceUrl: '#',
      period: 'Nov 2023'
    },
    {
      id: 'inv_004',
      date: '2023-10-01',
      amount: 49.99,
      status: 'paid',
      description: 'Legal Research Platform - Monthly',
      invoiceUrl: '#',
      period: 'Oct 2023'
    },
    {
      id: 'inv_005',
      date: '2023-09-01',
      amount: 399.00,
      status: 'refunded',
      description: 'Legal Research Platform - Annual',
      invoiceUrl: '#',
      period: 'Sep 2023 - Sep 2024'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === '3months' && new Date(invoice.date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
                       (dateFilter === '6months' && new Date(invoice.date) >= new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)) ||
                       (dateFilter === '1year' && new Date(invoice.date) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: { variant: 'default' as const, icon: CheckCircle, text: 'Paid' },
      pending: { variant: 'secondary' as const, icon: AlertCircle, text: 'Pending' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, text: 'Failed' },
      refunded: { variant: 'outline' as const, icon: AlertCircle, text: 'Refunded' }
    };
    
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulate invoice download
    console.log(`Downloading invoice ${invoice.id}`);
    // In real implementation, this would trigger a download from the server
  };

  const handleRetryPayment = (invoice: Invoice) => {
    console.log(`Retrying payment for invoice ${invoice.id}`);
    // In real implementation, this would redirect to payment form
  };

  const totalPaid = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{filteredInvoices.length}</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Payments</p>
                <p className="text-2xl font-bold">{invoices.filter(inv => inv.status === 'failed').length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and manage your payment history and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>{invoice.period}</TableCell>
                    <TableCell className="font-semibold">${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {invoice.status === 'failed' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleRetryPayment(invoice)}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};