
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Shield, PaintBucket } from "lucide-react";

interface PainterCardProps {
  painter: {
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
  };
}

const PainterCard: React.FC<PainterCardProps> = ({ painter }) => {
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < Math.floor(rating) 
                ? "fill-primary text-primary" 
                : index < rating 
                  ? "fill-primary/50 text-primary" 
                  : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
        <span className="ml-1 text-sm text-muted-foreground">
          ({painter.reviewCount} reviews)
        </span>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="relative aspect-video bg-muted">
            <img
              src={painter.avatar || "https://via.placeholder.com/300x150?text=Painter"}
              alt={painter.name}
              className="object-cover w-full h-full"
            />
            {painter.isInsured && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm"
              >
                <Shield className="h-3 w-3" /> Insured
              </Badge>
            )}
          </div>
          
          <div className="p-5">
            <h3 className="font-semibold text-lg truncate">{painter.name}</h3>
            
            <div className="mt-2">
              {renderRatingStars(painter.rating)}
            </div>
            
            <div className="flex items-center mt-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{painter.distance.toFixed(1)} miles • {painter.location}</span>
            </div>
            
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{painter.yearsInBusiness} years in business</span>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {painter.specialties.map((specialty, index) => (
                <Badge variant="outline" key={index} className="bg-accent/50">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-3 flex flex-col sm:flex-row">
        <Button variant="outline" asChild className="sm:flex-1">
          <Link to={`/calculator?painter=${painter.id}`}>
            <PaintBucket className="h-4 w-4 mr-2" />
            Calculate Estimate
          </Link>
        </Button>
        <Button asChild className="sm:flex-1">
          <Link to={`/painter/${painter.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PainterCard;
