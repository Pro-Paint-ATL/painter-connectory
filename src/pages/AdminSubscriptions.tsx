
import React, { useState } from "react";
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
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Check, 
  X,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface SubscriptionControls {
  id: string;
  name: string;
  email: string;
  status: "active" | "past_due" | "canceled" | null;
  subscriptionId?: string;
  customerId?: string;
}

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: subscriptions = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      if (!user || user.role !== "admin") return [];
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, subscription')
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
        
        // Map and transform data to proper format
        return data.map(profile => {
          const subscription = profile.subscription as any;
          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            status: subscription?.status || null,
            subscriptionId: subscription?.stripeSubscriptionId,
            customerId: subscription?.stripeCustomerId
          } as SubscriptionControls;
        });
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
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

  // Filter subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = async (painterId: string, action: 'activate' | 'cancel') => {
    if (actionLoading) return;
    
    setActionLoading(painterId);
    try {
      // In a real application, this would call your backend API to handle the Stripe integration
      // For this demo, we'll just update the local state
      
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the existing subscription data for this painter
      const painterToUpdate = subscriptions.find(s => s.id === painterId);
      
      // Update subscription status
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription: {
            ...subscriptions.find(s => s.id === painterId)?.subscription,
            status: action === 'activate' ? 'active' : 'canceled',
            stripeSubscriptionId: painterToUpdate?.subscriptionId,
            stripeCustomerId: painterToUpdate?.customerId,
          }
        })
        .eq('id', painterId);
      
      if (error) throw error;
      
      toast({
        title: action === 'activate' ? "Subscription Activated" : "Subscription Canceled",
        description: `Painter subscription has been ${action === 'activate' ? 'activated' : 'canceled'} successfully.`,
      });
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error("Action error:", error);
      toast({
        title: "Error",
        description: `Failed to ${action} subscription. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access this page.
              </p>
              <Button onClick={() => navigate("/")}>
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-muted-foreground">Manage and control painter subscriptions</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription Controls</CardTitle>
          <CardDescription>
            Activate or cancel painter subscriptions
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
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-medium text-sm">
              <div>Painter</div>
              <div>Status</div>
              <div>Subscription ID</div>
              <div>Actions</div>
            </div>
            
            <div className="divide-y">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin mr-2">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">Loading subscriptions...</span>
                </div>
              ) : filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="grid grid-cols-4 gap-4 p-4 items-center text-sm">
                    <div>
                      <div className="font-medium">{subscription.name}</div>
                      <div className="text-muted-foreground text-xs">{subscription.email}</div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : subscription.status === 'past_due'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {subscription.status || 'No subscription'}
                      </span>
                    </div>
                    <div>
                      {subscription.subscriptionId ? (
                        <span className="font-mono text-xs">{subscription.subscriptionId.slice(0, 14)}...</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div>
                      <div className="flex gap-2">
                        {subscription.status !== 'active' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-1 text-xs h-8 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 border-green-200"
                            onClick={() => handleAction(subscription.id, 'activate')}
                            disabled={actionLoading === subscription.id}
                          >
                            {actionLoading === subscription.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Activate
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-1 text-xs h-8 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 border-red-200"
                            onClick={() => handleAction(subscription.id, 'cancel')}
                            disabled={actionLoading === subscription.id}
                          >
                            {actionLoading === subscription.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No subscriptions found matching your search.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
