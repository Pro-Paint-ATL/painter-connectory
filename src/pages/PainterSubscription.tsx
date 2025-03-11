
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, PaintBucket, Shield, Clock, Users, CreditCard, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Direct Stripe checkout link
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9AQeVl7aMbAbaHedQQ";

const PainterSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
              {user.subscription.lastFour && (
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  <span>
                    {user.subscription.brand} ending in {user.subscription.lastFour}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/profile")}>Go to Profile</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Handle external Stripe checkout
  const handleSubscribe = () => {
    window.open(STRIPE_PAYMENT_LINK, '_blank');
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold mb-6">Pro Painter Subscription</h1>
          <div className="mb-8">
            <div className="text-4xl font-bold mb-2">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            <div className="inline-block bg-primary/10 rounded-full px-4 py-2 text-primary font-medium mb-6">
              Start with a 21-day free trial
            </div>
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
              <CardTitle>Pro Painter Subscription</CardTitle>
              <CardDescription>Get started with a 21-day free trial</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg bg-primary/5 p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    21-Day Free Trial
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try all Pro features free for 21 days. Cancel anytime during your trial and you won't be charged.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Pro Painter Plan</span>
                    <span className="font-medium">$49/month</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>First payment</span>
                    <span>After 21-day trial</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubscribe}
                >
                  Start Your 21-Day Free Trial
                </Button>
                
                <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Secure payment processing by Stripe</span>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  By subscribing, you agree to our Terms of Service. After your free trial ends, you'll be charged $49 monthly until you cancel.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PainterSubscription;
