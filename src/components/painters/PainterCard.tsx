
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, MapPin, CheckCircle2 } from "lucide-react";
import { Painter } from "@/types/painter";

interface PainterCardProps {
  painter: Painter;
}

const PainterCard: React.FC<PainterCardProps> = ({ painter }) => {
  const navigate = useNavigate();
  
  const handleViewProfile = () => {
    navigate(`/painter/${painter.id}`);
  };
  
  const handleBook = () => {
    navigate(`/booking/${painter.id}`);
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardContent className="p-4 flex-1">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={painter.avatar} alt={painter.name} />
            <AvatarFallback>{painter.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium truncate" title={painter.name}>
              {painter.name}
              {painter.isSubscribed && (
                <CheckCircle2 className="h-4 w-4 text-primary inline ml-1" />
              )}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span>
                {painter.rating.toFixed(1)} ({painter.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{painter.location}</span>
            <span className="ml-1">({painter.distance.toFixed(1)} miles)</span>
          </div>
          
          {painter.isInsured && (
            <div className="flex items-center text-sm text-primary font-medium">
              <Shield className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>Insured Business</span>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            {painter.yearsInBusiness} years in business
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {painter.specialties.slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="secondary" className="text-xs font-normal">
              {specialty}
            </Badge>
          ))}
          {painter.specialties.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{painter.specialties.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleViewProfile}
        >
          View Profile
        </Button>
        <Button
          className="flex-1"
          onClick={handleBook}
        >
          Book
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PainterCard;
