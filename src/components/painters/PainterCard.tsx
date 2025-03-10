
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Shield, PaintBucket, Check } from "lucide-react";

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
    isSubscribed?: boolean;
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

  // Use a reliable fallback image in case the painter avatar URL is broken
  const fallbackImage = "/placeholder.svg";
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = fallbackImage;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="relative aspect-video bg-muted">
            <img
              src={painter.avatar || fallbackImage}
              alt={painter.name}
              className="object-cover w-full h-full"
              onError={handleImageError}
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              {painter.isInsured && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-background/80 backdrop-blur-sm"
                >
                  <Shield className="h-3 w-3" /> Insured
                </Badge>
              )}
              {painter.isSubscribed && (
                <Badge 
                  variant="default" 
                  className="flex items-center gap-1 bg-primary/90 backdrop-blur-sm"
                >
                  <Check className="h-3 w-3" /> Pro Painter
                </Badge>
              )}
            </div>
          </div>
          
          <div className="p-5">
            <h3 className="font-semibold text-lg truncate">
              {painter.name}
              {painter.isSubscribed && (
                <span className="inline-block ml-2">
                  <Check className="h-4 w-4 text-primary inline" />
                </span>
              )}
            </h3>
            
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
