
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Menu,
  PaintBucket,
  Calculator,
  Search,
  Calendar,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"customer" | "painter">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState(majorCities[0]);

  useEffect(() => {
    const randomCity = majorCities[Math.floor(Math.random() * majorCities.length)];
    setCurrentCity(randomCity);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      setIsLoginOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(registerName, registerEmail, registerPassword, registerRole);
      setIsRegisterOpen(false);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
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
            <span className="font-semibold text-xl">Pro Paint {currentCity.code}</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User profile">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                    <DialogDescription>
                      Enter your credentials to access your account
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleLogin} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                    <div className="text-center text-sm">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => {
                          setIsLoginOpen(false);
                          setIsRegisterOpen(true);
                        }}
                      >
                        Sign up
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    Sign Up
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create an account</DialogTitle>
                    <DialogDescription>
                      Enter your information to create an account
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleRegister} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>I am a</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={registerRole === "customer" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setRegisterRole("customer")}
                        >
                          Customer
                        </Button>
                        <Button
                          type="button"
                          variant={registerRole === "painter" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setRegisterRole("painter")}
                        >
                          Painter
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                    <div className="text-center text-sm">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => {
                          setIsRegisterOpen(false);
                          setIsLoginOpen(true);
                        }}
                      >
                        Login
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <nav className="flex flex-col gap-4 mt-8">
                <div className="flex items-center space-x-2 mb-6">
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src="/lovable-uploads/bdd722ac-9f89-47c1-b465-bc989b51d903.png" 
                      alt="Painting preparation with ladder" 
                    />
                    <AvatarFallback className="bg-primary/10">
                      <PaintBucket className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-xl">Pro Paint {currentCity.code}</span>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center py-2 text-base font-medium transition-colors hover:text-primary"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center py-2 text-base font-medium transition-colors hover:text-primary"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center py-2 text-base font-medium transition-colors hover:text-primary"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
