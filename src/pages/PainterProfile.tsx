
import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StarIcon, Shield, Clock, MapPin, PaintBucket, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const PainterProfile = () => {
  const { id } = useParams<{ id: string }>();

  // In a real app, this would fetch data from an API
  const painter = {
    id: id,
    name: "Elite Painters",
    avatar: "https://source.unsplash.com/random/300x150?painting,1",
    rating: 4.8,
    reviewCount: 32,
    distance: 12,
    location: "New York",
    yearsInBusiness: 15,
    isInsured: true,
    about: "Elite Painters has been providing premium painting services for both residential and commercial properties for over 15 years. Our team consists of skilled professionals who are committed to delivering exceptional quality and customer satisfaction.",
    specialties: ["Interior", "Exterior", "Commercial", "Residential"],
    portfolio: [
      "https://source.unsplash.com/random/600x400?painting,1",
      "https://source.unsplash.com/random/600x400?painting,2",
      "https://source.unsplash.com/random/600x400?painting,3",
      "https://source.unsplash.com/random/600x400?painting,4",
    ]
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <Link to="/find-painters" className="text-primary hover:underline flex items-center gap-2 mb-4">
            <span>← Back to Painters</span>
          </Link>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3">
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={painter.avatar} 
                      alt={painter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h1 className="text-2xl font-bold mb-2">{painter.name}</h1>
                  
                  <div className="flex items-center gap-1 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(painter.rating) ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{painter.rating}</span>
                    <span className="text-sm text-muted-foreground">({painter.reviewCount} reviews)</span>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{painter.location} ({painter.distance} miles away)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{painter.yearsInBusiness} years in business</span>
                    </div>
                    {painter.isInsured && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Insured & Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {painter.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <Link to={`/booking/${painter.id}`}>
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book This Painter
                    </Button>
                  </Link>
                  
                  <Link to={`/calculator?painter=${painter.id}`}>
                    <Button variant="outline" className="w-full mt-2">
                      <PaintBucket className="h-4 w-4 mr-2" />
                      Get Paint Estimate
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full md:w-2/3 space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">About {painter.name}</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{painter.about}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">Work Portfolio</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {painter.portfolio.map((image, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Portfolio example ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">Customer Reviews</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Reviews will appear here after customers have used this painter's services.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PainterProfile;
