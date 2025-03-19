
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { PaintBucket, Calculator, Users, ClipboardList, LayoutDashboard } from "lucide-react";
import { User } from "@/types/auth";

interface NavItemsProps {
  variant?: "default" | "ghost" | "outline" | "secondary";
  isMobile?: boolean;
}

const NavItems = ({ variant = "ghost", isMobile = false }: NavItemsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      name: "Find Painters",
      path: "/find-painters",
      icon: <Users className="h-4 w-4" />,
      showFor: ["customer", "all"]
    },
    {
      name: "Estimate Calculator",
      path: "/calculator",
      icon: <Calculator className="h-4 w-4" />,
      showFor: ["all"]
    },
    {
      name: "Job Marketplace",
      path: "/marketplace",
      icon: <PaintBucket className="h-4 w-4" />,
      showFor: ["painter"]
    },
    {
      name: "Post a Job",
      path: "/post-job",
      icon: <ClipboardList className="h-4 w-4" />,
      showFor: ["customer"]
    },
    {
      name: "Manage Jobs",
      path: "/manage-jobs",
      icon: <LayoutDashboard className="h-4 w-4" />,
      showFor: ["customer"]
    }
  ];

  const shouldShow = (item: typeof navItems[0], user: User | null) => {
    if (item.showFor.includes("all")) return true;
    
    if (!user) return false;
    
    return item.showFor.includes(user.role as string);
  };

  const filteredNavItems = navItems.filter(item => shouldShow(item, user));

  return (
    <div className={`flex ${isMobile ? "flex-col w-full" : "flex-row items-center"} gap-1`}>
      {filteredNavItems.map((item) => (
        <Button
          key={item.path}
          variant={isActive(item.path) ? "default" : variant}
          size={isMobile ? "lg" : "sm"}
          onClick={() => navigate(item.path)}
          className={`${isMobile ? "justify-start w-full" : ""}`}
        >
          {item.icon}
          <span className={isMobile ? "ml-2" : "ml-1 hidden md:inline-block"}>
            {item.name}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default NavItems;
