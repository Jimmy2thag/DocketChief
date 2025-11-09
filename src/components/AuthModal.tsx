import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle } from 'lucide-react';
import { PasswordResetModal } from './PasswordResetModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<string>('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldError('');

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
          if (error.field) setFieldError(error.field);
          throw new Error(error.message);
        }
        // Mock email verification sent
        setEmailVerificationSent(true);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
          if (error.field) setFieldError(error.field);
          throw new Error(error.message);
        }
        onClose();
        resetForm();
      }
    } catch (err) {
      // Error already set above
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
    setFieldError('');
    setEmailVerificationSent(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </DialogTitle>
          </DialogHeader>
          
          {emailVerificationSent ? (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Account created successfully!
              </p>
              <p className="text-xs text-gray-500">
                Please check your email to verify your account.
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className={fieldError === 'fullName' ? 'border-red-500' : ''}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={fieldError === 'email' ? 'border-red-500' : ''}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className={fieldError === 'password' ? 'border-red-500' : ''}
                  />
                  {mode === 'signup' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center space-y-2">
                {mode === 'signin' && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowPasswordReset(true)}
                  >
                    Forgot password?
                  </Button>
                )}
                <Button
                  variant="link"
                  onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                >
                  {mode === 'signin' 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />
    </>
  );
}