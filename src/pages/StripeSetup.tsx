
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import StripeKeySetupForm from "@/components/admin/StripeKeySetupForm";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const StripeSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeploymentAlert, setShowDeploymentAlert] = React.useState(true);

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
      
      {showDeploymentAlert && (
        <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Function Deployment Notice</AlertTitle>
          <AlertDescription className="flex justify-between items-start">
            <span>
              Edge functions may take a moment to deploy. If you encounter errors when saving, 
              please try again in a few moments or use the retry button that will appear.
            </span>
            <button 
              onClick={() => setShowDeploymentAlert(false)}
              className="text-sm underline text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}
      
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
