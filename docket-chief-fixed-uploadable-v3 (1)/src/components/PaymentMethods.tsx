import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Edit3
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  brand: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isExpired: boolean;
}

export const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm_001',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      isExpired: false
    },
    {
      id: 'pm_002',
      type: 'card',
      brand: 'Mastercard',
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2024,
      isDefault: false,
      isExpired: true
    }
  ]);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    name: '',
    zipCode: ''
  });

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  const handleDeleteMethod = (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: 'card',
      brand: 'Visa', // Would be determined by card number
      last4: newCard.number.slice(-4),
      expiryMonth: parseInt(newCard.expiryMonth),
      expiryYear: parseInt(newCard.expiryYear),
      isDefault: paymentMethods.length === 0,
      isExpired: false
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    setIsAddingCard(false);
    setNewCard({
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      name: '',
      zipCode: ''
    });
  };

  const getCardIcon = (brand: string) => {
    // In a real app, you'd have proper card brand icons
    return <CreditCard className="w-6 h-6" />;
  };

  const isCardExpired = (method: PaymentMethod) => {
    if (!method.expiryMonth || !method.expiryYear) return false;
    const now = new Date();
    const expiry = new Date(method.expiryYear, method.expiryMonth - 1);
    return expiry < now;
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your payment information is encrypted and securely stored. We never store your full card number or CVC.
        </AlertDescription>
      </Alert>

      {/* Payment Methods List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your saved payment methods</CardDescription>
            </div>
            <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new credit or debit card to your account
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCard} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={newCard.number}
                      onChange={(e) => setNewCard(prev => ({ ...prev, number: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Expiry Month</Label>
                      <Select value={newCard.expiryMonth} onValueChange={(value) => setNewCard(prev => ({ ...prev, expiryMonth: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                              {(i + 1).toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Expiry Year</Label>
                      <Select value={newCard.expiryYear} onValueChange={(value) => setNewCard(prev => ({ ...prev, expiryYear: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={newCard.cvc}
                      onChange={(e) => setNewCard(prev => ({ ...prev, cvc: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={newCard.name}
                      onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="12345"
                      value={newCard.zipCode}
                      onChange={(e) => setNewCard(prev => ({ ...prev, zipCode: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddingCard(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Card</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment methods added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getCardIcon(method.brand)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{method.brand} •••• {method.last4}</span>
                        {method.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        {isCardExpired(method) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      {method.expiryMonth && method.expiryYear && (
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMethod(method.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Failed Payment Recovery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Payment Recovery</span>
          </CardTitle>
          <CardDescription>
            Automatic retry settings for failed payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Smart Retry</p>
                <p className="text-sm text-muted-foreground">
                  Automatically retry failed payments up to 3 times over 7 days
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when payments fail and when they're successfully recovered
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};