
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createTrialSubscription } from "@/utils/companySetup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Direct Stripe checkout link
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9AQeVl7aMbAbaHedQQ";

const SubscriptionForm: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRedirectDialogOpen, setIsRedirectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Start free trial process
  const handleStartTrial = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      // First try the normal way
      const success = await createTrialSubscription(user.id);
      
      if (success) {
        toast({
          title: "Free Trial Started!",
          description: "Your 21-day free trial has been activated. Enjoy all Pro features!",
        });
        
        // Update local user object to avoid needing a page refresh
        if (updateUserProfile) {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 21);
          
          await updateUserProfile({
            subscription: {
              status: 'trial',
              plan: 'pro',
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              amount: 49,
              currency: 'usd',
              interval: 'month',
              trialEnds: endDate.toISOString(),
            }
          });
        }
        
        // Navigate to dashboard after success
        toast({
          title: "Redirecting...",
          description: "Taking you to your dashboard."
        });
        setTimeout(() => navigate("/painter-dashboard"), 1500);
      } else {
        // If failed and we haven't retried too many times
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          setErrorMessage("Trial activation encountered an issue. Please try again.");
        } else {
          toast({
            title: "Error Starting Trial",
            description: "There was a problem activating your free trial. Please try the Stripe subscription option instead.",
            variant: "destructive"
          });
          setErrorMessage("We're having technical difficulties with trial activation. Please use the Stripe option below.");
        }
      }
    } catch (error) {
      console.error("Error in handleStartTrial:", error);
      setErrorMessage("An unexpected error occurred. Please try the Stripe subscription option instead.");
      toast({
        title: "Error Starting Trial",
        description: "There was a problem activating your free trial. Please try again or use Stripe checkout.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle external Stripe checkout
  const handleSubscribe = () => {
    setIsRedirectDialogOpen(true);
  };

  // When user confirms redirect to Stripe
  const handleConfirmRedirect = () => {
    window.open(STRIPE_PAYMENT_LINK, '_blank');
    setIsRedirectDialogOpen(false);
    
    // Show toast notification to guide the user
    toast({
      title: "Stripe Checkout Opened",
      description: "Complete your subscription in the new tab. You'll be redirected back after payment.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pro Painter Subscription</CardTitle>
          <CardDescription>Get started with a 21-day free trial</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Subscription Error</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          
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
              onClick={handleStartTrial}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Start Your 21-Day Free Trial"}
            </Button>
            
            <div className="flex justify-center">
              <p className="text-sm text-muted-foreground">- or -</p>
            </div>
            
            <Button 
              className="w-full" 
              variant="outline"
              size="lg"
              onClick={handleSubscribe}
              disabled={isProcessing}
            >
              Subscribe with Stripe
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

      {/* Dialog to inform user about redirect */}
      <Dialog open={isRedirectDialogOpen} onOpenChange={setIsRedirectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              You'll be redirected to Stripe to complete your subscription. After payment, your account will be upgraded automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsRedirectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRedirect}>
              Continue to Stripe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionForm;
