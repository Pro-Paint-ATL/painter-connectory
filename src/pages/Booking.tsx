import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Calendar, Clock, Check, CreditCard, AlertTriangle } from "lucide-react";
import BookingCalendar from "@/components/booking/BookingCalendar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { createDepositPaymentIntent, calculateDepositAmount } from "@/utils/payment-system";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "@/components/booking/PaymentForm";
import { BookingWithPayments } from "@/types/auth";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51OA0V5Dq86aeJPbWXMvBSMhBfYiXbciqJAGXFu9XKEcUXQnMhJ97qXKTKhbhLgdpBDVaFMXqiYUkSVSCEZzRMTg500Ip6Sxgus");

const Booking = () => {
  const { painterId } = useParams<{ painterId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [depositAgreementChecked, setDepositAgreementChecked] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [totalEstimate, setTotalEstimate] = useState(300); // Default estimate
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    projectType: "interior",
    notes: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    const deposit = calculateDepositAmount(totalEstimate);
    setDepositAmount(deposit);
  }, [totalEstimate]);

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

  const handleCalendarTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setBookingDetails(prev => ({ ...prev, projectType: value }));
    
    const newEstimate = value === "exterior" ? 400 : 300;
    setTotalEstimate(newEstimate);
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
    
    if (currentStep === 2 && !bookingDetails.address) {
      toast({
        title: "Address Required",
        description: "Please provide the address where the service will be performed.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 3 && !agreementChecked) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 3 && !depositAgreementChecked) {
      toast({
        title: "Deposit Agreement Required",
        description: "Please acknowledge the good faith deposit agreement before proceeding.",
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

  const createBooking = async () => {
    if (!user || !painterId || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Required booking information is missing.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const bookingData = {
        customer_id: user.id,
        painter_id: painterId,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        address: bookingDetails.address,
        phone: bookingDetails.phone,
        project_type: bookingDetails.projectType,
        notes: bookingDetails.notes,
        status: 'pending_deposit',
        total_amount: totalEstimate,
        deposit_amount: depositAmount,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsCreatingPayment(true);
      
      const newBookingId = await createBooking();
      
      if (!newBookingId) {
        setIsCreatingPayment(false);
        return;
      }
      
      setBookingId(newBookingId);

      const booking: BookingWithPayments = {
        id: newBookingId,
        customer_id: user!.id,
        painter_id: painterId!,
        total_amount: totalEstimate,
        deposit_amount: depositAmount,
        status: 'pending_deposit',
        date: selectedDate!.toISOString().split('T')[0],
        time: selectedTime!,
        address: bookingDetails.address,
        project_type: bookingDetails.projectType,
        phone: bookingDetails.phone,
        notes: bookingDetails.notes,
        created_at: new Date().toISOString()
      };

      const { clientSecret: secret, error } = await createDepositPaymentIntent(
        booking, 
        user!.id
      );

      if (error || !secret) {
        throw new Error("Failed to create payment intent");
      }

      setClientSecret(secret);
      setPaymentDialogOpen(true);
      setIsCreatingPayment(false);
    } catch (error) {
      console.error("Error in booking submission:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false);
    toast({
      title: "Booking Confirmed!",
      description: `Your deposit has been processed and your appointment with ${painter.name} has been scheduled.`,
    });
    
    navigate('/profile');
  };

  const handlePaymentCancel = () => {
    setPaymentDialogOpen(false);
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
                      painterId={painterId || "default"} 
                      onTimeSelected={handleCalendarTimeSelect}
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
                      
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated Total:</span>
                          <span className="font-medium">${totalEstimate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-primary">
                          <span>Required Good Faith Deposit (15%):</span>
                          <span>${depositAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start mb-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <h4 className="text-amber-800 font-medium">Good Faith Deposit Information</h4>
                    </div>
                    <p className="text-sm text-amber-700 mb-4">
                      A 15% good faith deposit is required to confirm your booking. This deposit:
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1 list-disc pl-5 mb-4">
                      <li>Will be applied to your final bill upon successful completion of work</li>
                      <li>Is fully refundable if the painter doesn't show up or doesn't complete the work</li>
                      <li>Helps ensure both parties are committed to the scheduled appointment</li>
                    </ul>
                    <div className="flex items-start space-x-2 mt-2">
                      <Checkbox 
                        id="deposit-agreement" 
                        checked={depositAgreementChecked}
                        onCheckedChange={(checked) => setDepositAgreementChecked(checked === true)}
                      />
                      <Label htmlFor="deposit-agreement" className="text-sm font-normal leading-tight">
                        I understand and agree to the good faith deposit terms. I acknowledge that this deposit 
                        is refundable if the painter doesn't show up or complete the work as agreed.
                      </Label>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms-agreement" 
                        checked={agreementChecked}
                        onCheckedChange={(checked) => setAgreementChecked(checked === true)}
                      />
                      <Label htmlFor="terms-agreement" className="text-sm font-normal">
                        By clicking "Confirm Booking", I agree to the Terms of Service and Privacy Policy.
                        I authorize the painter to contact me regarding this booking.
                      </Label>
                    </div>
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
              <Button 
                onClick={handleSubmit} 
                disabled={!agreementChecked || !depositAgreementChecked || isCreatingPayment}
                className="gap-2"
              >
                {isCreatingPayment ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay Deposit & Book
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Required</DialogTitle>
            <DialogDescription>
              Please complete the payment for your good faith deposit of ${depositAmount.toFixed(2)}.
            </DialogDescription>
          </DialogHeader>
          
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                amount={depositAmount} 
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Booking;
