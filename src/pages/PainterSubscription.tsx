
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, PaintBucket, Shield, Clock, Users, CreditCard, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { formatCardNumber, formatExpiryDate, formatCVC, stripePromise } from "@/utils/stripe";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Inner component that uses Stripe hooks
const SubscriptionForm = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Get Stripe objects
  const stripe = useStripe();
  const elements = useElements();
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    nameOnCard: "",
  });
  
  const [cardError, setCardError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format input values based on field type
    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvc') {
      formattedValue = formatCVC(value);
    }
    
    setPaymentInfo((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure stripe and elements are loaded
    if (!stripe || !elements) {
      setCardError("Stripe has not loaded yet. Please try again.");
      return;
    }
    
    setLoading(true);
    setCardError(null);
    
    try {
      // Get a reference to the card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error("Card element not found");
      }
      
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: paymentInfo.nameOnCard,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // In a real implementation, you would send this to your server
      console.log('Payment method created: ', paymentMethod);
      
      // Simulate payment confirmation from server
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user with subscription status
      updateUserProfile({
        subscription: {
          status: "active",
          plan: "pro",
          startDate: new Date().toISOString(),
          amount: 49,
          currency: "USD",
          interval: "month",
          paymentMethodId: paymentMethod.id,
          lastFour: paymentMethod.card?.last4 || '0000',
          brand: paymentMethod.card?.brand || 'unknown',
        }
      });
      
      // Show success dialog
      setShowSuccessDialog(true);
      
      toast({
        title: "Subscription Successful!",
        description: "You are now a Pro Painter and will be charged $49/month.",
      });
      
    } catch (error) {
      console.error("Payment error:", error);
      if (error instanceof Error) {
        setCardError(error.message);
      } else {
        setCardError("There was an error processing your payment. Please try again.");
      }
      
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Success dialog handler
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    navigate("/profile");
  };

  return (
    <>
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
                <label htmlFor="cardDetails" className="text-sm font-medium">Card Details</label>
                <div className="border border-input rounded-md p-3 bg-background">
                  <CardElement
                    id="cardDetails"
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: 'var(--foreground)',
                          '::placeholder': {
                            color: 'var(--muted-foreground)',
                          },
                        },
                        invalid: {
                          color: 'var(--destructive)',
                        },
                      },
                    }}
                  />
                </div>
                {cardError && (
                  <p className="text-sm text-destructive mt-1">{cardError}</p>
                )}
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !stripe}
                >
                  {loading ? "Processing..." : "Subscribe Now - $49/month"}
                </Button>
              </div>
              
              <div className="flex items-center justify-center text-xs text-muted-foreground mt-4 gap-1">
                <Lock className="h-3 w-3" />
                <span>Payments are secure and encrypted</span>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                By subscribing, you agree to our Terms of Service and authorize us to charge your card $49 monthly until you cancel.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Successful!</DialogTitle>
            <DialogDescription>
              You've successfully subscribed to the Pro Painter plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-primary/10 p-4 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <p>
              Your Pro Painter subscription has been activated. You now have access to all premium features including priority listing, verified badge, unlimited bookings, and more.
            </p>
            <p className="text-sm text-muted-foreground">
              Your card will be charged $49/month. The next billing date is {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}.
            </p>
            <Button className="w-full" onClick={handleCloseSuccessDialog}>
              Go to my Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Main component that includes Stripe Elements provider
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
          <Elements stripe={stripePromise}>
            <SubscriptionForm />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PainterSubscription;
