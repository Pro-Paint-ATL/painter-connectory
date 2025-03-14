
import React from "react";

const PricingInfo: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="text-4xl font-bold mb-2">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
      <div className="inline-block bg-primary/10 rounded-full px-4 py-2 text-primary font-medium mb-6">
        Start with a 21-day free trial
      </div>
      <p className="text-muted-foreground mb-6">
        Unlock premium benefits and get more clients
      </p>
      <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
        No credit card required for trial. Cancel anytime.
      </div>
    </div>
  );
};

export default PricingInfo;
