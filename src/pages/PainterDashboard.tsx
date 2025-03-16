
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
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { BookingWithPayments } from "@/types/auth";

// Dashboard Components
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import BookingsList from "@/components/dashboard/BookingsList";
import CompanyProfileForm from "@/components/dashboard/CompanyProfileForm";
import SubscriptionPanel from "@/components/dashboard/SubscriptionPanel";

const PainterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingWithPayments[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
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
      // Update the query to fetch bookings without joining payments table
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("painter_id", user.id)
        .order("date", { ascending: false });
      
      if (error) throw error;
      
      // Fetch payments separately and then combine them
      const bookingsWithCustomers = await Promise.all(
        data.map(async (booking) => {
          // Get customer information
          const { data: customerData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", booking.customer_id)
            .single();
          
          // Get payment information for this booking
          const { data: paymentsData, error: paymentsError } = await supabase
            .from("booking_payments")
            .select("*")
            .eq("booking_id", booking.id);
            
          if (paymentsError) {
            console.error("Error fetching payments for booking:", booking.id, paymentsError);
          }
          
          // Convert payment data to proper BookingPayment type
          let typedPayments = [];
          if (paymentsData && Array.isArray(paymentsData)) {
            typedPayments = paymentsData;
          }
          
          return {
            ...booking,
            customerName: customerData?.name || "Unknown Customer",
            payments: typedPayments
          } as BookingWithPayments;
        })
      );

      setBookings(bookingsWithCustomers);
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
      const { data: paymentsData } = await supabase
        .from("booking_payments")
        .select("amount")
        .eq("painter_id", user.id)
        .eq("status", "succeeded");
      
      const totalEarnings = paymentsData?.reduce(
        (sum, payment) => sum + payment.amount, 
        0
      ) || 0;
      
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
      <DashboardStats stats={stats} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <DashboardOverview 
            bookings={bookings} 
            isLoading={isLoading} 
            user={user} 
            setActiveTab={setActiveTab}
            navigate={navigate}
          />
        </TabsContent>
        
        <TabsContent value="bookings">
          <BookingsList 
            bookings={bookings} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="profile">
          <CompanyProfileForm user={user} />
        </TabsContent>
        
        <TabsContent value="subscription">
          <SubscriptionPanel 
            user={user} 
            navigate={navigate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PainterDashboard;
