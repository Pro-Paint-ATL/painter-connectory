
import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  bookingId?: string;
}

const PaymentForm = ({ amount, onSuccess, onCancel, bookingId }: PaymentFormProps) => {
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

    if (!bookingId) {
      setPaymentError("Booking reference is missing. Please try again or contact support.");
      toast({
        title: "Payment Failed",
        description: "Booking reference is missing. Please try again or contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/profile", // In case of redirect
          payment_method_data: {
            metadata: {
              booking_id: bookingId,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        // Show error to customer
        setPaymentError(error.message || 'An unknown error occurred');
        toast({
          title: "Payment Failed",
          description: error.message || 'An unknown error occurred',
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        toast({
          title: "Payment Successful",
          description: `Your payment of $${amount.toFixed(2)} has been processed successfully.`,
        });
        
        // Update booking status in database
        if (bookingId) {
          try {
            await supabase
              .from('bookings')
              .update({ 
                status: 'deposit_paid',
                updated_at: new Date().toISOString()
              })
              .eq('id', bookingId);
            
            // Update payment status in database
            await supabase
              .from('booking_payments')
              .update({ 
                status: 'succeeded',
                updated_at: new Date().toISOString()
              })
              .eq('booking_id', bookingId)
              .eq('payment_type', 'deposit');
              
          } catch (dbError) {
            console.error('Error updating booking status:', dbError);
          }
        }
        
        // Call the success callback
        onSuccess();
      } else {
        // Handle other payment states
        let message = 'Payment processing';
        let needsAction = false;
        
        if (paymentIntent) {
          switch(paymentIntent.status) {
            case 'requires_payment_method':
              message = 'Payment failed. Please try another payment method.';
              break;
            case 'requires_action':
              message = 'Additional authentication required. Please complete the verification process.';
              needsAction = true;
              break;
            case 'processing':
              message = 'Payment is processing. Please wait...';
              break;
            default:
              message = `Payment status: ${paymentIntent.status}`;
          }
        }
        
        setPaymentError(needsAction ? null : message);
        toast({
          title: "Payment Status",
          description: message,
          variant: needsAction ? "default" : "destructive",
        });
      }
    } catch (unexpectedError) {
      console.error('Unexpected payment error:', unexpectedError);
      setPaymentError('An unexpected error occurred. Please try again.');
      toast({
        title: "Payment Error",
        description: 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
