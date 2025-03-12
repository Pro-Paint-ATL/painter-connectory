
import React from "react";
import { motion } from "framer-motion";
import { PaintBucket } from "lucide-react";
import PainterCard from "@/components/painters/PainterCard";
import { Painter } from "@/types/painter";

interface PainterResultsProps {
  painters: Painter[];
  loading: boolean;
  allPaintersCount: number;
}

const PainterResults: React.FC<PainterResultsProps> = ({ 
  painters, 
  loading, 
  allPaintersCount 
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading painters...</p>
      </div>
    );
  }

  if (painters.length === 0) {
    return (
      <div className="text-center py-12">
        <PaintBucket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No painters found</h3>
        <p className="text-muted-foreground">
          {allPaintersCount > 0 
            ? "Try adjusting your filters or expanding your search radius." 
            : "There are no registered painters in the system yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {painters.map((painter) => (
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
  );
};

export default PainterResults;
