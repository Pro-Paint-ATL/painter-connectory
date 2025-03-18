
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaintBucket } from "lucide-react";

interface LogoProps {
  city: { city: string; state: string; code: string };
}

const Logo = ({ city }: LogoProps) => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <img 
        src="/lovable-uploads/46745e2b-4793-4b28-81bd-0b41822d517f.png"
        alt="Pro Paint Logo" 
        className="w-10 h-10"
      />
      <span className="font-semibold text-xl">Pro Paint {city.code}</span>
    </Link>
  );
};

export default Logo;
