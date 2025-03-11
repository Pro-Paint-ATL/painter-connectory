
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: UserLocation;
  subscription?: Subscription;
  companyInfo?: PainterCompanyInfo;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  supabase: any; // Using any here to avoid circular imports
}
