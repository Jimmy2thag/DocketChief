import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface PaymentMethodsManagerProps {
  methods: PaymentMethod[];
  onAdd: (method: PaymentMethod) => void;
  onRemove: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function PaymentMethodsManager({ 
  methods, 
  onAdd, 
  onRemove, 
  onSetDefault 
}: PaymentMethodsManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [month, year] = newCard.expiry.split('/');
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      brand: 'visa',
      last4: newCard.number.replace(/\s/g, '').slice(-4),
      expiryMonth: parseInt(month),
      expiryYear: parseInt('20' + year),
      isDefault: methods.length === 0
    };

    onAdd(newMethod);
    setShowAddDialog(false);
    setNewCard({ number: '', expiry: '', cvc: '', name: '' });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Methods</CardTitle>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment methods saved</p>
            </div>
          ) : (
            <div className="space-y-3">
              {methods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <div className="font-medium">
                        {method.brand.toUpperCase()} ****{method.last4}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault && <Badge>Default</Badge>}
                    {!method.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCard} className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={newCard.number}
                onChange={(e) => setNewCard(prev => ({ 
                  ...prev, 
                  number: formatCardNumber(e.target.value) 
                }))}
                maxLength={19}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard(prev => ({ 
                    ...prev, 
                    expiry: formatExpiry(e.target.value) 
                  }))}
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={newCard.cvc}
                  onChange={(e) => setNewCard(prev => ({ 
                    ...prev, 
                    cvc: e.target.value.replace(/\D/g, '') 
                  }))}
                  maxLength={4}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Add Card</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}