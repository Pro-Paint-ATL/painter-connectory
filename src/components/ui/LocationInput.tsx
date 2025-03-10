
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";

interface LocationInputProps {
  onLocationChange: (location: { address: string; latitude: number; longitude: number }) => void;
  defaultAddress?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationChange, defaultAddress = "" }) => {
  const [address, setAddress] = useState(defaultAddress);
  const [suggestions, setSuggestions] = useState<{ address: string; lat: number; lng: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock function to simulate geocoding API with more customized suggestions
  const fetchAddressSuggestions = async (query: string) => {
    // In a real app, this would call a geocoding API like Google Maps, Mapbox, etc.
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Generate more natural and varied mock responses based on input
    const mockSuggestions = [
      {
        address: query, // Exact user input
        lat: 40.7128,
        lng: -74.006,
      },
      {
        address: `${query}, New York`, // Only city
        lat: 40.7128,
        lng: -74.006,
      },
      {
        address: `${query}, Chicago`, // Only city
        lat: 41.8781, 
        lng: -87.6298,
      },
      {
        address: `${query}, Seattle`, // Different city
        lat: 47.6062,
        lng: -122.3321,
      }
    ];
    
    setIsLoading(false);
    return mockSuggestions;
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (address.length > 3) {
        const results = await fetchAddressSuggestions(address);
        setSuggestions(results);
        setShowSuggestions(true);
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
          // In a real app, this would reverse geocode to get the address
          const mockAddress = "Your Current Location";
          setAddress(mockAddress);
          onLocationChange({
            address: mockAddress,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
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
