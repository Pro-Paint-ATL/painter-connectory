
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Import the new components
import NoAccessCard from "@/components/subscription/NoAccessCard";
import ActiveSubscriptionCard from "@/components/subscription/ActiveSubscriptionCard";
import SubscriptionBenefits from "@/components/subscription/SubscriptionBenefits";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import RedirectDialog from "@/components/subscription/RedirectDialog";
import { updateSubscriptionAfterCheckout } from "@/api/webhooks";

// Direct Stripe checkout link
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9AQeVl7aMbAbaHedQQ";

const PainterSubscription = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isRedirectDialogOpen, setIsRedirectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for Stripe success parameter in URL
  useEffect(() => {
    const checkStripeSuccess = async () => {
      // Parse the URL search parameters
      const searchParams = new URLSearchParams(location.search);
      const success = searchParams.get('success');
      const canceled = searchParams.get('canceled');
      
      // If success parameter exists and is true
      if (success === 'true' && user && user.id) {
        setIsCheckingSubscription(true);
        
        try {
          // Update the subscription in our database
          const result = await updateSubscriptionAfterCheckout(user.id);
          
          if (result.success) {
            // Update local user state with new subscription data
            await updateUserProfile({
              subscription: result.subscription
            });
            
            toast({
              title: "Subscription Active",
              description: "Your Pro Painter subscription is now active!",
              variant: "default"
            });
            
            // Navigate to dashboard after a short delay
            setTimeout(() => {
              navigate('/painter-dashboard');
            }, 1500);
          } else {
            toast({
              title: "Subscription Update Failed",
              description: "There was an issue activating your subscription. Please contact support.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error updating subscription:", error);
          toast({
            title: "Subscription Error",
            description: "Failed to update subscription status. Please contact support.",
            variant: "destructive"
          });
        } finally {
          setIsCheckingSubscription(false);
        }
      } else if (canceled === 'true') {
        toast({
          title: "Subscription Canceled",
          description: "You've canceled the subscription process.",
          variant: "default"
        });
      }
      
      // Clean up URL parameters if they exist
      if ((success || canceled) && window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    };
    
    checkStripeSuccess();
  }, [location, user, updateUserProfile, navigate, toast]);

  // Check if user is a painter
  if (user?.role !== "painter") {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <NoAccessCard />
      </div>
    );
  }

  // Show loading state while checking subscription status
  if (isCheckingSubscription) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4 text-center">
        <div className="animate-pulse">
          <h2 className="text-2xl font-bold mb-4">Activating Your Subscription</h2>
          <p className="text-muted-foreground">Please wait while we activate your Pro Painter account...</p>
        </div>
      </div>
    );
  }

  // Check if already subscribed - now handles both active and trial status
  if (user?.subscription?.status === "active" || user?.subscription?.status === "trial") {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <ActiveSubscriptionCard user={user} />
      </div>
    );
  }

  // Handle subscription button click
  const handleSubscribe = () => {
    setIsRedirectDialogOpen(true);
  };

  // When user confirms redirect to Stripe
  const handleConfirmRedirect = () => {
    // Add success and cancel URLs to the Stripe link
    const successUrl = window.location.origin + window.location.pathname + '?success=true';
    const cancelUrl = window.location.origin + window.location.pathname + '?canceled=true';
    
    // Construct the final URL with success and cancel parameters
    const checkoutUrl = `${STRIPE_PAYMENT_LINK}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    
    window.open(checkoutUrl, '_self');
    setIsRedirectDialogOpen(false);
    
    // Show toast notification to guide the user
    toast({
      title: "Redirecting to Stripe",
      description: "You'll be redirected back after payment.",
    });
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <SubscriptionBenefits />
        </div>

        <div>
          <SubscriptionCard 
            onSubscribe={handleSubscribe}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Dialog to inform user about redirect */}
      <RedirectDialog 
        open={isRedirectDialogOpen}
        onOpenChange={setIsRedirectDialogOpen}
        onConfirm={handleConfirmRedirect}
      />
    </div>
  );
};

export default PainterSubscription;
