import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Calendar, Clock, Check } from "lucide-react";
import BookingCalendar from "@/components/booking/BookingCalendar";

const Booking = () => {
  const { painterId } = useParams<{ painterId: string }>();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [bookingDetails, setBookingDetails] = useState({
    projectType: "interior",
    notes: "",
    address: "",
    phone: "",
  });

  // In a real app, this would fetch painter data from an API
  const painter = {
    id: painterId,
    name: "Elite Painters",
    avatar: "https://source.unsplash.com/random/300x150?painting,1",
    rating: 4.8,
    reviewCount: 32,
  };

  const availableTimes = [
    "9:00 AM", "10:00 AM", "11:00 AM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time when date changes
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setBookingDetails(prev => ({ ...prev, projectType: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedDate) {
      toast({
        title: "Select a Date",
        description: "Please select a date for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 1 && !selectedTime) {
      toast({
        title: "Select a Time",
        description: "Please select a time slot for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // In a real app, this would send the booking request to the API
    toast({
      title: "Booking Confirmed!",
      description: `Your appointment with ${painter.name} has been scheduled.`,
    });
    
    // Redirect to profile or confirmation page (in a real app)
    // history.push('/profile');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <Link to={`/painter/${painterId}`} className="text-primary hover:underline flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to {painter.name}</span>
          </Link>
          
          <h1 className="text-3xl font-bold mt-4">Book an Appointment</h1>
          <p className="text-muted-foreground">Schedule a consultation with {painter.name}</p>
        </div>

        <div className="relative mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="w-full flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Calendar className="h-4 w-4" />
              </div>
              <div className="ml-2 mr-auto">
                <p className={`font-medium ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>Schedule</p>
              </div>
              <div className="w-full h-1 bg-muted">
                <div className={`h-1 bg-primary ${currentStep >= 2 ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
              </div>
            </div>
            
            <div className="w-full flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Clock className="h-4 w-4" />
              </div>
              <div className="ml-2 mr-auto">
                <p className={`font-medium ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>Details</p>
              </div>
              <div className="w-full h-1 bg-muted">
                <div className={`h-1 bg-primary ${currentStep >= 3 ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Check className="h-4 w-4" />
              </div>
              <div className="ml-2">
                <p className={`font-medium ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>Confirm</p>
              </div>
            </div>
          </div>

          {/* Step 1: Schedule */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-medium">Select Date & Time</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Choose a Date</h3>
                    <BookingCalendar 
                      onSelectDate={handleDateSelect}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Available Time Slots</h3>
                    {selectedDate ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimes.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Please select a date first</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-medium">Project Details</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label>Project Type</Label>
                    <Tabs 
                      defaultValue={bookingDetails.projectType} 
                      className="mt-2"
                      onValueChange={handleTypeChange}
                    >
                      <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="interior">Interior Painting</TabsTrigger>
                        <TabsTrigger value="exterior">Exterior Painting</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address</Label>
                    <Input 
                      id="address" 
                      name="address"
                      value={bookingDetails.address}
                      onChange={handleInputChange}
                      placeholder="Enter the address where service is needed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      value={bookingDetails.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Project Notes</Label>
                    <Textarea 
                      id="notes" 
                      name="notes"
                      value={bookingDetails.notes}
                      onChange={handleInputChange}
                      placeholder="Describe your project, including any specific requirements"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-medium">Confirm Booking</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-4">Booking Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Painter:</span>
                        <span className="font-medium">{painter.name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                          {selectedDate?.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Project Type:</span>
                        <span className="font-medium">
                          {bookingDetails.projectType === "interior" ? "Interior Painting" : "Exterior Painting"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium">{bookingDetails.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      By clicking "Confirm Booking", you agree to our Terms of Service and Privacy Policy.
                      The painter will receive your booking request and contact information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex justify-between">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handlePreviousStep}>
                Previous
              </Button>
            ) : (
              <Link to={`/painter/${painterId}`}>
                <Button variant="outline">
                  Cancel
                </Button>
              </Link>
            )}
            
            {currentStep < 3 ? (
              <Button onClick={handleNextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Confirm Booking
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Booking;
