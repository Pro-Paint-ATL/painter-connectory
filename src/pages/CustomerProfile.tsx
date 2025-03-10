
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Clock, Home, MapPin, FileEdit, Settings, LogOut } from "lucide-react";

const CustomerProfile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // In a real app, this would come from auth context
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    joinDate: "Jan 2023",
  };
  
  // Mock booking history
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
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
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

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">Member since {user.joinDate}</p>
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
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-2/3">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">Edit Profile</h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user.email} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" defaultValue={user.phone} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" defaultValue={user.address} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">About Me</Label>
                      <Textarea id="bio" placeholder="Tell painters a bit about yourself or your project needs" />
                    </div>
                    
                    <Button type="submit">Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "bookings" && (
              <Card>
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
              <Card>
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
  );
};

export default CustomerProfile;
