
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Calendar, PaintBucket, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch subscribed painters from Supabase
  const { data: painters = [], isLoading: isLoadingPainters } = useQuery({
    queryKey: ["subscribedPainters"],
    queryFn: async () => {
      if (!user || user.role !== "admin") return [];
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'painter')
          .order('created_at', { ascending: false });
        
        if (error) {
          toast({
            title: "Error",
            description: "Failed to load subscription data.",
            variant: "destructive"
          });
          console.error("Supabase error:", error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error("Error fetching painters:", err);
        toast({
          title: "Error",
          description: "Failed to load subscription data.",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!user && user.role === "admin"
  });

  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [user, navigate, toast]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const totalRevenue = painters.reduce((sum, painter) => {
    return sum + (painter.subscription?.amount || 0);
  }, 0);
  
  const activePainters = painters.filter(p => p.subscription?.status === "active").length;
  const pastDuePainters = painters.filter(p => p.subscription?.status === "past_due").length;

  const filteredPainters = painters.filter(painter => 
    painter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    painter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage painter subscriptions and revenue</p>
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/subscriptions")}
          >
            Manage Subscriptions
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold">${totalRevenue}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <PaintBucket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
              <h3 className="text-2xl font-bold">{activePainters}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="bg-destructive/10 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Past Due</p>
              <h3 className="text-2xl font-bold">{pastDuePainters}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Painter Subscriptions</CardTitle>
          <CardDescription>
            View and manage all painter subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search painters..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium text-sm">
              <div>Painter</div>
              <div>Subscription Date</div>
              <div>Status</div>
              <div>Amount</div>
              <div>Next Billing</div>
            </div>
            
            <div className="divide-y">
              {filteredPainters.length > 0 ? (
                filteredPainters.map((painter) => (
                  <div key={painter.id} className="grid grid-cols-5 gap-4 p-4 items-center text-sm">
                    <div>
                      <div className="font-medium">{painter.name}</div>
                      <div className="text-muted-foreground text-xs">{painter.email}</div>
                    </div>
                    <div>{formatDate(painter.subscription?.subscriptionDate)}</div>
                    <div>
                      <Badge 
                        variant={painter.subscription?.status === "active" ? "outline" : "destructive"}
                        className={painter.subscription?.status === "active" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}
                      >
                        {painter.subscription?.status === "active" ? "Active" : "Past Due"}
                      </Badge>
                    </div>
                    <div>${painter.subscription?.amount}/month</div>
                    <div>{formatDate(painter.subscription?.nextBillingDate)}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No painters found matching your search.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
