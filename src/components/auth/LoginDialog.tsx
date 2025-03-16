
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError(null);
  }, [email, password]);

  useEffect(() => {
    // If the external loading state changes to false, update the local loading state
    if (!isLoading && localLoading) {
      setLocalLoading(false);
    }
  }, [isLoading, localLoading]);

  // Safety timeout to prevent indefinite loading
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (localLoading) {
      timeoutId = window.setTimeout(() => {
        setLocalLoading(false);
        setError("Login attempt timed out. Please try again.");
      }, 12000); // 12 second safety timeout
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [localLoading]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setLocalLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLocalLoading(true);
    
    try {
      await onLogin(email, password);
    } catch (error) {
      console.error("Login error in dialog:", error);
      setError(error instanceof Error ? error.message : "Login failed. Please try again.");
      setLocalLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
