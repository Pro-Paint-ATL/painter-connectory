
import { stripe } from './stripe-server';
import { supabase } from '@/lib/supabase';

// Define status types for bookings and payments
export type BookingStatus = 
  | 'pending_deposit' 
  | 'deposit_paid' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'final_payment_pending' 
  | 'paid' 
  | 'cancelled' 
  | 'refunded';

export type PaymentType = 'deposit' | 'final_payment';

export interface BookingPayment {
  id: string;
  bookingId: string;
  customerId: string;
  painterId: string;
  amount: number;
  paymentType: PaymentType;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  paymentIntentId?: string;
  paymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithPayments {
  id: string;
  customerId: string;
  painterId: string;
  date: string;
  time: string;
  address: string;
  projectType: string;
  notes?: string;
  status: BookingStatus;
  totalAmount: number;
  depositAmount: number;
  painterName?: string;
  customerName?: string;
  payments?: BookingPayment[];
}

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
    
    const stripeCustomerId = customerData?.subscription?.stripeCustomerId;
    
    if (!stripeCustomerId) {
      return { clientSecret: null, error: 'Customer has no Stripe account' };
    }
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.depositAmount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        bookingId: booking.id,
        customerId,
        painterId: booking.painterId,
        paymentType: 'deposit'
      },
      description: `15% Good Faith Deposit for Booking #${booking.id}`,
    });
    
    // Store payment record in database
    await supabase.from('booking_payments').insert({
      booking_id: booking.id,
      customer_id: customerId,
      painter_id: booking.painterId,
      amount: booking.depositAmount,
      payment_type: 'deposit',
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
    
    const stripeCustomerId = customerData?.subscription?.stripeCustomerId;
    
    if (!stripeCustomerId) {
      return { clientSecret: null, error: 'Customer has no Stripe account' };
    }
    
    // Calculate final payment (total - deposit)
    const finalAmount = booking.totalAmount - booking.depositAmount;
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        bookingId: booking.id,
        customerId,
        painterId: booking.painterId,
        paymentType: 'final_payment'
      },
      description: `Final Payment for Booking #${booking.id}`,
    });
    
    // Store payment record in database
    await supabase.from('booking_payments').insert({
      booking_id: booking.id,
      customer_id: customerId,
      painter_id: booking.painterId,
      amount: finalAmount,
      payment_type: 'final_payment',
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
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (!booking) return null;
    
    // Get related payments
    const { data: payments } = await supabase
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId);
    
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
    
    return {
      ...booking,
      customerId: booking.customer_id,
      painterId: booking.painter_id,
      status: booking.status as BookingStatus,
      totalAmount: booking.total_amount,
      depositAmount: booking.deposit_amount,
      customerName: customer?.name,
      painterName: painter?.name,
      payments: payments ? payments.map(p => ({
        id: p.id,
        bookingId: p.booking_id,
        customerId: p.customer_id,
        painterId: p.painter_id,
        amount: p.amount,
        paymentType: p.payment_type as PaymentType,
        status: p.status,
        paymentIntentId: p.payment_intent_id,
        paymentMethodId: p.payment_method_id,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      })) : []
    };
  } catch (error) {
    console.error('Error fetching booking with payments:', error);
    return null;
  }
};
