
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavItemsProps {
  items: NavItem[];
  onNavigate: (path: string) => void;
  className?: string;
}

const NavItems = ({ items, onNavigate, className = "" }: NavItemsProps) => {
  const location = useLocation();

  return (
    <nav className={`flex items-center gap-6 ${className}`}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          onClick={() => onNavigate(item.href)}
          className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
            location.pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </nav>
  );
};

export default NavItems;
