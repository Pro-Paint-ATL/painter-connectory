
import { stripe } from '@/utils/stripe-server';
import { supabase } from '@/lib/supabase';
import { BookingStatus, PaymentType, BookingPayment, BookingWithPayments, Booking, Subscription } from '@/types/auth';
import { Json } from '@/integrations/supabase/types';

// Helper function to safely parse subscription JSON
const parseSubscription = (subscriptionJson: Json | null): Subscription | null => {
  if (!subscriptionJson || typeof subscriptionJson !== 'object' || Array.isArray(subscriptionJson)) {
    return null;
  }
  
  // Cast to unknown first, then to Subscription
  return subscriptionJson as unknown as Subscription;
};

// Calculate deposit amount (15% of total)
export const calculateDepositAmount = (totalAmount: number): number => {
  return Math.round(totalAmount * 0.15 * 100) / 100;
};

// Create a payment intent for deposit
export const createDepositPaymentIntent = async (
  booking: BookingWithPayments,
  customerId: string
): Promise<{ clientSecret: string | null; error: any }> => {
  try {
    // Get customer's Stripe ID
    const { data: customerData } = await supabase
      .from('profiles')
      .select('subscription')
      .eq('id', customerId)
      .single();
    
    // Safely parse the subscription JSON
    const subscription = parseSubscription(customerData?.subscription);
    const stripeCustomerId = subscription?.stripeCustomerId;
    
    if (!stripeCustomerId) {
      return { clientSecret: null, error: 'Customer has no Stripe account' };
    }
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.deposit_amount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        bookingId: booking.id,
        customerId,
        painterId: booking.painter_id,
        paymentType: 'deposit'
      },
      description: `15% Good Faith Deposit for Booking #${booking.id}`,
    });
    
    // Store payment record in database
    await supabase.from('booking_payments').insert({
      booking_id: booking.id,
      customer_id: customerId,
      painter_id: booking.painter_id,
      amount: booking.deposit_amount,
      payment_type: 'deposit' as PaymentType,
      status: 'pending',
      payment_intent_id: paymentIntent.id,
    });
    
    return { clientSecret: paymentIntent.client_secret, error: null };
  } catch (error) {
    console.error('Error creating deposit payment intent:', error);
    return { clientSecret: null, error };
  }
};

// Create a payment intent for final payment
export const createFinalPaymentIntent = async (
  booking: BookingWithPayments,
  customerId: string
): Promise<{ clientSecret: string | null; error: any }> => {
  try {
    // Get customer's Stripe ID
    const { data: customerData } = await supabase
      .from('profiles')
      .select('subscription')
      .eq('id', customerId)
      .single();
    
    // Safely parse the subscription JSON
    const subscription = parseSubscription(customerData?.subscription);
    const stripeCustomerId = subscription?.stripeCustomerId;
    
    if (!stripeCustomerId) {
      return { clientSecret: null, error: 'Customer has no Stripe account' };
    }
    
    // Calculate final payment (total - deposit)
    const finalAmount = booking.total_amount - booking.deposit_amount;
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        bookingId: booking.id,
        customerId,
        painterId: booking.painter_id,
        paymentType: 'final_payment'
      },
      description: `Final Payment for Booking #${booking.id}`,
    });
    
    // Store payment record in database
    await supabase.from('booking_payments').insert({
      booking_id: booking.id,
      customer_id: customerId,
      painter_id: booking.painter_id,
      amount: finalAmount,
      payment_type: 'final_payment' as PaymentType,
      status: 'pending',
      payment_intent_id: paymentIntent.id,
    });
    
    return { clientSecret: paymentIntent.client_secret, error: null };
  } catch (error) {
    console.error('Error creating final payment intent:', error);
    return { clientSecret: null, error };
  }
};

// Process refund for a deposit
export const refundDeposit = async (
  bookingId: string
): Promise<{ success: boolean; error: any }> => {
  try {
    // Get payment record
    const { data: paymentData } = await supabase
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('payment_type', 'deposit')
      .eq('status', 'succeeded')
      .single();
    
    if (!paymentData || !paymentData.payment_intent_id) {
      return { success: false, error: 'No successful deposit payment found' };
    }
    
    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentData.payment_intent_id,
    });
    
    // Update payment status in database
    await supabase
      .from('booking_payments')
      .update({ status: 'refunded' })
      .eq('id', paymentData.id);
    
    // Update booking status
    await supabase
      .from('bookings')
      .update({ status: 'refunded' })
      .eq('id', bookingId);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error refunding deposit:', error);
    return { success: false, error };
  }
};

// Update booking status based on payment
export const updateBookingStatus = async (
  bookingId: string,
  paymentType: PaymentType,
  success: boolean
): Promise<void> => {
  let newStatus: BookingStatus;
  
  if (paymentType === 'deposit') {
    newStatus = success ? 'deposit_paid' : 'pending_deposit';
  } else {
    newStatus = success ? 'paid' : 'final_payment_pending';
  }
  
  await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId);
};

// Get booking with payments
export const getBookingWithPayments = async (
  bookingId: string
): Promise<BookingWithPayments | null> => {
  try {
    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError);
      return null;
    }
    
    // Get related payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId);
    
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    }
    
    // Convert payment data to proper BookingPayment type
    const payments: BookingPayment[] = paymentsData ? paymentsData.map(payment => ({
      id: payment.id,
      booking_id: payment.booking_id,
      customer_id: payment.customer_id,
      painter_id: payment.painter_id,
      amount: payment.amount,
      payment_type: payment.payment_type as PaymentType,
      status: payment.status as BookingPayment['status'],
      payment_intent_id: payment.payment_intent_id,
      payment_method_id: payment.payment_method_id,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    })) : [];
    
    // Get customer and painter names
    const { data: customer } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', booking.customer_id)
      .single();
    
    const { data: painter } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', booking.painter_id)
      .single();
    
    const bookingWithPayments: BookingWithPayments = {
      ...booking as Booking,
      customerName: customer?.name,
      painterName: painter?.name,
      payments: payments
    };
    
    return bookingWithPayments;
  } catch (error) {
    console.error('Error fetching booking with payments:', error);
    return null;
  }
};

