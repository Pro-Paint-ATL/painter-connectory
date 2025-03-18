
import React from "react";
import { Paintbrush, Sparkle } from "lucide-react";

const BrandLogo = () => {
  return (
    <div className="relative inline-block">
      {/* Paintbrush base */}
      <Paintbrush 
        className="h-8 w-8 text-primary relative z-10" 
        style={{ transform: 'rotate(-45deg)' }} 
      />
      
      {/* Colorful fire effect using sparkles */}
      <div className="absolute -top-1 -right-1 z-20">
        <Sparkle className="h-4 w-4 text-orange-500 animate-pulse" />
      </div>
      <div className="absolute -top-2 right-0 z-20">
        <Sparkle className="h-3 w-3 text-pink-500 animate-pulse" style={{ animationDelay: "0.2s" }} />
      </div>
      <div className="absolute -top-1 right-1 z-20">
        <Sparkle className="h-3 w-3 text-purple-500 animate-pulse" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  );
};

export default BrandLogo;
