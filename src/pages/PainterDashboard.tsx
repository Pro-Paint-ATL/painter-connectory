
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Brush, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  MapPin, 
  Phone, 
  CheckCircle2,
  AlertCircle,
  Star,
  PaintBucket
} from "lucide-react";
import { BookingWithPayments } from "@/types/auth";

const PainterDashboard = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingWithPayments[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [specialties, setSpecialties] = useState<string[]>(
    user?.companyInfo?.specialties || []
  );
  const [newSpecialty, setNewSpecialty] = useState("");
  
  // Stats
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    averageRating: 0,
  });

  useEffect(() => {
    if (!user || user.role !== "painter") {
      navigate("/");
      return;
    }

    fetchBookings();
    calculateStats();
  }, [user, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, payments(*)")
        .eq("painter_id", user.id)
        .order("date", { ascending: false });
      
      if (error) throw error;
      
      // Add customer names
      const bookingsWithCustomers = await Promise.all(
        data.map(async (booking) => {
          const { data: customerData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", booking.customer_id)
            .single();
          
          return {
            ...booking,
            customerName: customerData?.name || "Unknown Customer"
          };
        })
      );

      setBookings(bookingsWithCustomers as BookingWithPayments[]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Could not fetch booking data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = async () => {
    if (!user) return;
    
    try {
      // Total earnings
      const { data: paymentsData } = await supabase
        .from("booking_payments")
        .select("amount")
        .eq("painter_id", user.id)
        .eq("status", "succeeded");
      
      const totalEarnings = paymentsData?.reduce(
        (sum, payment) => sum + payment.amount, 
        0
      ) || 0;
      
      // Booking counts
      const { data: pendingData } = await supabase
        .from("bookings")
        .select("id")
        .eq("painter_id", user.id)
        .in("status", ["deposit_paid", "scheduled", "in_progress"]);
      
      const { data: completedData } = await supabase
        .from("bookings")
        .select("id")
        .eq("painter_id", user.id)
        .eq("status", "completed");
      
      setStats({
        totalEarnings,
        pendingBookings: pendingData?.length || 0,
        completedBookings: completedData?.length || 0,
        averageRating: user.companyInfo?.rating || 0,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const companyName = formData.get("companyName") as string;
    const yearsInBusiness = parseInt(formData.get("yearsInBusiness") as string) || 0;
    const businessDescription = formData.get("businessDescription") as string;
    const isInsured = formData.has("isInsured");

    if (!user || !user.companyInfo) return;
    
    setIsLoading(true);
    
    try {
      const updatedCompanyInfo = {
        ...user.companyInfo,
        companyName,
        yearsInBusiness,
        businessDescription,
        isInsured,
        specialties
      };
      
      await updateUserProfile({
        companyInfo: updatedCompanyInfo
      });
      
      toast({
        title: "Profile Updated",
        description: "Your company profile has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSpecialty = () => {
    if (!newSpecialty.trim()) return;
    if (specialties.includes(newSpecialty.trim())) {
      toast({
        title: "Specialty already exists",
        description: "This specialty is already in your list."
      });
      return;
    }
    
    setSpecialties([...specialties, newSpecialty.trim()]);
    setNewSpecialty("");
  };
  
  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "deposit_paid":
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "final_payment_pending":
        return "bg-orange-100 text-orange-800";
      case "pending_deposit":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };
  
  const getStatusLabel = (status: string) => {
    // Convert status from snake_case to Title Case with spaces
    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!user) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="p-4 rounded-full bg-primary/10 mr-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="p-4 rounded-full bg-primary/10 mr-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming Jobs</p>
              <p className="text-2xl font-bold">{stats.pendingBookings}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="p-4 rounded-full bg-primary/10 mr-4">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Your latest painting projects</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">Loading bookings...</div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{booking.customerName}</div>
                            <div className="text-sm text-muted-foreground">{booking.project_type}</div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {formatDate(booking.date)}
                              <Clock className="h-3.5 w-3.5 mx-1 ml-2" />
                              {booking.time}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                            <div className="text-sm font-medium mt-1">
                              {formatCurrency(booking.total_amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <PaintBucket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No bookings yet</p>
                    </div>
                  )}
                  {bookings.length > 0 && (
                    <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("bookings")}>
                      View All Bookings
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Status</CardTitle>
                  <CardDescription>Your current Pro Painter subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.subscription ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <Badge variant={user.subscription.status === "active" ? "default" : "outline"}>
                            {user.subscription.status === "active" ? "Active" : user.subscription.status}
                          </Badge>
                          {user.subscription.status === "active" && (
                            <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.subscription.plan} Plan - {formatCurrency(user.subscription.amount || 0)}/{user.subscription.interval || "month"}
                        </p>
                        {user.subscription.endDate && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Renews: {formatDate(user.subscription.endDate)}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" onClick={() => navigate("/subscription")}>Manage</Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="mb-4">You don't have an active subscription</p>
                      <Button onClick={() => navigate("/subscription")}>Subscribe Now</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                  <CardDescription>Your business information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <Avatar className="h-20 w-20 mx-auto mb-2">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.companyInfo?.companyName?.charAt(0) || user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium text-lg">
                      {user.companyInfo?.companyName || user.name}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Brush className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Specialties</div>
                        <div className="text-sm text-muted-foreground">
                          {user.companyInfo?.specialties?.length ? 
                            user.companyInfo.specialties.join(", ") : 
                            "No specialties added"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Experience</div>
                        <div className="text-sm text-muted-foreground">
                          {user.companyInfo?.yearsInBusiness ? 
                            `${user.companyInfo.yearsInBusiness} years in business` : 
                            "Experience not specified"}
                        </div>
                      </div>
                    </div>
                    
                    {user.location?.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Location</div>
                          <div className="text-sm text-muted-foreground">
                            {user.location.address}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {user.location?.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-sm font-medium">Contact</div>
                          <div className="text-sm text-muted-foreground">
                            {user.location.phone}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setActiveTab("profile")}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
              <CardDescription>Manage all your painting projects</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading bookings...</div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-sm text-muted-foreground">{booking.project_type}</div>
                          <div className="flex flex-wrap items-center text-sm text-muted-foreground mt-1 gap-y-1">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(booking.date)}
                            <span className="mx-2">•</span>
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {booking.time}
                            <span className="mx-2">•</span>
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {booking.address}
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end">
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                          <div className="text-sm font-medium mt-2">
                            {formatCurrency(booking.total_amount)}
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/50 p-3 text-sm border-t">
                        <div className="font-medium mb-1">Notes:</div>
                        <p className="text-muted-foreground">
                          {booking.notes || "No additional notes provided."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PaintBucket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No bookings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Manage your business information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      defaultValue={user.companyInfo?.companyName || ""}
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearsInBusiness">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      name="yearsInBusiness"
                      type="number"
                      min="0"
                      defaultValue={user.companyInfo?.yearsInBusiness || ""}
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSpecialty(specialty)}>
                        {specialty} <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Add a specialty"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSpecialty())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddSpecialty}>
                      Add
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    name="businessDescription"
                    defaultValue={user.companyInfo?.businessDescription || ""}
                    placeholder="Describe your painting business and services"
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isInsured"
                    name="isInsured"
                    defaultChecked={user.companyInfo?.isInsured || false}
                  />
                  <Label htmlFor="isInsured">My business is insured</Label>
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage your Pro Painter subscription</CardDescription>
            </CardHeader>
            <CardContent>
              {user.subscription ? (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium text-lg">Pro Painter Plan</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(user.subscription.amount || 49)}/{user.subscription.interval || "month"}
                        </p>
                      </div>
                      <Badge variant={user.subscription.status === "active" ? "default" : "destructive"}>
                        {user.subscription.status === "active" ? "Active" : user.subscription.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Status</span>
                        <span className="text-sm font-medium">
                          {user.subscription.status === "active" ? "Active" : user.subscription.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Started On</span>
                        <span className="text-sm font-medium">
                          {user.subscription.startDate ? formatDate(user.subscription.startDate) : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Next Billing Date</span>
                        <span className="text-sm font-medium">
                          {user.subscription.endDate ? formatDate(user.subscription.endDate) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Plan Benefits</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">Priority listing in search results</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">Verified painter badge on profile</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">Accept unlimited booking requests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm">Customer insights and analytics</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" onClick={() => navigate("/subscription")}>
                    Manage Subscription
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-6">
                    Subscribe to our Pro Painter plan to get more customers and grow your business.
                  </p>
                  <Button onClick={() => navigate("/subscription")}>
                    View Subscription Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PainterDashboard;
