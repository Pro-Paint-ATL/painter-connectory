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
import {
  PaintBucket,
  Filter,
  StarIcon,
  Shield,
  Clock,
  Search,
  SlidersHorizontal
} from "lucide-react";

const PAINTER_IMAGES = [
  "/placeholder.svg",
  "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=300&h=150&fit=crop",
  "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=300&h=150&fit=crop",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=150&fit=crop",
  "https://images.unsplash.com/photo-1558618666-d136994899e7?w=300&h=150&fit=crop"
];

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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPainters: Painter[] = Array.from({ length: 12 }, (_, i) => ({
        id: `painter${i + 1}`,
        name: `${["Elite", "Pro", "Premier", "Quality", "Express", "Master", "Perfect"][i % 7]} Painters ${i + 1}`,
        avatar: PAINTER_IMAGES[i % PAINTER_IMAGES.length],
        rating: Math.floor(Math.random() * 2) + 3 + Math.random(),
        reviewCount: Math.floor(Math.random() * 50) + 5,
        distance: Math.floor(Math.random() * 30) + 1,
        location: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][i % 5],
        yearsInBusiness: Math.floor(Math.random() * 20) + 1,
        isInsured: Math.random() > 0.2,
        specialties: Array.from(
          { length: Math.floor(Math.random() * 3) + 1 },
          () => ["Interior", "Exterior", "Commercial", "Residential", "Cabinet", "Deck", "Fence"][Math.floor(Math.random() * 7)]
        ).filter((value, index, self) => self.indexOf(value) === index)
      }));
      
      setPainters(mockPainters);
      setFilteredPainters(mockPainters);
      setLoading(false);
    };
    
    fetchPainters();
  }, []);

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

        {filteredPainters.length === 0 ? (
          <div className="text-center py-12">
            <PaintBucket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No painters found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or expanding your search radius.
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
        )}
      </motion.div>
    </div>
  );
};

export default FindPainters;
