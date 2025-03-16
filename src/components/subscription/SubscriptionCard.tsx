
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock } from "lucide-react";

interface SubscriptionCardProps {
  onSubscribe: () => void;
  isProcessing: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ onSubscribe, isProcessing }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pro Painter Subscription</CardTitle>
        <CardDescription>Get started with a 21-day free trial</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
            onClick={onSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Start Your 21-Day Free Trial"}
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
  );
};

export default SubscriptionCard;
