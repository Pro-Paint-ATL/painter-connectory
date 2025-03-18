
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ImageBackgroundRemover from "../ui/ImageBackgroundRemover";

interface City {
  city: string;
  state: string;
  code: string;
}

const majorCities: City[] = [
  { city: "Miami", state: "FL", code: "MIA" },
  { city: "Atlanta", state: "GA", code: "ATL" },
  { city: "New York", state: "NY", code: "NY" },
  { city: "Los Angeles", state: "CA", code: "LA" },
  { city: "Chicago", state: "IL", code: "CHI" },
  { city: "Dallas", state: "TX", code: "DAL" },
  { city: "Houston", state: "TX", code: "HOU" },
  { city: "Phoenix", state: "AZ", code: "PHX" },
  { city: "Philadelphia", state: "PA", code: "PHL" },
  { city: "San Antonio", state: "TX", code: "SAT" },
];

const Footer = () => {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState("/lovable-uploads/16b16ae1-6014-4375-8e38-67ee73bbaea6.png");
  const [currentCity, setCurrentCity] = useState<City>(majorCities[0]);

  useEffect(() => {
    const randomCity = majorCities[Math.floor(Math.random() * majorCities.length)];
    setCurrentCity(randomCity);
  }, []);

  const handleProcessedImage = (newImageUrl: string) => {
    setLogoUrl(newImageUrl);
  };

  return (
    <footer className="bg-secondary/50 backdrop-blur-sm border-t">
      <div className="container px-4 py-10 md:py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex flex-col space-y-3">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logoUrl}
                alt="Pro Paint Logo" 
                className="w-20 h-20"
              />
              <span className="font-semibold text-xl">Pro Paint {currentCity.code}</span>
            </Link>
            {user?.role === 'admin' && (
              <ImageBackgroundRemover 
                imageUrl="/lovable-uploads/46745e2b-4793-4b28-81bd-0b41822d517f.png"
                onProcessed={handleProcessedImage}
              />
            )}
            <p className="text-muted-foreground max-w-xs">
              Connecting quality painters with customers for beautiful results in {currentCity.city}, {currentCity.state}.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-2 lg:col-span-3">
            <nav className="flex flex-col space-y-3">
              <p className="font-medium">Services</p>
              <Link to="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">
                Estimate Calculator
              </Link>
              <Link to="/find-painters" className="text-muted-foreground hover:text-foreground transition-colors">
                Find Painters
              </Link>
              <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                My Account
              </Link>
            </nav>
            
            <nav className="flex flex-col space-y-3">
              <p className="font-medium">Company</p>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                Careers
              </Link>
            </nav>
            
            <nav className="flex flex-col space-y-3">
              <p className="font-medium">Legal</p>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-between gap-4 border-t border-t-muted/30 pt-6 mt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Pro Paint {currentCity.code}. All rights reserved.
          </p>
          
          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
