
import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2 } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({ amount, onSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/profile", // In case of redirect
      },
      redirect: 'if_required',
    });

    if (error) {
      // Show error to customer
      setPaymentError(error.message || 'An unknown error occurred');
      setIsProcessing(false);
      
      toast({
        title: "Payment Failed",
        description: error.message || 'An unknown error occurred',
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded
      toast({
        title: "Payment Successful",
        description: `Your deposit of $${amount.toFixed(2)} has been processed successfully.`,
      });
      
      // Call the success callback
      onSuccess();
    } else {
      // Payment requires additional action or failed silently
      setIsProcessing(false);
      toast({
        title: "Payment Status",
        description: `Payment status: ${paymentIntent?.status || 'unknown'}`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <AddressElement options={{ mode: 'billing' }} />
      
      {paymentError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {paymentError}
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
