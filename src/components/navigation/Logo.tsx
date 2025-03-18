import React, { useState } from "react";
import { Link } from "react-router-dom";
import ImageBackgroundRemover from "../ui/ImageBackgroundRemover";
import { useAuth } from "@/context/AuthContext";

interface LogoProps {
  city: { city: string; state: string; code: string };
}

const Logo = ({ city }: LogoProps) => {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState("/lovable-uploads/16b16ae1-6014-4375-8e38-67ee73bbaea6.png");

  const handleProcessedImage = (newImageUrl: string) => {
    setLogoUrl(newImageUrl);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Link to="/" className="flex items-center space-x-2">
        <img 
          src={logoUrl}
          alt="Pro Paint Logo" 
          className="w-10 h-10"
        />
        <span className="font-semibold text-xl">Pro Paint {city.code}</span>
      </Link>
      
      {user?.role === 'admin' && (
        <ImageBackgroundRemover 
          imageUrl="/lovable-uploads/46745e2b-4793-4b28-81bd-0b41822d517f.png"
          onProcessed={handleProcessedImage}
        />
      )}
    </div>
  );
};

export default Logo;
