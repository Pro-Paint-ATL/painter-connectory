
import { loadStripe } from '@stripe/stripe-js';

// In production, these values should come from environment variables
const PRODUCTION_MODE = true;

// Replace with your actual publishable key
const STRIPE_PUBLISHABLE_KEY = PRODUCTION_MODE
  ? 'pk_test_51OA0V5Dq86aeJPbWXMvBSMhBfYiXbciqJAGXFu9XKEcUXQnMhJ97qXKTKhbhLgdpBDVaFMXqiYUkSVSCEZzRMTg500Ip6Sxgus'
  : 'pk_test_51OA0V5Dq86aeJPbWXMvBSMhBfYiXbciqJAGXFu9XKEcUXQnMhJ97qXKTKhbhLgdpBDVaFMXqiYUkSVSCEZzRMTg500Ip6Sxgus';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Helper function to format card details for display
export const formatCardNumber = (cardNumber: string) => {
  // Remove any non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  // Format in groups of 4
  const groups = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  
  return groups.join(' ');
};

// Format expiry date as MM/YY
export const formatExpiryDate = (expiryDate: string) => {
  const digits = expiryDate.replace(/\D/g, '');
  
  // If we have more than 2 digits, insert a slash after the second digit
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  
  return digits;
};

// Format CVC to only allow 3 or 4 digits
export const formatCVC = (cvc: string) => {
  const digits = cvc.replace(/\D/g, '');
  return digits.slice(0, 4);
};

// In production, you might want to add additional helper functions for:
// 1. Validating card details client-side before submission
// 2. Handling payment errors gracefully
// 3. Managing saved payment methods
// 4. Supporting additional payment methods beyond cards
