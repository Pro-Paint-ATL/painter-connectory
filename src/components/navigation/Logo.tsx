
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ImageBackgroundRemover from "../ui/ImageBackgroundRemover";
import { useAuth } from "@/context/AuthContext";

interface LogoProps {
  city: { city: string; state: string; code: string };
}

const Logo = ({ city }: LogoProps) => {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState("/lovable-uploads/c5bc4b6f-5600-448b-bd75-e1cb336175db.png");

  const handleProcessedImage = (newImageUrl: string) => {
    setLogoUrl(newImageUrl);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Link to="/" className="flex items-center space-x-2">
        <img 
          src={logoUrl}
          alt="Pro Paint Logo" 
          className="w-10 h-10 object-contain"
        />
        <span className="font-semibold text-xl">Pro Paint {city.code}</span>
      </Link>
      
      {user?.role === 'admin' && (
        <ImageBackgroundRemover 
          imageUrl="/lovable-uploads/c5bc4b6f-5600-448b-bd75-e1cb336175db.png"
          onProcessed={handleProcessedImage}
        />
      )}
    </div>
  );
};

export default Logo;
