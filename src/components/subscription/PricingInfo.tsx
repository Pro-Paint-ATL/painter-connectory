
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

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
      
      <Alert className="mb-4">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>No credit card required for trial</li>
            <li>Cancel anytime during your trial period</li>
            <li>Use the button below to activate your free trial</li>
            <li>If you encounter any issues, please try refreshing the page</li>
          </ul>
        </AlertDescription>
      </Alert>
      
      <div className="text-sm p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
        <p className="font-medium">Having trouble signing up?</p>
        <p className="mt-1">If you're experiencing issues creating your account, please try the following:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Make sure you've selected "Painter" during registration</li>
          <li>Try using a different email address</li>
          <li>Ensure your password is at least 6 characters</li>
          <li>If problems persist, please contact support</li>
        </ul>
      </div>
    </div>
  );
};

export default PricingInfo;
