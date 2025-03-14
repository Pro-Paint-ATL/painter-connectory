
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { Subscription } from "@/types/auth";

interface ActiveSubscriptionProps {
  subscription: Subscription;
}

const ActiveSubscription: React.FC<ActiveSubscriptionProps> = ({ subscription }) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>You're Already Subscribed!</CardTitle>
        <CardDescription>
          You already have an active Pro Painter subscription.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-accent/50 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Pro Painter Plan</div>
            <Badge variant="secondary">
              {subscription.status === "trial" ? "Trial" : "Active"}
            </Badge>
          </div>
          {subscription.status === "trial" && subscription.endDate && (
            <div className="text-sm text-muted-foreground">
              Trial ends: {new Date(subscription.endDate).toLocaleDateString()}
            </div>
          )}
          {subscription.status === "active" && (
            <div className="text-sm text-muted-foreground">
              Next billing date: {subscription.endDate ? 
                new Date(subscription.endDate).toLocaleDateString() : 
                new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
            </div>
          )}
          {subscription.lastFour && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span>
                {subscription.brand} ending in {subscription.lastFour}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate("/profile")}>Go to Profile</Button>
      </CardFooter>
    </Card>
  );
};

export default ActiveSubscription;
