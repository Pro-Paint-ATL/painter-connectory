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
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form state when dialog closes
      setName("");
      setEmail("");
      setPassword("");
      setRole("customer");
      setLocalLoading(false);
    }
  }, [isOpen]);

  // When parent isLoading changes to false, also reset local loading
  useEffect(() => {
    if (!isLoading && localLoading) {
      setLocalLoading(false);
    }
  }, [isLoading, localLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (localLoading || isLoading) return; // Prevent multiple submissions
    
    console.log("Form submitted with role:", role);
    setLocalLoading(true);
    
    try {
      await onRegister(name, email, password, role);
      // The parent component should close the dialog on successful registration
      onOpenChange(false);
    } catch (error) {
      console.error("Registration error in dialog:", error);
      setLocalLoading(false); // Make sure to reset loading on error
    }
    
    // Force reset loading state after 3 seconds to prevent UI getting stuck
    setTimeout(() => {
      if (localLoading) {
        console.log("Safety timeout triggered - forcing loading state to reset");
        setLocalLoading(false);
        onOpenChange(false); // Force close dialog if still open
      }
    }, 3000);
  };

  // Handle dialog close - force it closed if we really need to
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // If closing, always reset states to ensure we don't get stuck
      setLocalLoading(false);
      onOpenChange(false);
    } else {
      onOpenChange(open);
    }
  };

  // Determine if button should be in loading state
  const isButtonLoading = isLoading || localLoading;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create an account</DialogTitle>
          <DialogDescription>
            Enter your information to create an account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
