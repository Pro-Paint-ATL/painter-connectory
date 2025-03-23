
import React, { useState } from "react";
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
import { Check, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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

const StripeKeySetupForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  
  // Initialize form with react-hook-form
  const form = useForm<StripeFormValues>({
    resolver: zodResolver(stripeFormSchema),
    defaultValues: {
      secretKey: "",
      webhookSecret: "",
      priceId: "",
    },
  });

  const onSubmit = async (data: StripeFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get the auth token for the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in");
      }
      
      // Set the Stripe Secret Key
      const secretKeyResponse = await supabase.functions.invoke('set-secrets', {
        body: { key: 'STRIPE_SECRET_KEY', value: data.secretKey },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (secretKeyResponse.error) throw new Error("Failed to set secret key: " + secretKeyResponse.error.message);
      
      // Set the Stripe Webhook Secret
      const webhookResponse = await supabase.functions.invoke('set-secrets', {
        body: { key: 'STRIPE_WEBHOOK_SECRET', value: data.webhookSecret },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (webhookResponse.error) throw new Error("Failed to set webhook secret: " + webhookResponse.error.message);
      
      // Set the Stripe Price ID
      const priceIdResponse = await supabase.functions.invoke('set-secrets', {
        body: { key: 'STRIPE_PRICE_ID', value: data.priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (priceIdResponse.error) throw new Error("Failed to set price ID: " + priceIdResponse.error.message);
      
      // Show success message
      toast({
        title: "Stripe keys configured successfully",
        description: "Your Stripe integration is now ready to use.",
      });
      
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
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-md mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                      Important Security Notice
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      The keys you enter will be stored securely as Supabase Edge Function secrets.
                      They will not be exposed to the frontend and can only be accessed by your
                      server-side functions.
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
                      />
                    </FormControl>
                    <FormDescription>
                      Your Stripe secret key starting with 'sk_test_' (test) or 'sk_live_' (production)
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
                      />
                    </FormControl>
                    <FormDescription>
                      Your Stripe webhook signing secret starting with 'whsec_'
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
                      />
                    </FormControl>
                    <FormDescription>
                      The Stripe Price ID for your subscription product
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
