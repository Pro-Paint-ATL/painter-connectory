
import React, { useState, useEffect, useRef } from "react";
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
  const loginTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // If the external loading state changes to false, update the local loading state
    if (!isLoading && localLoading) {
      setLocalLoading(false);
    }
  }, [isLoading, localLoading]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setLocalLoading(false);

      // Clear any pending timeout
      if (loginTimeoutRef.current) {
        window.clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    
    // Set a safety timeout to ensure the loading state gets reset
    loginTimeoutRef.current = window.setTimeout(() => {
      setLocalLoading(false);
    }, 15000); // 15 seconds max wait time for login
    
    try {
      await onLogin(email, password);
    } catch (error) {
      console.error("Login error in dialog:", error);
      setLocalLoading(false);
      
      // Clear the timeout since we're handling the error
      if (loginTimeoutRef.current) {
        window.clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
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
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || localLoading}>
            {isLoading || localLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
