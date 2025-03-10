
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, PaintBucket, Shield, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PainterSubscription = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    nameOnCard: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, this would connect to Stripe API
      // For demo purposes, we'll simulate a successful payment
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Update user with subscription status
      updateUserProfile({
        subscription: {
          status: "active",
          plan: "pro",
          startDate: new Date().toISOString(),
          amount: 49,
          currency: "USD",
          interval: "month",
        }
      });
      
      toast({
        title: "Subscription Successful!",
        description: "You are now a Pro Painter and will be charged $49/month.",
      });
      
      navigate("/profile");
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user is a painter
  if (user?.role !== "painter") {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Subscription Available for Painters Only</CardTitle>
            <CardDescription>
              This subscription plan is only available for painter accounts.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check if already subscribed
  if (user?.subscription?.status === "active") {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>You're Already Subscribed!</CardTitle>
            <CardDescription>
              You already have an active Pro Painter subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-accent/50 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Pro Painter Plan</div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Next billing date: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/profile")}>Go to Profile</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold mb-6">Pro Painter Subscription</h1>
          <div className="mb-8">
            <div className="text-4xl font-bold mb-2">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            <p className="text-muted-foreground mb-6">
              Unlock premium benefits and get more clients
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Priority listing in search results</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Verified painter badge on your profile</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Accept unlimited booking requests</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Customer insights and analytics</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Dedicated customer support</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Why Subscribe?</h3>
            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">More Customer Leads</h4>
                  <p className="text-sm text-muted-foreground">Get up to 3x more client requests</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Verified Status</h4>
                  <p className="text-sm text-muted-foreground">Build trust with potential clients</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Save Time</h4>
                  <p className="text-sm text-muted-foreground">Efficient tools to manage your clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Enter your card details to subscribe</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="nameOnCard" className="text-sm font-medium">Name on Card</label>
                    <Input
                      id="nameOnCard"
                      name="nameOnCard"
                      placeholder="John Smith"
                      value={paymentInfo.nameOnCard}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="cardNumber" className="text-sm font-medium">Card Number</label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={paymentInfo.cardNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={paymentInfo.expiryDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="cvc" className="text-sm font-medium">CVC</label>
                      <Input
                        id="cvc"
                        name="cvc"
                        placeholder="123"
                        value={paymentInfo.cvc}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Subscribe Now - $49/month"}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By subscribing, you agree to our Terms of Service and authorize us to charge your card $49 monthly until you cancel.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PainterSubscription;
