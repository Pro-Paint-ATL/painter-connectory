
import React, { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegister(name, email, password, role);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            />
          </div>
          <div className="space-y-2">
            <Label>I am a</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={role === "customer" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRole("customer")}
              >
                Customer
              </Button>
              <Button
                type="button"
                variant={role === "painter" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setRole("painter")}
              >
                Painter
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={onSwitchToLogin}
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
