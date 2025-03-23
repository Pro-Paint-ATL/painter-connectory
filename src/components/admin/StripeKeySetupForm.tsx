
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check, AlertCircle, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form validation schema
const stripeFormSchema = z.object({
  secretKey: z.string()
    .min(10, { message: "Secret key appears to be too short" })
    .refine(val => val.startsWith('sk_'), { 
      message: "Secret key should start with 'sk_'" 
    }),
  webhookSecret: z.string()
    .min(10, { message: "Webhook secret appears to be too short" }),
  priceId: z.string()
    .min(5, { message: "Price ID appears to be too short" })
    .refine(val => val.startsWith('price_'), { 
      message: "Price ID should start with 'price_'" 
    }),
});

type StripeFormValues = z.infer<typeof stripeFormSchema>;

// Local storage key for saving form data
const FORM_STORAGE_KEY = "stripe_setup_form_data";

const StripeKeySetupForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [savedData, setSavedData] = useState<Partial<StripeFormValues> | null>(null);
  const [functionError, setFunctionError] = useState<string | null>(null);
  const [deploymentRetries, setDeploymentRetries] = useState(0);
  
  // Initialize form with react-hook-form
  const form = useForm<StripeFormValues>({
    resolver: zodResolver(stripeFormSchema),
    defaultValues: {
      secretKey: "",
      webhookSecret: "",
      priceId: "",
    },
  });

  // Check if Stripe is already configured
  useEffect(() => {
    async function checkStripeConfig() {
      try {
        // Get the auth token for the current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        // Check if Stripe is configured
        const response = await supabase.functions.invoke('check-stripe-config', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }).catch(error => {
          console.error("Error invoking check-stripe-config function:", error);
          return { error };
        });
        
        if (response.error) {
          console.error("Error from check-stripe-config:", response.error);
          return;
        }
        
        // Fixed TypeScript error by properly checking response shape
        if (response && 'data' in response && response.data && response.data.configured) {
          setSetupComplete(true);
        }
      } catch (error) {
        console.error("Error checking Stripe configuration:", error);
      } finally {
        setCheckingConfig(false);
      }
    }
    
    checkStripeConfig();
  }, []);

  // Load saved form data from localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setSavedData(parsedData);
        Object.keys(parsedData).forEach(key => {
          form.setValue(key as keyof StripeFormValues, parsedData[key]);
        });
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, [form]);

  // Save form data to localStorage when it changes
  const saveFormData = (data: Partial<StripeFormValues>) => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
    setSavedData(data);
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof StripeFormValues, value: string) => {
    const currentValues = form.getValues();
    saveFormData({ ...currentValues, [field]: value });
  };

  // Direct writing to Supabase secrets via RPC function
  const setSecretViaRPC = async (session: any, key: string, value: string) => {
    try {
      const { data, error } = await supabase.rpc('set_secret', {
        name: key,
        value: value
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error(`Error setting secret via RPC (${key}):`, error);
      throw error;
    }
  };

  // Try to set a secret using either edge function or RPC as fallback
  const setSecret = async (session: any, key: string, value: string) => {
    try {
      // First try to use edge function
      const response = await supabase.functions.invoke('set-secrets', {
        body: { key, value },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (response.error) {
        console.error(`Edge function error for ${key}:`, response.error);
        throw response.error;
      }
      
      return response;
    } catch (edgeFunctionError) {
      console.warn(`Edge function failed for ${key}, trying RPC fallback:`, edgeFunctionError);
      
      // As a fallback, try to use RPC
      if (deploymentRetries < 1) {
        try {
          const rpcResult = await setSecretViaRPC(session, key, value);
          return rpcResult;
        } catch (rpcError) {
          console.error(`RPC fallback failed for ${key}:`, rpcError);
          throw rpcError;
        }
      } else {
        throw edgeFunctionError;
      }
    }
  };

  const retryWithDelay = async () => {
    setDeploymentRetries(prev => prev + 1);
    setFunctionError("Retrying to save configuration...");
    
    // Wait 3 seconds before retrying
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Retry submission
    const data = form.getValues();
    onSubmit(data);
  };

  const onSubmit = async (data: StripeFormValues) => {
    setIsSubmitting(true);
    setFunctionError(null);
    
    try {
      // Get the auth token for the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in");
      }
      
      // Try to set all three secrets
      try {
        // Set the Stripe Secret Key
        await setSecret(session, 'STRIPE_SECRET_KEY', data.secretKey);
        
        // Set the Stripe Webhook Secret
        await setSecret(session, 'STRIPE_WEBHOOK_SECRET', data.webhookSecret);
        
        // Set the Stripe Price ID
        await setSecret(session, 'STRIPE_PRICE_ID', data.priceId);
      } catch (error) {
        console.error("Error setting secrets:", error);
        
        if (deploymentRetries < 2) {
          setFunctionError(
            "There was an error saving your configuration. This might be because the Edge Functions are still deploying. " +
            "Please click 'Retry' to try again."
          );
          setIsSubmitting(false);
          return;
        } else {
          throw new Error("Failed to save configuration after multiple attempts. Please try again later.");
        }
      }
      
      // Show success message
      toast({
        title: "Stripe keys configured successfully",
        description: "Your Stripe integration is now ready to use.",
      });
      
      // Clear the saved form data on successful submission
      localStorage.removeItem(FORM_STORAGE_KEY);
      setSavedData(null);
      
      setSetupComplete(true);
    } catch (error) {
      console.error("Error saving Stripe keys:", error);
      toast({
        title: "Error configuring Stripe",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (checkingConfig) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <p className="text-muted-foreground">Checking configuration status...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Stripe Integration Setup</CardTitle>
        <CardDescription>
          Configure your Stripe API keys to enable subscription functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        {setupComplete ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
            <p className="text-muted-foreground">
              Your Stripe integration has been successfully configured.
              You can now use the subscription functionality.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {savedData && Object.keys(savedData).length > 0 && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle>Saved form data detected</AlertTitle>
                  <AlertDescription>
                    Your previously entered data has been restored.
                  </AlertDescription>
                </Alert>
              )}
              
              {functionError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Edge Function Error</AlertTitle>
                  <AlertDescription className="flex flex-col space-y-2">
                    <p>{functionError}</p>
                    {deploymentRetries > 0 && (
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        className="self-start mt-2 flex items-center gap-2"
                        onClick={retryWithDelay}
                        disabled={isSubmitting}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-md mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                      Important Information
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      You can leave this page to copy keys from Stripe Dashboard - your entries will be saved. 
                      Return to this page to continue the setup.
                    </p>
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="secretKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stripe Secret Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="sk_live_..."
                        type="password"
                        autoComplete="off"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange("secretKey", e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center">
                      <span>Your Stripe secret key starting with 'sk_test_' (test) or 'sk_live_' (production)</span>
                      <a 
                        href="https://dashboard.stripe.com/apikeys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center ml-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="webhookSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook Secret</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="whsec_..."
                        type="password"
                        autoComplete="off"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange("webhookSecret", e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center">
                      <span>Your Stripe webhook signing secret starting with 'whsec_'</span>
                      <a 
                        href="https://dashboard.stripe.com/webhooks" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center ml-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Price ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="price_..."
                        autoComplete="off"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange("priceId", e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription className="flex items-center">
                      <span>The Stripe Price ID for your subscription product (starts with 'price_')</span>
                      <a 
                        href="https://dashboard.stripe.com/products" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center ml-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Stripe Configuration"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default StripeKeySetupForm;
