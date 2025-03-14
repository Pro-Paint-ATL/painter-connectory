
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
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Wait a bit before resetting the form to avoid flicker
      const timeout = setTimeout(() => {
        setName("");
        setEmail("");
        setPassword("");
        setRole("customer");
        setLocalLoading(false);
        setErrorMessage(null);
        setFormSubmitted(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // When parent isLoading changes to false, also reset local loading
  useEffect(() => {
    if (!isLoading && localLoading) {
      setLocalLoading(false);
    }
  }, [isLoading, localLoading]);

  // Safety timeout to prevent UI from getting stuck
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (localLoading) {
      timeout = setTimeout(() => {
        setLocalLoading(false);
        setErrorMessage("Registration is taking longer than expected. Please try again.");
      }, 5000); // 5 seconds timeout
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [localLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (localLoading || isLoading) return; // Prevent multiple submissions
    
    setErrorMessage(null);
    setLocalLoading(true);
    setFormSubmitted(true);
    
    try {
      await onRegister(name, email, password, role);
      // Don't close the dialog here - let the parent component decide
    } catch (error: any) {
      console.error("Registration error in dialog:", error);
      setErrorMessage(error?.message || "An unexpected error occurred. Please try again.");
      setFormSubmitted(false);
    } finally {
      // If the parent's isLoading state doesn't change in a timely manner, forcefully reset our local state
      setTimeout(() => {
        setLocalLoading(false);
      }, 500);
    }
  };

  // Prevent auto-closing the dialog on button click outside the form
  const handleDialogInteraction = (e: React.MouseEvent) => {
    if (localLoading || isLoading) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Handle dialog close - force it closed if we really need to
  const handleOpenChange = (open: boolean) => {
    // Prevent dialog from closing during loading state
    if (!open && (localLoading || isLoading)) {
      return;
    }
    
    if (!open) {
      // If closing, always reset states to ensure we don't get stuck
      setTimeout(() => {
        setLocalLoading(false);
        setFormSubmitted(false);
      }, 300);
    }
    
    onOpenChange(open);
  };

  // Only close automatically after successful registration and only after a delay
  useEffect(() => {
    if (isOpen && formSubmitted && !isLoading && !localLoading && !errorMessage) {
      // If there's no error and loading is complete, and form was submitted, the registration might have been successful
      const successTimer = setTimeout(() => {
        onOpenChange(false);
      }, 1000);
      
      return () => clearTimeout(successTimer);
    }
  }, [isOpen, isLoading, localLoading, errorMessage, onOpenChange, formSubmitted]);

  // Determine if button should be in loading state
  const isButtonLoading = isLoading || localLoading;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onClick={handleDialogInteraction}
        onPointerDownOutside={e => {
          if (isButtonLoading) {
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
              disabled={isButtonLoading}
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
              disabled={isButtonLoading}
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
              disabled={isButtonLoading}
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
                disabled={isButtonLoading}
              >
                Customer
              </Button>
              <Button
                type="button"
                variant={role === "painter" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRole("painter")}
                disabled={isButtonLoading}
              >
                Painter
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isButtonLoading}>
            {isButtonLoading ? (
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
              disabled={isButtonLoading}
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
