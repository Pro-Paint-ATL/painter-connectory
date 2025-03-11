
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Clock, Users, Star, DollarSign, Settings, PaintBucket, Briefcase, FileEdit, LogOut, Shield } from "lucide-react";

const PainterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to customer profile if user is not a painter
  useEffect(() => {
    if (user && user.role !== "painter") {
      navigate("/profile");
    }
  }, [user, navigate]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center py-8">Loading painter dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPro = user.subscription?.status === "active";

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      <PaintBucket className="h-8 w-8 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <div className="flex items-center mt-1">
                    <Badge variant={isPro ? "default" : "secondary"} className="mr-2">
                      {isPro ? "Pro Painter" : "Painter"}
                    </Badge>
                    {isPro && (
                      <Badge variant="outline" className="bg-green-50">
                        <Shield className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                {!isPro && (
                  <div className="mb-6 p-3 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm font-medium mb-2">Upgrade to Pro Painter</p>
                    <Button 
                      onClick={() => navigate("/subscription")}
                      className="w-full"
                      size="sm"
                    >
                      <Star className="h-4 w-4 mr-2" /> Go Pro
                    </Button>
                  </div>
                )}
                
                <nav className="space-y-1">
                  <Button variant="default" className="w-full justify-start">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/profile")}>
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    Bookings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/subscription")}>
                    <Star className="mr-2 h-4 w-4" />
                    Subscription
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </nav>
                
                <div className="mt-6 pt-6 border-t">
                  <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-3/4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Painter Dashboard</h1>
              <p className="text-muted-foreground">Manage your painter profile, bookings, and business</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                      <h3 className="text-2xl font-bold">4</h3>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customers</p>
                      <h3 className="text-2xl font-bold">12</h3>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Earnings</p>
                      <h3 className="text-2xl font-bold">$2,450</h3>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
                <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <CardDescription>Manage your scheduled painting jobs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Sample upcoming bookings - would come from API in production */}
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">Alex Johnson</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Mar 25, 2025 - Interior Painting
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
                          <Button size="sm" variant="outline">Details</Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">Sarah Miller</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Apr 10, 2025 - Exterior Painting
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center gap-2">
                          <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                          <Button size="sm" variant="outline">Details</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="completed">
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Jobs</CardTitle>
                    <CardDescription>View your finished painting projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Sample completed jobs - would come from API in production */}
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">Michael Brown</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Feb 15, 2025 - Kitchen Repainting
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`h-4 w-4 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <Button size="sm" variant="outline">Invoice</Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">Jessica Taylor</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Jan 20, 2025 - Living Room
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <Button size="sm" variant="outline">Invoice</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PainterDashboard;
