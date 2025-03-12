
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserLocation } from "@/types/auth";
import { Painter, PainterProfile } from "@/types/painter";
import { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export interface PainterSearchFilters {
  maxDistance: number;
  minRating: number;
  onlyInsured: boolean;
  searchTerm: string;
}

export function usePainterSearch(userLocation: UserLocation | null) {
  const [painters, setPainters] = useState<Painter[]>([]);
  const [filteredPainters, setFilteredPainters] = useState<Painter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PainterSearchFilters>({
    maxDistance: 30,
    minRating: 0,
    onlyInsured: false,
    searchTerm: "",
  });
  const { toast } = useToast();

  // Calculate distance between two coordinates using the Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 15; // Default distance
    
    const R = 3958.8; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };
  
  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  // Fetch painters data from Supabase
  useEffect(() => {
    const fetchPainters = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'painter');
          
        if (error) {
          console.error('Error fetching painters:', error);
          toast({
            title: "Error",
            description: "Failed to load painters. Please try again later.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        if (!data || data.length === 0) {
          setPainters([]);
          setFilteredPainters([]);
          setLoading(false);
          return;
        }

        const transformedPainters: Painter[] = data.map((profile: any) => {
          const companyInfo = profile.company_info as Json;
          const subscription = profile.subscription as Json;
          const location = profile.location as Json;
          
          let locationData: UserLocation = {
            address: '',
            latitude: 0,
            longitude: 0
          };

          if (location && typeof location === 'object' && !Array.isArray(location)) {
            locationData = {
              address: (location as any).address || '',
              latitude: Number((location as any).latitude) || 0,
              longitude: Number((location as any).longitude) || 0
            };
          }
            
          const distance = userLocation ? 
            calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              locationData.latitude,
              locationData.longitude
            ) : 0;

          const parsedCompanyInfo = companyInfo && typeof companyInfo === 'object' ? companyInfo : {};
            
          return {
            id: profile.id,
            name: (parsedCompanyInfo as any)?.companyName || profile.name || 'Unnamed Painter',
            avatar: profile.avatar || '/placeholder.svg',
            rating: Number((parsedCompanyInfo as any)?.rating) || 0,
            reviewCount: Number((parsedCompanyInfo as any)?.reviewCount) || 0,
            distance: distance,
            location: locationData.address || 'Location not specified',
            yearsInBusiness: Number((parsedCompanyInfo as any)?.yearsInBusiness) || 0,
            isInsured: Boolean((parsedCompanyInfo as any)?.isInsured) || false,
            specialties: Array.isArray((parsedCompanyInfo as any)?.specialties) ? 
              (parsedCompanyInfo as any).specialties : [],
            isSubscribed: subscription && 
              typeof subscription === 'object' && 
              ['active', 'trial'].includes(String((subscription as any)?.status))
          };
        });
        
        setPainters(transformedPainters);
        setFilteredPainters(transformedPainters);
      } catch (err) {
        console.error('Error processing painter data:', err);
        toast({
          title: "Error",
          description: "Something went wrong while loading painters.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPainters();
  }, [toast, userLocation]);

  // Apply filters to the painter data
  useEffect(() => {
    if (painters.length === 0) return;
    
    let filtered = [...painters];
    
    if (filters.maxDistance > 0) {
      filtered = filtered.filter(painter => painter.distance <= filters.maxDistance);
    }
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(painter => painter.rating >= filters.minRating);
    }
    
    if (filters.onlyInsured) {
      filtered = filtered.filter(painter => painter.isInsured);
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        painter => 
          painter.name.toLowerCase().includes(term) || 
          painter.specialties.some(specialty => specialty.toLowerCase().includes(term))
      );
    }
    
    setFilteredPainters(filtered);
  }, [painters, filters]);

  const updateFilters = (newFilters: Partial<PainterSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    painters,
    filteredPainters,
    loading,
    filters,
    updateFilters
  };
}
