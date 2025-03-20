
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Clock, FileEdit, Settings, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CustomerProfile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.role === "painter") {
      navigate("/painter-dashboard");
    }
  }, [user, navigate]);
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const bio = formData.get('bio') as string;
    
    if (user) {
      const locationData = {
        address,
        latitude: user.location?.latitude || 0,
        longitude: user.location?.longitude || 0,
        phone,
        bio
      };
      
      try {
        await updateUserProfile({
          name,
          location: locationData
        });
        
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully."
        });
      } catch (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Update Failed",
          description: "There was an error updating your profile.",
          variant: "destructive"
        });
      }
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-50";
      case "upcoming":
        return "text-blue-500 bg-blue-50";
      case "canceled":
        return "text-red-500 bg-red-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const bookings = [
    {
      id: "booking1",
      date: "Mar 15, 2023",
      painter: "Elite Painters",
      status: "completed",
      rating: 4,
    },
    {
      id: "booking2",
      date: "May 22, 2023",
      painter: "Premium Paint Pros",
      status: "completed",
      rating: 5,
    },
    {
      id: "booking3",
      date: "Jul 3, 2023",
      painter: "Quality Painting Services",
      status: "canceled",
      rating: null,
    },
    {
      id: "booking4",
      date: "Oct 18, 2023",
      painter: "Master Painters",
      status: "upcoming",
      rating: null,
    },
  ];

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center py-8">Loading user profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 opacity-90"
        style={{ backgroundImage: 'url("/lovable-uploads/3fffd889-d8a4-4a24-a6e0-6c03b8cc437f.png")' }}
      />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-end mb-6">
            <Button 
              onClick={() => navigate('/post-job')} 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Post a Job
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <Card className="sticky top-6 bg-background/95 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-2xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {user.role === "customer" ? "Customer" : user.role === "painter" ? "Painter" : "Admin"}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <Button 
                      variant={activeTab === "profile" ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab("profile")}
                    >
                      <FileEdit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant={activeTab === "bookings" ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab("bookings")}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Booking History
                    </Button>
                    <Button 
                      variant={activeTab === "settings" ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => navigate("/manage-jobs")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Manage My Jobs
                    </Button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full md:w-2/3">
              {activeTab === "profile" && (
                <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" defaultValue={user.name} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" defaultValue={user.email} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" name="phone" defaultValue={user.location?.phone || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" name="address" defaultValue={user.location?.address || ''} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">About Me</Label>
                        <Textarea id="bio" name="bio" placeholder="Tell painters a bit about yourself or your project needs" defaultValue={user.location?.bio || ''} />
                      </div>
                      
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "bookings" && (
                <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <h2 className="text-xl font-bold">Booking History</h2>
                  </CardHeader>
                  <CardContent>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{booking.painter}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {booking.date}
                              </p>
                            </div>
                            
                            <div className="mt-2 md:mt-0 flex items-center gap-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              
                              {booking.status === "completed" ? (
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span 
                                      key={i}
                                      className={`h-4 w-4 ${i < (booking.rating || 0) ? 'text-primary' : 'text-muted-foreground'}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                booking.status === "upcoming" && (
                                  <Button size="sm" variant="outline">Reschedule</Button>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">You haven't booked any painters yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "settings" && (
                <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <h2 className="text-xl font-bold">Account Settings</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Password</h3>
                        <Button variant="outline">Change Password</Button>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Notifications</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <input type="checkbox" id="email-notifications" defaultChecked className="toggle" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="sms-notifications">SMS Notifications</Label>
                            <input type="checkbox" id="sms-notifications" defaultChecked className="toggle" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2 text-red-500">Danger Zone</h3>
                        <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerProfile;
