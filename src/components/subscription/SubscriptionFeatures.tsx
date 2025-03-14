
import React from "react";
import { CheckCircle2 } from "lucide-react";

const SubscriptionFeatures: React.FC = () => {
  return (
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
  );
};

export default SubscriptionFeatures;
