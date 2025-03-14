
import React from "react";

const PricingInfo: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="text-4xl font-bold mb-2">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
      <div className="inline-block bg-primary/10 rounded-full px-4 py-2 text-primary font-medium mb-6">
        Start with a 21-day free trial
      </div>
      <p className="text-muted-foreground mb-6">
        Unlock premium benefits and get more clients with our painter subscription
      </p>
      <div className="text-sm bg-muted p-4 rounded-md space-y-2">
        <p className="font-medium text-foreground">Important Information:</p>
        <ul className="list-disc list-inside text-muted-foreground">
          <li>No credit card required for trial</li>
          <li>Cancel anytime during your trial period</li>
          <li>Use the button below to activate your free trial</li>
          <li>If you encounter any issues, please try refreshing the page</li>
        </ul>
      </div>
    </div>
  );
};

export default PricingInfo;
