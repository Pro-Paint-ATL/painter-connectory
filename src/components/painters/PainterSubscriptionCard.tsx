
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Shield, Check, Clock } from "lucide-react";

interface PainterSubscriptionCardProps {
  painterId?: string;
}

const PainterSubscriptionCard: React.FC<PainterSubscriptionCardProps> = ({ painterId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isCurrentPainter = user?.role === "painter" && (!painterId || painterId === user.id);
  const isSubscribed = user?.subscription?.status === "active" || user?.subscription?.status === "trial";

  if (!isCurrentPainter) {
    return null;
  }

  if (isSubscribed) {
    return (
      <Card className="bg-accent/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Check className="h-5 w-5 mr-2 text-primary" />
            Pro Painter Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">
            You're subscribed to the Pro Painter plan. Your profile is prioritized in search results.
          </p>
          <div className="bg-background rounded-md p-3 text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Plan:</span>
              <span>Pro Painter ($49/month)</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">Status:</span>
              <span className="text-emerald-600 font-medium">
                {user.subscription?.status === "trial" ? "Trial" : "Active"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {user.subscription?.status === "trial" ? "Trial ends:" : "Next billing:"}
              </span>
              <span>
                {user.subscription?.endDate ? 
                  new Date(user.subscription.endDate).toLocaleDateString() : 
                  new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => navigate("/profile")}>
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-accent/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Upgrade Your Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">
          Subscribe to the Pro Painter plan to unlock premium features and get more clients.
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Priority listing in search results</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Verified badge on your profile</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>Accept unlimited booking requests</span>
          </div>
        </div>
        <div className="bg-background rounded-md p-3 flex justify-between items-center">
          <div>
            <span className="font-medium">Pro Painter</span>
            <div className="text-sm text-muted-foreground">$49/month</div>
          </div>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => navigate("/subscription")}>
          Start Your 21-Day Free Trial
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PainterSubscriptionCard;
