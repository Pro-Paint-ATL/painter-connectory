
import React from "react";
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
  return (
    <div className="flex items-center gap-2">
      <LoginDialog
        isOpen={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        isLoading={isLoading}
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
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        isLoading={isLoading}
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
