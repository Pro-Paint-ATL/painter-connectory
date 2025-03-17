
import { Json } from "@/integrations/supabase/types";
import { UserLocation } from './auth';

export interface PainterProfile {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  avatar: string | null;
  location: Json | null;
  company_info: Json | null;
  subscription: Json | null;
}

export interface PainterSubscription {
  status: string | null;
  plan: string | null;
  startDate: string | null;
  endDate: string | null;
  amount: number | null;
  currency: string | null;
  interval: string | null;
}

export interface PainterCompanyInfo {
  companyName: string;
  yearsInBusiness: number;
  isInsured: boolean;
  insuranceAmount?: string;
  insuranceDocumentUrl?: string;
  logoUrl?: string;
  businessDescription?: string;
  specialties: string[];
  portfolio?: string[];
  rating: number;
  reviewCount: number;
}

export interface Painter {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  distance: number;
  location: string;
  yearsInBusiness: number;
  isInsured: boolean;
  specialties: string[];
  isSubscribed?: boolean;
}
