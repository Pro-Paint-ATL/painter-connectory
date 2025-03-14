
import { supabase } from "@/lib/supabase";
import { Subscription } from "@/types/auth";
import { Json } from "@/integrations/supabase/types";

// Create a company profile for a newly registered user
export async function createCompanyProfile(userId: string, name: string) {
  try {
    // Create basic company info
    const companyInfo = {
      name: name,
      established: new Date().getFullYear(),
      employees: 1,
      location: {
        city: "",
        state: "",
        zip: ""
      },
      verified: false
    };

    // Update profile with company info using RPC function to bypass RLS
    const { error } = await supabase.rpc(
      'update_user_profile',
      { 
        user_id: userId, 
        company_info_data: companyInfo, 
        role_value: 'painter'  // Ensure role is set correctly
      }
    );

    if (error) {
      console.error("Error creating company profile:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception in creating company profile:", error);
    return false;
  }
}

// Create a trial subscription for a painter
export async function createTrialSubscription(userId: string) {
  try {
    // Calculate trial end date (21 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 21);

    // Create subscription object
    const subscriptionData: Subscription = {
      status: "trial",
      plan: "pro",
      startDate: new Date().toISOString(),
      endDate: trialEndDate.toISOString(),
      amount: 49,
      currency: "USD",
      interval: "month",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      paymentMethodId: null,
      lastFour: null,
      brand: null
    };

    // Update profile with subscription data using RPC function
    const { error } = await supabase.rpc(
      'update_user_subscription',
      { 
        user_id: userId, 
        subscription_data: subscriptionData 
      }
    );

    if (error) {
      console.error("Error creating trial subscription:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception in creating trial subscription:", error);
    return false;
  }
}
