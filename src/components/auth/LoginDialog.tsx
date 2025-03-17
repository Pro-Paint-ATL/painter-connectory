
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  isLoading: boolean;
}

const LoginDialog = ({ 
  isOpen, 
  onOpenChange, 
  onLogin, 
  onSwitchToRegister, 
  isLoading 
}: LoginDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      console.log("Login dialog: Resetting form state");
      setEmail("");
      setPassword("");
      setLocalLoading(false);
      setError(null);
    }
  }, [isOpen]);

  // Ensure we're not stuck in loading state
  useEffect(() => {
    if (!isLoading && localLoading) {
      setLocalLoading(false);
    }
  }, [isLoading, localLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (localLoading || isLoading) return;
    
    console.log("Login dialog: Form submitted");
    setError(null);
    setLocalLoading(true);
    
    try {
      console.log("Login dialog: Attempting login with email:", email);
      await onLogin(email, password);
      console.log("Login dialog: Login attempt completed");
    } catch (error) {
      console.error("Login dialog: Error during login:", error);
      setError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      if (isOpen) {
        // Only reset loading state if dialog is still open
        setLocalLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing dialog during login attempt
      if (localLoading || isLoading) return;
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || localLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || localLoading}
            />
          </div>
          
          {error && (
            <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading || localLoading}>
            {(isLoading || localLoading) ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </span>
            ) : "Login"}
          </Button>
          
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={onSwitchToRegister}
              disabled={isLoading || localLoading}
            >
              Sign up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
