
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocationInput from "@/components/ui/LocationInput";
import PainterCard from "@/components/painters/PainterCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { UserLocation } from "@/types/auth";
import {
  PaintBucket,
  Filter,
  Search,
  SlidersHorizontal,
  Shield
} from "lucide-react";

interface Painter {
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

const FindPainters = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [maxDistance, setMaxDistance] = useState(30);
  const [minRating, setMinRating] = useState(0);
  const [onlyInsured, setOnlyInsured] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [painters, setPainters] = useState<Painter[]>([]);
  const [filteredPainters, setFilteredPainters] = useState<Painter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPainters = async () => {
      setLoading(true);
      
      try {
        // Fetch painter profiles from Supabase
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
        
        // Transform the data into the Painter interface format
        const transformedPainters: Painter[] = data.map(profile => {
          // Parse company_info from JSON
          const companyInfo = profile.company_info ? 
            (typeof profile.company_info === 'string' ? 
              JSON.parse(profile.company_info) : profile.company_info) : 
            { companyName: '', isInsured: false, specialties: [] };
          
          // Parse subscription from JSON
          const subscription = profile.subscription ? 
            (typeof profile.subscription === 'string' ? 
              JSON.parse(profile.subscription) : profile.subscription) : 
            { status: null };

          // Parse location properly
          let locationObj: UserLocation = { address: 'Location not specified', latitude: 0, longitude: 0 };
          
          if (profile.location) {
            // Handle potential string JSON or already parsed object
            const parsedLocation = typeof profile.location === 'string' 
              ? JSON.parse(profile.location) 
              : profile.location;
            
            // Check if parsed location has the required properties
            if (parsedLocation && typeof parsedLocation === 'object') {
              locationObj = {
                address: parsedLocation.address || 'Location not specified',
                latitude: parsedLocation.latitude || 0,
                longitude: parsedLocation.longitude || 0
              };
            }
          }
            
          // Calculate distance using location data
          const distance = userLocation ? 
            calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              locationObj.latitude, 
              locationObj.longitude
            ) : 
            Math.floor(Math.random() * 30) + 1;
            
          return {
            id: profile.id,
            name: companyInfo.companyName || profile.name || 'Unnamed Painter',
            avatar: profile.avatar || '/placeholder.svg',
            rating: companyInfo.rating || 4 + Math.random(),
            reviewCount: companyInfo.reviewCount || Math.floor(Math.random() * 50) + 1,
            distance: distance,
            location: locationObj.address,
            yearsInBusiness: companyInfo.yearsInBusiness || Math.floor(Math.random() * 10) + 1,
            isInsured: companyInfo.isInsured || false,
            specialties: companyInfo.specialties || [],
            isSubscribed: subscription?.status === 'active' || subscription?.status === 'trial'
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

  // Simple distance calculation using the Haversine formula
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

  useEffect(() => {
    if (painters.length === 0) return;
    
    let filtered = [...painters];
    
    filtered = filtered.filter(painter => painter.distance <= maxDistance);
    
    filtered = filtered.filter(painter => painter.rating >= minRating);
    
    if (onlyInsured) {
      filtered = filtered.filter(painter => painter.isInsured);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        painter => 
          painter.name.toLowerCase().includes(term) || 
          painter.specialties.some(specialty => specialty.toLowerCase().includes(term))
      );
    }
    
    setFilteredPainters(filtered);
  }, [painters, maxDistance, minRating, onlyInsured, searchTerm]);

  const handleLocationChange = (location: { address: string; latitude: number; longitude: number }) => {
    setUserLocation(location);
    toast({
      title: "Location Updated",
      description: `Showing painters within ${maxDistance} miles of ${location.address}`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Painters Near You</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse painters in your area and connect with professionals for your project.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Your Location</Label>
                <LocationInput onLocationChange={handleLocationChange} />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search painters or specialties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              {showFilters && (
                <div className="grid md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="distance">Distance</Label>
                      <span className="text-sm text-muted-foreground">{maxDistance} miles</span>
                    </div>
                    <Slider
                      id="distance"
                      min={5}
                      max={50}
                      step={5}
                      value={[maxDistance]}
                      onValueChange={(value) => setMaxDistance(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="rating">Minimum Rating</Label>
                      <span className="text-sm text-muted-foreground">{minRating > 0 ? minRating : "Any"}</span>
                    </div>
                    <Slider
                      id="rating"
                      min={0}
                      max={5}
                      step={0.5}
                      value={[minRating]}
                      onValueChange={(value) => setMinRating(value[0])}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insured"
                      checked={onlyInsured}
                      onCheckedChange={(checked) => setOnlyInsured(checked === true)}
                    />
                    <Label htmlFor="insured" className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4" />
                      Only Insured Painters
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Painters</TabsTrigger>
            <TabsTrigger value="top">Top Rated</TabsTrigger>
            <TabsTrigger value="new">Newly Added</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading painters...</p>
          </div>
        ) : (
          filteredPainters.length === 0 ? (
            <div className="text-center py-12">
              <PaintBucket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No painters found</h3>
              <p className="text-muted-foreground">
                {painters.length > 0 
                  ? "Try adjusting your filters or expanding your search radius." 
                  : "There are no registered painters in the system yet."}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPainters.map((painter) => (
                <motion.div
                  key={painter.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <PainterCard painter={painter} />
                </motion.div>
              ))}
            </div>
          )
        )}
      </motion.div>
    </div>
  );
};

export default FindPainters;
