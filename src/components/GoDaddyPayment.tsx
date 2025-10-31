import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoDaddyPaymentProps {
  planId: string;
  amount: number;
  period: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GoDaddyPayment({ planId, amount, period, onSuccess, onCancel }: GoDaddyPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    email: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('billing.')) {
      const billingField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [billingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate GoDaddy payment processing
      const paymentData = {
        planId,
        amount,
        period,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        cardholderName: formData.cardholderName,
        email: formData.email,
        billingAddress: formData.billingAddress
      };

      // In a real implementation, this would call GoDaddy's payment API
      console.log('Processing payment with GoDaddy:', paymentData);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      toast({
        title: "Payment Successful",
        description: `Your ${period}ly subscription has been activated!`,
      });

      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Please check your payment details and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Secure Payment
        </CardTitle>
        <div className="text-sm text-gray-600">
          ${amount} / {period} - Legal Research Platform
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="expiryMonth">Month</Label>
              <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiryYear">Year</Label>
              <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="YY" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                      {String(new Date().getFullYear() + i).slice(-2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Billing Address</Label>
            <Input
              placeholder="Street Address"
              value={formData.billingAddress.street}
              onChange={(e) => handleInputChange('billing.street', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="City"
                value={formData.billingAddress.city}
                onChange={(e) => handleInputChange('billing.city', e.target.value)}
                required
              />
              <Input
                placeholder="State"
                value={formData.billingAddress.state}
                onChange={(e) => handleInputChange('billing.state', e.target.value)}
                required
              />
            </div>
            <Input
              placeholder="ZIP Code"
              value={formData.billingAddress.zipCode}
              onChange={(e) => handleInputChange('billing.zipCode', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Shield className="h-4 w-4 mr-2 text-green-500" />
            <Lock className="h-4 w-4 mr-2 text-green-500" />
            Secured by GoDaddy SSL encryption
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay $${amount}`
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}