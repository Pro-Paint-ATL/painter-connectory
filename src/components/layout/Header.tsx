import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Calculator, PaintBucket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "../navigation/Logo";
import NavItems from "../navigation/NavItems";
import UserMenu from "../navigation/UserMenu";
import MobileMenu from "../navigation/MobileMenu";
import AuthButtons from "../auth/AuthButtons";

const navItems = [
  {
    label: "Find Painters",
    href: "/find-painters",
    icon: <PaintBucket className="h-4 w-4 mr-2" />,
  },
  {
    label: "Estimate Calculator",
    href: "/calculator",
    icon: <Calculator className="h-4 w-4 mr-2" />,
  },
];

const majorCities = [
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
  { city: "San Diego", state: "CA", code: "SD" },
  { city: "San Francisco", state: "CA", code: "SF" },
  { city: "Seattle", state: "WA", code: "SEA" },
  { city: "Denver", state: "CO", code: "DEN" },
  { city: "Boston", state: "MA", code: "BOS" },
  { city: "Las Vegas", state: "NV", code: "LV" },
  { city: "Portland", state: "OR", code: "PDX" },
  { city: "Detroit", state: "MI", code: "DET" },
  { city: "Minneapolis", state: "MN", code: "MSP" },
  { city: "New Orleans", state: "LA", code: "NOLA" },
];

const Header = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState(majorCities[0]);

  useEffect(() => {
    const randomCity = majorCities[Math.floor(Math.random() * majorCities.length)];
    setCurrentCity(randomCity);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await login(email, password);
      setIsLoginOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string, role: any) => {
    setIsLoading(true);
    try {
      console.log("Registering with role:", role);
      const result = await register(name, email, password, role);
      
      if (result) {
        console.log("Registration successful, dialog will close automatically");
        setTimeout(() => {
          setIsRegisterOpen(false);
        }, 1000);
      } else {
        console.log("Registration failed, keeping dialog open");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Logo city={currentCity} />
        </div>

        <NavItems 
          items={navItems} 
          onNavigate={handleNavigation} 
          className="hidden md:flex" 
        />

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <UserMenu 
              user={user} 
              onLogout={handleLogout} 
              onNavigate={handleNavigation} 
            />
          ) : (
            <AuthButtons
              isLoginOpen={isLoginOpen}
              setIsLoginOpen={setIsLoginOpen}
              isRegisterOpen={isRegisterOpen}
              setIsRegisterOpen={setIsRegisterOpen}
              handleLogin={handleLogin}
              handleRegister={handleRegister}
              isLoading={isLoading}
            />
          )}

          <MobileMenu
            navItems={navItems}
            user={user}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            currentCity={currentCity}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
