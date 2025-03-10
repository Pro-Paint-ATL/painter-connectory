
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import RoomCalculator, { RoomDetail } from "@/components/calculator/RoomCalculator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const EstimateCalculator = () => {
  const [totalCost, setTotalCost] = useState(0);
  const [roomDetails, setRoomDetails] = useState<RoomDetail[]>([]);
  const [painterId, setPainterId] = useState<string | undefined>(undefined);
  const [showSubscriptionInfo, setShowSubscriptionInfo] = useState(false);
  const { search } = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Extract painter ID from URL if present
    const params = new URLSearchParams(search);
    const id = params.get("painter");
    if (id) {
      setPainterId(id);
    }
  }, [search]);

  const handleCalculate = (cost: number, details: RoomDetail[]) => {
    setTotalCost(cost);
    setRoomDetails(details);
  };

  const handleSaveEstimate = () => {
    // In a real app, this would save to a database or send to a painter
    toast({
      title: "Estimate Saved!",
      description: `Your estimate of $${totalCost.toLocaleString()} has been saved.`,
    });
  };

  const handleRequestQuote = () => {
    // In a real app, this would send a request to the painter
    toast({
      title: "Quote Requested!",
      description: `Your estimate has been sent to the painter for a formal quote.`,
    });
    
    // If the user is a painter, show the lead cost info
    if (user?.role === "painter") {
      toast({
        title: "Lead Generated",
        description: "This will count as a lead. First lead is free, additional leads cost $5 each.",
      });
    }
  };

  const toggleSubscriptionInfo = () => {
    setShowSubscriptionInfo(!showSubscriptionInfo);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Paint Estimate Calculator</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get an accurate estimate for your painting project by providing room details below.
          </p>
          {user?.role === "painter" && (
            <Button 
              variant="link" 
              onClick={toggleSubscriptionInfo}
              className="mt-2"
            >
              {showSubscriptionInfo ? "Hide" : "Show"} Painter Subscription Info
            </Button>
          )}
        </div>

        {user?.role === "painter" && showSubscriptionInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Painter Subscription Details
              </CardTitle>
              <CardDescription>
                Information about subscription and lead generation costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Monthly Subscription</h3>
                <p>$49 per month subscription fee gives you access to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Unlimited customer estimates</li>
                  <li>10 coupon codes per month (5 x 10% off, 5 x 20% off)</li>
                  <li>Your first customer lead is free</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Lead Costs</h3>
                <p>When customers request a quote from you:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>First customer lead: FREE</li>
                  <li>Additional customer leads: $5 each</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Special Perks</h3>
                <p>Save on your subscription:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li className="text-primary font-medium">$5 OFF next month's subscription when you price match our calculator estimate and get hired!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <RoomCalculator onCalculate={handleCalculate} painterId={painterId} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button onClick={handleSaveEstimate} variant="outline" className="flex-1">
            Save Estimate
          </Button>
          {painterId && (
            <Button onClick={handleRequestQuote} className="flex-1">
              Request Quote From Painter
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EstimateCalculator;
