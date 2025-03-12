import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { UserLocation } from "@/types/auth";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  Brush,
  DollarSign,
  CreditCard,
  ChevronRight
} from "lucide-react";
import BookingCalendar from "@/components/booking/BookingCalendar";
import PaymentForm from "@/components/booking/PaymentForm";
import { Painter } from "@/types/painter";

const PROJECT_TYPES = [
  "Interior Painting",
  "Exterior Painting",
  "Cabinet Refinishing",
  "Deck Staining",
  "Wallpaper Installation",
  "Color Consultation",
  "Commercial Painting",
  "Other"
];

const Booking = () => {
  const { painterId } = useParams<{ painterId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("1");
  const [bookingDate, setBookingDate] = useState<Date | undefined>();
  const [bookingTime, setBookingTime] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [address, setAddress] = useState<string>(() => {
    if (user?.location) {
      const location = user.location as UserLocation;
      return location.address || "";
    }
    return "";
  });
  const [phone, setPhone] = useState<string>(() => {
    if (user?.location) {
      const location = user.location as UserLocation;
      return location.phone || "";
    }
    return "";
  });
  const [notes, setNotes] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [bookingId, setBookingId] = useState<string>("");
  
  const { 
    data: painter, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["painter", painterId],
    queryFn: async () => {
      if (!painterId) throw new Error("Painter ID is required");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar, email, role, location, company_info")
        .eq("id", painterId)
        .eq("role", "painter")
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("Painter not found");
      
      const companyInfo = data.company_info as any || {};
      const formattedPainter: Painter = {
        id: data.id,
        name: data.name || "Unknown Painter",
        avatar: data.avatar || "",
        rating: companyInfo.rating || 0,
        reviewCount: companyInfo.reviewCount || 0,
        distance: 0,
        location: data.location?.address || "Location not specified",
        yearsInBusiness: companyInfo.yearsInBusiness || 0,
        isInsured: companyInfo.isInsured || false,
        specialties: companyInfo.specialties || [],
        isSubscribed: true
      };
      
      return formattedPainter;
    },
    enabled: !!painterId
  });
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a painter",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [user, navigate, toast]);
  
  useEffect(() => {
    setDepositAmount(Math.round(totalAmount * 0.15 * 100) / 100);
  }, [totalAmount]);
  
  const handleTimeSelection = (time: string) => {
    setBookingTime(time);
  };
  
  const handleProjectTypeSelection = (type: string) => {
    setProjectType(type);
    
    const basePrices: Record<string, number> = {
      "Interior Painting": 500,
      "Exterior Painting": 800,
      "Cabinet Refinishing": 1200,
      "Deck Staining": 600,
      "Wallpaper Installation": 400,
      "Color Consultation": 150,
      "Commercial Painting": 1500,
      "Other": 300
    };
    
    setTotalAmount(basePrices[type] || 300);
  };
  
  const validateStep1 = () => {
    if (!bookingDate) {
      toast({
        title: "Date Required",
        description: "Please select a booking date",
        variant: "destructive"
      });
      return false;
    }
    
    if (!bookingTime) {
      toast({
        title: "Time Required",
        description: "Please select a booking time",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const validateStep2 = () => {
    if (!projectType) {
      toast({
        title: "Project Type Required",
        description: "Please select a project type",
        variant: "destructive"
      });
      return false;
    }
    
    if (!address) {
      toast({
        title: "Address Required",
        description: "Please provide your address",
        variant: "destructive"
      });
      return false;
    }
    
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please provide your phone number",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleCreateBooking = async () => {
    if (!user || !painter || !bookingDate) return;
    
    try {
      const formattedDate = bookingDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          painter_id: painter.id,
          date: formattedDate,
          time: bookingTime,
          address,
          phone,
          project_type: projectType,
          notes,
          status: "pending_deposit",
          total_amount: totalAmount,
          deposit_amount: depositAmount
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setBookingId(data.id);
      toast({
        title: "Booking Created",
        description: "Your booking has been created successfully"
      });
      
      setActiveTab("3");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleNextStep = () => {
    if (activeTab === "1" && validateStep1()) {
      setActiveTab("2");
    } else if (activeTab === "2" && validateStep2()) {
      handleCreateBooking();
    }
  };
  
  const handlePaymentSuccess = () => {
    if (bookingId) {
      supabase
        .from("bookings")
        .update({ status: "deposit_paid" })
        .eq("id", bookingId);
      
      toast({
        title: "Payment Successful",
        description: "Your booking is confirmed. The painter will contact you soon."
      });
      
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <div className="animate-pulse h-8 w-1/3 bg-muted rounded mb-4 mx-auto"></div>
          <div className="animate-pulse h-4 w-1/4 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (error || !painter) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load painter details. Please try again.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button onClick={() => navigate("/find-painters")}>
            Back to Painters
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Book {painter.name}</h1>
          <p className="text-muted-foreground">
            Complete the steps below to schedule a painting service
          </p>
        </header>
        
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "1" ? 'bg-primary text-white' : (parseInt(activeTab) > 1 ? 'bg-green-500 text-white' : 'bg-muted')}`}>
                {parseInt(activeTab) > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-xs mt-1">Schedule</span>
            </div>
            
            <div className="h-0.5 w-full max-w-[80px] bg-muted relative">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all" 
                style={{ width: activeTab === "1" ? "0%" : "100%" }}
              ></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "2" ? 'bg-primary text-white' : (parseInt(activeTab) > 2 ? 'bg-green-500 text-white' : 'bg-muted')}`}>
                {parseInt(activeTab) > 2 ? <CheckCircle className="h-4 w-4" /> : "2"}
              </div>
              <span className="text-xs mt-1">Details</span>
            </div>
            
            <div className="h-0.5 w-full max-w-[80px] bg-muted relative">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all" 
                style={{ width: activeTab === "3" ? "100%" : "0%" }}
              ></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "3" ? 'bg-primary text-white' : 'bg-muted'}`}>
                3
              </div>
              <span className="text-xs mt-1">Payment</span>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsContent value="1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>
                    Choose when you'd like {painter.name} to visit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Select Date</Label>
                    <div className="mt-2">
                      <BookingCalendar 
                        painterId={painterId || ""}
                        onTimeSelected={(date, time) => {
                          setBookingDate(date);
                          handleTimeSelection(time);
                        }}
                        onSelectDate={setBookingDate}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Select Time</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                      {["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"].map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={bookingTime === time ? "default" : "outline"}
                          onClick={() => handleTimeSelection(time)}
                          className="text-sm"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleNextStep}
                    disabled={!bookingDate || !bookingTime}
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Tell us about your painting project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Project Type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {PROJECT_TYPES.map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant={projectType === type ? "default" : "outline"}
                          onClick={() => handleProjectTypeSelection(type)}
                          className="text-sm h-auto py-2"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your full address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Share any specific details about your project"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Estimated Total</span>
                      <span className="font-bold">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Good Faith Deposit (15%)</span>
                      <span>${depositAmount.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 text-xs text-muted-foreground">
                      <Info className="h-3 w-3 inline-block mr-1" />
                      Final price may vary based on project assessment.
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => setActiveTab("1")}
                  >
                    Back
                  </Button>
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={handleNextStep}
                    disabled={!projectType || !address || !phone}
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                  <CardDescription>
                    Pay the good faith deposit to confirm your booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Brush className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{projectType}</div>
                          <div className="text-sm text-muted-foreground">with {painter.name}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {bookingDate?.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{bookingTime}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{address}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Project Total</span>
                        <span className="font-medium">${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Deposit Due Now</span>
                        <span className="font-bold">${depositAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <Label>Payment Method</Label>
                    </div>
                    <PaymentForm 
                      amount={depositAmount} 
                      bookingId={bookingId}
                      onSuccess={handlePaymentSuccess}
                      onCancel={() => setActiveTab("2")}
                    />
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Deposit Information</AlertTitle>
                    <AlertDescription>
                      This is a 15% good faith deposit to secure your booking. 
                      The remaining balance will be due upon completion of the work.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("2")}
                    disabled={!bookingId}
                  >
                    Back
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Booking;
