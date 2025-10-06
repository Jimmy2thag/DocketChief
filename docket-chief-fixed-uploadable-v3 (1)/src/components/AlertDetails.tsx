import { useState } from 'react';
import { Alert } from './AlertDashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageSquare, X } from 'lucide-react';

interface AlertDetailsProps {
  alert: Alert;
  onClose: () => void;
  onUpdate: (alert: Alert) => void;
}

export const AlertDetails = ({ alert, onClose, onUpdate }: AlertDetailsProps) => {
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState('Admin');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const updatedAlert = {
      ...alert,
      notes: [
        ...alert.notes,
        {
          text: newNote,
          author,
          timestamp: new Date().toISOString()
        }
      ],
      updated_at: new Date().toISOString()
    };
    
    onUpdate(updatedAlert);
    setNewNote('');
  };

  const handleResolve = () => {
    const updatedAlert = {
      ...alert,
      status: 'resolved' as const,
      resolved_at: new Date().toISOString(),
      resolved_by: author,
      updated_at: new Date().toISOString()
    };
    onUpdate(updatedAlert);
  };

  const handleReopen = () => {
    const updatedAlert = {
      ...alert,
      status: 'open' as const,
      resolved_at: undefined,
      resolved_by: undefined,
      updated_at: new Date().toISOString()
    };
    onUpdate(updatedAlert);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Alert Details
            <Badge variant={alert.status === 'resolved' ? 'default' : 'destructive'}>
              {alert.status}
            </Badge>
            <Badge variant="outline">{alert.severity}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{alert.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              Created: {new Date(alert.created_at).toLocaleString()}
            </p>
            {alert.resolved_at && (
              <p className="text-xs text-gray-500">
                Resolved: {new Date(alert.resolved_at).toLocaleString()} by {alert.resolved_by}
              </p>
            )}
          </div>

          {alert.details && (
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium mb-2">Details</h4>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(alert.details, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notes ({alert.notes.length})
            </h4>
            <div className="space-y-2 mb-3">
              {alert.notes.map((note, idx) => (
                <div key={idx} className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-sm">{note.text}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {note.author} - {new Date(note.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddNote} size="sm">
                Add Note
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            {alert.status === 'open' ? (
              <Button onClick={handleResolve} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            ) : (
              <Button onClick={handleReopen} variant="outline">
                Reopen Alert
              </Button>
            )}
            <Button onClick={onClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
