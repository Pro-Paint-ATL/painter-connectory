
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
      <Avatar className="w-8 h-8">
        <AvatarImage 
          src="/lovable-uploads/bdd722ac-9f89-47c1-b465-bc989b51d903.png" 
          alt="Painting preparation with ladder" 
        />
        <AvatarFallback className="bg-primary/10">
          <PaintBucket className="h-4 w-4 text-primary" />
        </AvatarFallback>
      </Avatar>
      <span className="font-semibold text-xl">Pro Paint {city.code}</span>
    </Link>
  );
};

export default Logo;
