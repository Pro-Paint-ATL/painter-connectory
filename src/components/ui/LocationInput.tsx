
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationInputProps {
  onLocationChange: (location: { address: string; latitude: number; longitude: number }) => void;
  defaultAddress?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationChange, defaultAddress = "" }) => {
  const [address, setAddress] = useState(defaultAddress);
  const [suggestions, setSuggestions] = useState<{ address: string; lat: number; lng: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  // This would be replaced with a real geocoding API in production
  const fetchAddressSuggestions = async (query: string) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you would call an API like Google Maps Geocoding or Mapbox
      // For now, we'll use more realistic mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const mockSuggestions = [
        {
          address: `${query}, Atlanta, GA`,
          lat: 33.7488,
          lng: -84.3877,
        },
        {
          address: `${query}, Decatur, GA`,
          lat: 33.7748,
          lng: -84.2963,
        },
        {
          address: `${query}, Marietta, GA`,
          lat: 33.9526,
          lng: -84.5499,
        },
        {
          address: `${query}, Alpharetta, GA`,
          lat: 34.0754,
          lng: -84.2941,
        }
      ];
      
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      toast({
        title: "Error",
        description: "Could not fetch address suggestions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (address.length > 3) {
        await fetchAddressSuggestions(address);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounce);
  }, [address]);

  const handleSuggestionClick = (suggestion: { address: string; lat: number; lng: number }) => {
    setAddress(suggestion.address);
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationChange({
      address: suggestion.address,
      latitude: suggestion.lat,
      longitude: suggestion.lng,
    });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you would use reverse geocoding here
            // For now, we'll set a mock address based on coordinates
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Mock reverse geocoding
            const mockAddress = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            
            setAddress(mockAddress);
            onLocationChange({
              address: mockAddress,
              latitude: lat,
              longitude: lng,
            });
            
            toast({
              title: "Location Found",
              description: "Using your current location",
            });
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            toast({
              title: "Error",
              description: "Could not determine your address",
              variant: "destructive"
            });
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
          toast({
            title: "Error",
            description: "Could not access your location. Please check your browser permissions.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="pr-10"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          className="flex-shrink-0"
        >
          <MapPin className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Current Location</span>
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-3 py-2 hover:bg-secondary cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0 text-muted-foreground" />
                  <span>{suggestion.address}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
