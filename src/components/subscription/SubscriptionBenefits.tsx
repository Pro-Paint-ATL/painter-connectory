
import React from "react";
import { Users, Shield, Clock } from "lucide-react";

const SubscriptionBenefits: React.FC = () => {
  return (
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
  );
};

export default SubscriptionBenefits;
