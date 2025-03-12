
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Menu,
  PaintBucket,
  LogOut,
} from "lucide-react";
import { User as UserType } from "@/types/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface MobileMenuProps {
  navItems: NavItem[];
  user: UserType | null;
  isAuthenticated: boolean;
  onLogout: () => Promise<void>;
  currentCity: { city: string; state: string; code: string };
}

const MobileMenu = ({
  navItems,
  user,
  isAuthenticated,
  onLogout,
  currentCity,
}: MobileMenuProps) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-80">
        <nav className="flex flex-col gap-4 mt-8">
          <div className="flex items-center space-x-2 mb-6">
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src="/lovable-uploads/bdd722ac-9f89-47c1-b465-bc989b51d903.png" 
                alt="Painting preparation with ladder" 
              />
              <AvatarFallback className="bg-primary/10">
                <PaintBucket className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-xl">Pro Paint {currentCity.code}</span>
          </div>
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              onClick={() => handleNavigation(item.href)}
              className="flex items-center justify-start py-2 text-base font-medium transition-colors hover:text-primary"
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                onClick={() => handleNavigation("/profile")}
                className="flex items-center justify-start py-2 text-base font-medium transition-colors hover:text-primary"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              {user?.role === "painter" && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation("/painter-dashboard")}
                    className="flex items-center justify-start py-2 text-base font-medium transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation("/subscription")}
                    className="flex items-center justify-start py-2 text-base font-medium transition-colors hover:text-primary"
                  >
                    Subscription
                  </Button>
                </>
              )}
              {user?.role === "admin" && (
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation("/admin")}
                  className="flex items-center justify-start py-2 text-base font-medium transition-colors hover:text-primary"
                >
                  Admin Dashboard
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={onLogout}
                className="flex items-center justify-start py-2 text-base font-medium transition-colors hover:text-primary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
