
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
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 opacity-90"
        style={{ backgroundImage: 'url("/lovable-uploads/e42930dd-5c66-4ee9-aa1a-9dcafc979718.png")' }}
      />
      
      {/* Content with semi-transparent overlay for better readability */}
      <div className="relative z-10">
        <div className="container mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Painters Near You</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Browse painters in your area and connect with professionals for your project.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg mb-6">
              <PainterSearchFilters 
                filters={filters}
                onFilterChange={updateFilters}
                onLocationChange={handleLocationChange}
              />
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg">
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FindPainters;
