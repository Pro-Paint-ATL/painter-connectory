
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { User as UserType } from "@/types/auth";

interface UserMenuProps {
  user: UserType | null;
  onLogout: () => Promise<void>;
  onNavigate: (path: string) => void;
}

const UserMenu = ({ user, onLogout, onNavigate }: UserMenuProps) => {
  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {user.role === "painter" && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onNavigate("/subscription")}
          className="gap-2"
        >
          <span className="hidden sm:inline">Subscription</span>
        </Button>
      )}
      {user.role === "admin" && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onNavigate("/admin")}
          className="gap-2"
        >
          <span className="hidden sm:inline">Admin</span>
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
};

export default UserMenu;
