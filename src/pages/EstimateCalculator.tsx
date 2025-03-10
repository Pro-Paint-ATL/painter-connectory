
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import RoomCalculator, { RoomDetail } from "@/components/calculator/RoomCalculator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EstimateCalculator = () => {
  const [totalCost, setTotalCost] = useState(0);
  const [roomDetails, setRoomDetails] = useState<RoomDetail[]>([]);
  const [painterId, setPainterId] = useState<string | undefined>(undefined);
  const { search } = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Extract painter ID from URL if present
    const params = new URLSearchParams(search);
    const id = params.get("painter");
    if (id) {
      setPainterId(id);
    }
  }, [search]);

  const handleCalculate = (cost: number, details: RoomDetail[]) => {
    setTotalCost(cost);
    setRoomDetails(details);
  };

  const handleSaveEstimate = () => {
    // In a real app, this would save to a database or send to a painter
    toast({
      title: "Estimate Saved!",
      description: `Your estimate of $${totalCost.toLocaleString()} has been saved.`,
    });
  };

  const handleRequestQuote = () => {
    // In a real app, this would send a request to the painter
    toast({
      title: "Quote Requested!",
      description: `Your estimate has been sent to the painter for a formal quote.`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Paint Estimate Calculator</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get an accurate estimate for your painting project by providing room details below.
          </p>
        </div>

        <div className="mt-8">
          <RoomCalculator onCalculate={handleCalculate} painterId={painterId} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button onClick={handleSaveEstimate} variant="outline" className="flex-1">
            Save Estimate
          </Button>
          {painterId && (
            <Button onClick={handleRequestQuote} className="flex-1">
              Request Quote From Painter
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EstimateCalculator;
