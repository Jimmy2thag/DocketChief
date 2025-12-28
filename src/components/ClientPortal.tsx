import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Users, FileText, MessageSquare, Clock, DollarSign, Plus, Send, Download, Eye } from 'lucide-react';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Case {
  id: string;
  title: string;
  case_type: string;
  status: string;
  client_id: string;
  clients: Client;
}

export function ClientPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddCase, setShowAddCase] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [clientsRes, casesRes] = await Promise.all([
        supabase.from('clients').select('*').eq('attorney_id', user?.id),
        supabase.from('cases').select('*, clients(*)').eq('attorney_id', user?.id)
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (casesRes.data) setCases(casesRes.data);
    } catch (error) {
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const addClient = async (formData: FormData) => {
    const clientData = {
      attorney_id: user?.id,
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };

    const { error } = await supabase.from('clients').insert([clientData]);
    
    if (error) {
      toast({ title: "Error adding client", variant: "destructive" });
    } else {
      toast({ title: "Client added successfully" });
      setShowAddClient(false);
      loadData();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Client Portal</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="clients">
            <Users className="w-4 h-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="cases">
            <FileText className="w-4 h-4 mr-2" />
            Cases
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="communications">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="billing">
            <DollarSign className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Client Management</h2>
            <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  addClient(new FormData(e.currentTarget));
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label>First Name</Label>
                      <Input name="firstName" required />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input name="lastName" required />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input name="email" type="email" required />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input name="phone" />
                    </div>
                    <Button type="submit">Add Client</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {clients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{client.first_name} {client.last_name}</h3>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Case Management</h2>
            <Button onClick={() => setShowAddCase(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Case
            </Button>
          </div>

          <div className="grid gap-4">
            {cases.map((case_) => (
              <Card key={case_.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{case_.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Client: {case_.clients.first_name} {case_.clients.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">Type: {case_.case_type}</p>
                    </div>
                    <Badge variant={case_.status === 'active' ? 'default' : 'secondary'}>
                      {case_.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Document sharing functionality coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Client Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Messaging system coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Billing integration coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
