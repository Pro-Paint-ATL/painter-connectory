
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Import the new components
import NoAccessCard from "@/components/subscription/NoAccessCard";
import ActiveSubscriptionCard from "@/components/subscription/ActiveSubscriptionCard";
import SubscriptionBenefits from "@/components/subscription/SubscriptionBenefits";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import RedirectDialog from "@/components/subscription/RedirectDialog";

// Direct Stripe checkout link
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9AQeVl7aMbAbaHedQQ";

const PainterSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRedirectDialogOpen, setIsRedirectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user is a painter
  if (user?.role !== "painter") {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <NoAccessCard />
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
    window.open(STRIPE_PAYMENT_LINK, '_blank');
    setIsRedirectDialogOpen(false);
    
    // Show toast notification to guide the user
    toast({
      title: "Stripe Checkout Opened",
      description: "Complete your subscription in the new tab. You'll be redirected back after payment.",
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
