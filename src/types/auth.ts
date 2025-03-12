
import { Json } from "@/integrations/supabase/types";

export type UserRole = "customer" | "painter" | "admin" | null;

export interface UserLocation {
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  bio?: string;
}

export interface PainterCompanyInfo {
  companyName: string;
  yearsInBusiness?: number | undefined;
  isInsured: boolean;
  insuranceAmount?: string;
  insuranceDocumentUrl?: string;
  logoUrl?: string;
  businessDescription?: string;
  specialties?: string[];
  portfolio?: string[];
}

export interface Subscription {
  status: "active" | "canceled" | "past_due" | null;
  plan: "pro" | null;
  startDate: string | null;
  amount: number | null;
  currency: string | null;
  interval: "month" | "year" | null;
  paymentMethodId?: string;
  lastFour?: string;
  brand?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card";
  lastFour: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: UserLocation;
  subscription?: Subscription;
  companyInfo?: PainterCompanyInfo;
  paymentMethods?: PaymentMethod[];
  stripeCustomerId?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<User | null>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  supabase: any; // Using any here to avoid circular imports
}

// Booking and payment related types
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
  booking_id: string;
  customer_id: string;
  painter_id: string;
  amount: number;
  payment_type: PaymentType;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  payment_intent_id?: string;
  payment_method_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  painter_id: string;
  date: string;
  time: string;
  address: string;
  phone?: string;
  project_type: string;
  notes?: string;
  status: BookingStatus;
  total_amount: number;
  deposit_amount: number;
  created_at: string;
  updated_at?: string;
}

export interface BookingWithPayments extends Booking {
  payments?: BookingPayment[];
  customerName?: string;
  painterName?: string;
}
