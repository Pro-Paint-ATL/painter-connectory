
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
import { UserRole } from "@/types/auth";
import { Loader2 } from "lucide-react";

interface RegisterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
}

const RegisterDialog = ({ 
  isOpen, 
  onOpenChange, 
  onRegister, 
  onSwitchToLogin, 
  isLoading 
}: RegisterDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  console.log("RegisterDialog isLoading:", isLoading, "isSubmitting:", isSubmitting);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
    }
  }, [isOpen]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen && !isLoading && !isSubmitting) {
      // Wait for transition to finish before resetting form
      const timeout = setTimeout(() => {
        setName("");
        setEmail("");
        setPassword("");
        setRole("customer");
        setErrorMessage(null);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, isLoading, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || isSubmitting) return; // Prevent multiple submissions
    
    setErrorMessage(null);
    setIsSubmitting(true);
    
    try {
      console.log("Starting registration from dialog");
      await onRegister(name, email, password, role);
      console.log("Registration completed");
    } catch (error: any) {
      console.error("Registration error in dialog:", error);
      setErrorMessage(error?.message || "An unexpected error occurred. Please try again.");
    } finally {
      console.log("Registration finally block, resetting submission state");
      setIsSubmitting(false);
    }
  };

  // Determine if we should show loading state
  const showLoading = isLoading || isSubmitting;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Prevent dialog from closing during loading state
        if (!open && showLoading) {
          return;
        }
        onOpenChange(open);
      }}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={e => {
          if (showLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={e => {
          if (showLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Create an account</DialogTitle>
          <DialogDescription>
            Enter your information to create an account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={showLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={showLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={showLoading}
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label>I am a</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={role === "customer" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRole("customer")}
                disabled={showLoading}
              >
                Customer
              </Button>
              <Button
                type="button"
                variant={role === "painter" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRole("painter")}
                disabled={showLoading}
              >
                Painter
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={showLoading}>
            {showLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={onSwitchToLogin}
              disabled={showLoading}
            >
              Login
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
