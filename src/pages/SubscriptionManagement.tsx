
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionApi } from "@/api/subscriptionApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const { currentSubscription, unsubscribe } = useSubscriptionApi();
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await unsubscribe();
      setShowCancelDialog(false);
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Not Authorized</CardTitle>
            <CardDescription>You need to log in to view subscription details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>
      
      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Subscription Details</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Information</CardTitle>
              <CardDescription>Manage your Pro Painter subscription</CardDescription>
            </CardHeader>
            <CardContent>
              {currentSubscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status</span>
                    <Badge variant={currentSubscription.status === "active" ? "default" : "destructive"}>
                      {currentSubscription.status === "active" ? "Active" : currentSubscription.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Plan</span>
                    <span>{currentSubscription.plan} Plan</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Price</span>
                    <span>{currentSubscription.amount} {currentSubscription.currency}/{currentSubscription.interval}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Started On</span>
                    <span>{formatDate(currentSubscription.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Next Billing Date</span>
                    <span>{formatDate(currentSubscription.startDate ? new Date(new Date(currentSubscription.startDate).setMonth(new Date(currentSubscription.startDate).getMonth() + 1)).toISOString() : null)}</span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {currentSubscription.brand} ending in {currentSubscription.lastFour}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have an active subscription at the moment.
                  </p>
                  <Button onClick={() => window.location.href = "/subscription"}>
                    Subscribe Now
                  </Button>
                </div>
              )}
            </CardContent>
            {currentSubscription?.status === "active" && (
              <CardFooter>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setShowCancelDialog(true)}>
                  Cancel Subscription
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past invoices and payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <p>Billing history will be available here in production.</p>
                <p className="text-sm">In a real-world implementation, this would show invoices from the Stripe API.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your Pro Painter subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              If you cancel, your subscription will remain active until the end of your current billing period. After that, you will lose access to all premium features.
            </p>
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-md flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <p className="text-sm text-orange-700 dark:text-orange-400">
                You won't receive a refund for the current billing period. Your subscription will expire on {formatDate(currentSubscription?.startDate ? new Date(new Date(currentSubscription.startDate).setMonth(new Date(currentSubscription.startDate).getMonth() + 1)).toISOString() : null)}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription} 
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManagement;
