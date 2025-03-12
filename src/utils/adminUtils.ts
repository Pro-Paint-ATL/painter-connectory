
import { supabase } from '@/lib/supabase';
import { User, PainterCompanyInfo } from '@/types/auth';
import { setupFeaturedPainterCompany } from './companySetup';

/**
 * Get all painter users
 */
export const getAllPainters = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'painter');
    
    if (error) {
      console.error('Error fetching painters:', error);
      return [];
    }
    
    return data as unknown as User[];
  } catch (error) {
    console.error('Exception fetching painters:', error);
    return [];
  }
};

/**
 * Set up a painter as a featured company (admin function)
 */
export const setAsFeaturedCompany = async (
  painterId: string, 
  companyInfo: PainterCompanyInfo
): Promise<boolean> => {
  return await setupFeaturedPainterCompany(painterId, companyInfo);
};

/**
 * Check if current user is an admin
 */
export const isAdminUser = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const ADMIN_EMAILS = ['admin@painterconnectory.com', 'propaintatl@gmail.com', 'your@email.com'];
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
