
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SlidersHorizontal, Shield } from "lucide-react";
import LocationInput from "@/components/ui/LocationInput";
import { UserLocation } from "@/types/auth";
import type { PainterSearchFilters as PainterSearchFiltersType } from "@/hooks/usePainterSearch";
import { useToast } from "@/hooks/use-toast";

interface PainterSearchFiltersProps {
  filters: PainterSearchFiltersType;
  onFilterChange: (filters: Partial<PainterSearchFiltersType>) => void;
  onLocationChange: (location: UserLocation) => void;
}

const PainterSearchFilters: React.FC<PainterSearchFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  onLocationChange 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const handleLocationChange = (location: UserLocation) => {
    onLocationChange(location);
    toast({
      title: "Location Updated",
      description: `Showing painters within ${filters.maxDistance} miles of ${location.address}`,
    });
  };

  return (
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
                value={filters.searchTerm}
                onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          
          {showFilters && (
            <div className="grid md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="distance">Distance</Label>
                  <span className="text-sm text-muted-foreground">{filters.maxDistance} miles</span>
                </div>
                <Slider
                  id="distance"
                  min={5}
                  max={50}
                  step={5}
                  value={[filters.maxDistance]}
                  onValueChange={(value) => onFilterChange({ maxDistance: value[0] })}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="rating">Minimum Rating</Label>
                  <span className="text-sm text-muted-foreground">{filters.minRating > 0 ? filters.minRating : "Any"}</span>
                </div>
                <Slider
                  id="rating"
                  min={0}
                  max={5}
                  step={0.5}
                  value={[filters.minRating]}
                  onValueChange={(value) => onFilterChange({ minRating: value[0] })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insured"
                  checked={filters.onlyInsured}
                  onCheckedChange={(checked) => onFilterChange({ onlyInsured: checked === true })}
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
  );
};

export default PainterSearchFilters;
