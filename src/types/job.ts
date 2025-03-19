
import { User } from "./auth";

export type JobStatus = 'open' | 'assigned' | 'completed' | 'cancelled';
export type BidStatus = 'pending' | 'accepted' | 'rejected';

export interface Job {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  address: string;
  zip_code: string;
  city: string;
  state: string;
  project_type: string;
  images: string[];
  status: JobStatus;
  budget_range?: string;
  square_footage?: number;
  desired_start_date?: string;
  created_at: string;
  updated_at: string;
  customer?: User;
  bid_count?: number;
}

export interface Bid {
  id: string;
  job_id: string;
  painter_id: string;
  amount: number;
  status: BidStatus;
  created_at: string;
  updated_at: string;
  painter?: User | any; // Allow any to handle Supabase join errors
  job?: Job;
}

export interface JobWithBids extends Job {
  bids: Bid[];
}
