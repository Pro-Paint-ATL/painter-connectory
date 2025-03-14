
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import LoginDialog from "./LoginDialog";
import RegisterDialog from "./RegisterDialog";
import { UserRole } from "@/types/auth";

interface AuthButtonsProps {
  isLoginOpen: boolean;
  setIsLoginOpen: (isOpen: boolean) => void;
  isRegisterOpen: boolean;
  setIsRegisterOpen: (isOpen: boolean) => void;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleRegister: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  isLoading: boolean;
}

const AuthButtons = ({
  isLoginOpen,
  setIsLoginOpen,
  isRegisterOpen,
  setIsRegisterOpen,
  handleLogin,
  handleRegister,
  isLoading,
}: AuthButtonsProps) => {
  // Track local loading state for debugging purposes
  const [localLoading, setLocalLoading] = useState(false);
  
  console.log("AuthButtons isLoading state:", isLoading);
  
  const onRegister = async (name: string, email: string, password: string, role: UserRole) => {
    setLocalLoading(true);
    try {
      await handleRegister(name, email, password, role);
    } finally {
      setLocalLoading(false);
    }
  };
  
  const onLogin = async (email: string, password: string) => {
    setLocalLoading(true);
    try {
      await handleLogin(email, password);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <LoginDialog
        isOpen={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onLogin={onLogin}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        isLoading={isLoading || localLoading}
      />
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setIsLoginOpen(true)}
      >
        Login
      </Button>

      <RegisterDialog
        isOpen={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        onRegister={onRegister}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        isLoading={isLoading || localLoading}
      />
      <Button 
        variant="default" 
        size="sm"
        onClick={() => setIsRegisterOpen(true)}
      >
        Sign Up
      </Button>
    </div>
  );
};

export default AuthButtons;
