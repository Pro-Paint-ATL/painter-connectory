
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserLocation } from "@/types/auth";
import { usePainterSearch } from "@/hooks/usePainterSearch";
import PainterSearchFilters from "@/components/painters/PainterSearchFilters";
import PainterResults from "@/components/painters/PainterResults";

const FindPainters = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const { 
    filteredPainters, 
    painters, 
    loading, 
    filters, 
    updateFilters 
  } = usePainterSearch(userLocation);

  const handleLocationChange = (location: UserLocation) => {
    setUserLocation(location);
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

        <PainterSearchFilters 
          filters={filters}
          onFilterChange={updateFilters}
          onLocationChange={handleLocationChange}
        />

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Painters</TabsTrigger>
            <TabsTrigger value="top">Top Rated</TabsTrigger>
            <TabsTrigger value="new">Newly Added</TabsTrigger>
          </TabsList>
        </Tabs>

        <PainterResults 
          painters={filteredPainters} 
          loading={loading} 
          allPaintersCount={painters.length} 
        />
      </motion.div>
    </div>
  );
};

export default FindPainters;
