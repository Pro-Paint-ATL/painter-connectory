
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import SubscriptionFeatures from "@/components/subscription/SubscriptionFeatures";
import SubscriptionBenefits from "@/components/subscription/SubscriptionBenefits";
import PricingInfo from "@/components/subscription/PricingInfo";
import SubscriptionForm from "@/components/subscription/SubscriptionForm";
import ActiveSubscription from "@/components/subscription/ActiveSubscription";
import PaintersOnlyMessage from "@/components/subscription/PaintersOnlyMessage";

const PainterSubscription = () => {
  const { user } = useAuth();

  // Effect to check if user has subscription after component mounts
  // This can help if the subscription was created but the UI didn't update
  useEffect(() => {
    if (user && (user.subscription?.status === "active" || user.subscription?.status === "trial")) {
      // If user already has a subscription, force a page refresh to update UI
      window.location.reload();
    }
  }, [user]);

  // Check if user is a painter
  if (user?.role !== "painter") {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <PaintersOnlyMessage />
      </div>
    );
  }

  // Check if already subscribed - now handles both active and trial status
  if (user?.subscription?.status === "active" || user?.subscription?.status === "trial") {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <ActiveSubscription subscription={user.subscription} />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold mb-6">Pro Painter Subscription</h1>
          <PricingInfo />
          <SubscriptionFeatures />
          <SubscriptionBenefits />
        </div>

        <div>
          <SubscriptionForm />
        </div>
      </div>
    </div>
  );
};

export default PainterSubscription;
