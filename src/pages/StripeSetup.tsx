
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import StripeKeySetupForm from "@/components/admin/StripeKeySetupForm";

const StripeSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/painter-dashboard");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                This page is only accessible to administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Stripe Configuration</h1>
      
      <div className="mb-8">
        <p className="text-muted-foreground mb-4">
          Configure your Stripe integration by entering your API keys below. These keys will be stored securely and used for 
          subscription management, payment processing, and webhook handling.
        </p>
        
        <div className="bg-muted p-4 rounded-md mb-6">
          <h3 className="font-medium mb-2">Where to find your Stripe keys:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Secret Key: Stripe Dashboard → Developers → API keys</li>
            <li>Webhook Secret: Stripe Dashboard → Developers → Webhooks → Select your endpoint → Signing secret</li>
            <li>Price ID: Stripe Dashboard → Products → Select your subscription product → Pricing → Price ID</li>
          </ul>
        </div>
      </div>
      
      <StripeKeySetupForm />
    </div>
  );
};

export default StripeSetup;
