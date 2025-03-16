
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { User } from "@/types/auth";
import { NavigateFunction } from "react-router-dom";

interface SubscriptionPanelProps {
  user: User;
  navigate: NavigateFunction;
}

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ user, navigate }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>Manage your Pro Painter subscription</CardDescription>
      </CardHeader>
      <CardContent>
        {user.subscription ? (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-lg">Pro Painter Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(user.subscription.amount || 49)}/{user.subscription.interval || "month"}
                  </p>
                </div>
                <Badge variant={user.subscription.status === "active" ? "default" : "destructive"}>
                  {user.subscription.status === "active" ? "Active" : user.subscription.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status</span>
                  <span className="text-sm font-medium">
                    {user.subscription.status === "active" ? "Active" : user.subscription.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Started On</span>
                  <span className="text-sm font-medium">
                    {user.subscription.startDate ? formatDate(user.subscription.startDate) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Next Billing Date</span>
                  <span className="text-sm font-medium">
                    {user.subscription.endDate ? formatDate(user.subscription.endDate) : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Plan Benefits</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Priority listing in search results</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Verified painter badge on profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Accept unlimited booking requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Customer insights and analytics</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline" onClick={() => navigate("/subscription")}>
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to our Pro Painter plan to get more customers and grow your business.
            </p>
            <Button onClick={() => navigate("/subscription")}>
              View Subscription Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionPanel;
