
import React from "react";
import { Button } from "@/components/ui/button";

export interface NavItemsProps {
  items: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  }[];
  onNavigate: (path: string) => void;
  className?: string;
}

const NavItems = ({ items, onNavigate, className = "" }: NavItemsProps) => {
  return (
    <nav className={`flex items-center gap-2 ${className}`}>
      {items.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          onClick={() => onNavigate(item.href)}
          className="flex items-center gap-2"
        >
          {item.icon}
          <span>{item.label}</span>
        </Button>
      ))}
    </nav>
  );
};

export default NavItems;
