
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/auth";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [showEmailInfo, setShowEmailInfo] = useState(true);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form state when dialog closes
      setName("");
      setEmail("");
      setPassword("");
      setRole("customer");
      setLocalLoading(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Sync with external loading state
  useEffect(() => {
    if (!isLoading && localLoading) {
      setLocalLoading(false);
    }
  }, [isLoading, localLoading]);

  // Determine if button should be in loading state
  const isButtonLoading = isLoading || localLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (localLoading || isLoading) return; // Prevent multiple submissions
    
    setErrorMessage(null);
    console.log("Form submitted with role:", role);
    setLocalLoading(true);
    
    try {
      await onRegister(name, email, password, role);
      
      // If we're still loading after 5 seconds, show a timeout message
      const timeoutId = setTimeout(() => {
        if (localLoading) {
          setErrorMessage("Registration is taking longer than expected. This could be due to email configuration issues.");
          setLocalLoading(false);
        }
      }, 5000);
      
      // Clear the timeout if component unmounts or registration completes
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error("Registration error in dialog:", error);
      if (error instanceof Error) {
        if (error.message.includes("Email signups are disabled")) {
          setErrorMessage("Email signups are currently disabled in Supabase. The administrator needs to enable them in the Supabase dashboard.");
        } else if (error.message.includes("confirmation email")) {
          setErrorMessage("Your account was created but there was an issue sending the confirmation email. This is likely a Supabase email configuration issue.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("Registration failed");
      }
      setLocalLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Don't allow closing while submitting
      if (!open && isButtonLoading) {
        return;
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create an account</DialogTitle>
          <DialogDescription>
            Enter your information to create an account
          </DialogDescription>
        </DialogHeader>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {showEmailInfo && (
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              The administrator may need to configure email settings in Supabase for registration to work properly.
              <Button 
                variant="link" 
                className="text-amber-700 p-0 h-auto font-normal underline ml-1"
                onClick={() => setShowEmailInfo(false)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
        
        <DialogFooter className="text-center justify-center text-xs text-muted-foreground mt-4">
          The administrator needs to enable email auth in Supabase for signups to work
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
