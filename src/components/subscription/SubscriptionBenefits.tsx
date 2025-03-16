
import React from "react";
import { CheckCircle2, Shield, Clock, Users } from "lucide-react";

const SubscriptionBenefits = () => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Pro Painter Subscription</h1>
      <div className="mb-8">
        <div className="text-4xl font-bold mb-2">$49<span className="text-lg font-normal text-muted-foreground">/month</span></div>
        <div className="inline-block bg-primary/10 rounded-full px-4 py-2 text-primary font-medium mb-6">
          Start with a 21-day free trial
        </div>
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
    </>
  );
};

export default SubscriptionBenefits;
