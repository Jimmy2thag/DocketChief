import React, { useState, useEffect } from 'react';
import { Users, Plus, Share2, Mail, UserPlus, Settings, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './ui/use-toast';

interface Collaboration {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  members?: Array<{ id: string; email: string; role?: string }>;
}

export const CollaborationTools = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<string>('');
  
  // Form states
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabDesc, setNewCollabDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchCollaborations();
    }
  }, [user]);

  const fetchCollaborations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('collaborations')
        .select(`
          *,
          collaboration_members(*)
        `)
        .or(`owner_id.eq.${user.id},id.in.(${await getUserCollaborationIds()})`);

      if (error) throw error;
      setCollaborations(data || []);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserCollaborationIds = async () => {
    const { data } = await supabase
      .from('collaboration_members')
      .select('collaboration_id')
      .eq('user_id', user?.id);
    
    return data?.map(m => m.collaboration_id).join(',') || '';
  };

  const createCollaboration = async () => {
    if (!user || !newCollabName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('collaborations')
        .insert({
          name: newCollabName,
          description: newCollabDesc,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add owner as member
      await supabase
        .from('collaboration_members')
        .insert({
          collaboration_id: data.id,
          user_id: user.id,
          role: 'owner'
        });

      toast({
        title: "Success",
        description: "Collaboration created successfully"
      });

      setNewCollabName('');
      setNewCollabDesc('');
      setShowCreateModal(false);
      fetchCollaborations();
    } catch (error) {
      console.error('Error creating collaboration:', error);
      toast({
        title: "Error",
        description: "Failed to create collaboration",
        variant: "destructive"
      });
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !selectedCollab) return;

    try {
      // Send invitation email
      const { data, error } = await supabase.functions.invoke('email-integration', {
        body: {
          action: 'send',
          to: inviteEmail,
          subject: 'Collaboration Invitation - Docket Chief',
          template: 'collaboration_invite',
          data: {
            projectName: collaborations.find(c => c.id === selectedCollab)?.name,
            invitedBy: user?.email,
            role: inviteRole,
            link: `${window.location.origin}/collaborate/${selectedCollab}`
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}`
      });

      setInviteEmail('');
      setInviteMessage('');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    }
  };

  const shareDocument = async (documentId: string, shareWithEmail: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('email-integration', {
        body: {
          action: 'send',
          to: shareWithEmail,
          subject: 'Document Shared - Docket Chief',
          template: 'document_shared',
          data: {
            documentName: 'Legal Document',
            sharedBy: user?.email,
            message: 'A document has been shared with you',
            link: `${window.location.origin}/document/${documentId}`
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Document Shared",
        description: `Document shared with ${shareWithEmail}`
      });
    } catch (error) {
      console.error('Error sharing document:', error);
      toast({
        title: "Error",
        description: "Failed to share document",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Collaboration Tools</h2>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Collaboration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collaboration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Collaboration name"
                value={newCollabName}
                onChange={(e) => setNewCollabName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newCollabDesc}
                onChange={(e) => setNewCollabDesc(e.target.value)}
              />
              <Button onClick={createCollaboration} className="w-full">
                Create Collaboration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collaborations.map((collab) => (
          <Card key={collab.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{collab.name}</span>
                <Badge variant={collab.owner_id === user?.id ? "default" : "secondary"}>
                  {collab.owner_id === user?.id ? "Owner" : "Member"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{collab.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                {collab.members?.length || 1} members
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCollab(collab.id);
                    setShowInviteModal(true);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Personal message (optional)"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
            />
            <Button onClick={inviteMember} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};