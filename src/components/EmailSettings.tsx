import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { X, Settings, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EmailSettingsProps {
  onClose: () => void;
}

export function EmailSettings({ onClose }: EmailSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    gmail_enabled: false,
    outlook_enabled: false,
    auto_categorize: true,
    encryption_enabled: false,
    signature: '',
    sync_frequency: 15
  });
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setSettings({
          gmail_enabled: data.provider === 'gmail',
          outlook_enabled: data.provider === 'outlook',
          auto_categorize: data.auto_categorize,
          encryption_enabled: data.encryption_enabled,
          signature: data.signature_html || '',
          sync_frequency: data.settings?.sync_frequency || 15
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsData = {
        user_id: user?.id,
        provider: settings.gmail_enabled ? 'gmail' : settings.outlook_enabled ? 'outlook' : 'none',
        auto_categorize: settings.auto_categorize,
        encryption_enabled: settings.encryption_enabled,
        signature_html: settings.signature,
        settings: { sync_frequency: settings.sync_frequency },
        updated_at: new Date().toISOString()
      };

      await supabase.from('email_settings').upsert(settingsData, {
        onConflict: 'user_id'
      });

      toast({
        title: "Settings Saved",
        description: "Your email settings have been updated."
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Email Settings</h1>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Provider Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Gmail Integration</Label>
                <p className="text-sm text-gray-600">Connect your Gmail account</p>
              </div>
              <Switch
                checked={settings.gmail_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  gmail_enabled: checked,
                  outlook_enabled: checked ? false : prev.outlook_enabled
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Outlook Integration</Label>
                <p className="text-sm text-gray-600">Connect your Outlook account</p>
              </div>
              <Switch
                checked={settings.outlook_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  outlook_enabled: checked,
                  gmail_enabled: checked ? false : prev.gmail_enabled
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Email Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-categorize Emails</Label>
                <p className="text-sm text-gray-600">Automatically assign emails to cases</p>
              </div>
              <Switch
                checked={settings.auto_categorize}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_categorize: checked }))}
              />
            </div>

            <div>
              <Label htmlFor="sync">Sync Frequency (minutes)</Label>
              <Input
                id="sync"
                type="number"
                value={settings.sync_frequency}
                onChange={(e) => setSettings(prev => ({ ...prev, sync_frequency: parseInt(e.target.value) }))}
                min="5"
                max="60"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Email Encryption</Label>
                <p className="text-sm text-gray-600">Enable encryption for sensitive emails</p>
              </div>
              <Switch
                checked={settings.encryption_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, encryption_enabled: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={settings.signature}
              onChange={(e) => setSettings(prev => ({ ...prev, signature: e.target.value }))}
              placeholder="Your email signature..."
              rows={6}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
