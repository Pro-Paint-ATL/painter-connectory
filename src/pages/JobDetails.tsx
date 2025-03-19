
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Image as ImageIcon,
  Loader2, 
  MapPin, 
  Paintbrush,
  Send,
  Ruler, 
  X 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { JobWithBids, Bid } from "@/types/job";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import DepositAgreementForm from "@/components/booking/DepositAgreementForm";

const formSchema = z.object({
  bid_amount: z.number()
    .min(1, "Bid amount must be greater than 0")
    .max(1000000, "Bid amount is too large")
});

type FormValues = z.infer<typeof formSchema>;

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<JobWithBids | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showAgreementForm, setShowAgreementForm] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUpdatingBidStatus, setIsUpdatingBidStatus] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bid_amount: undefined,
    },
  });

  useEffect(() => {
    if (!id) return;
    if (!user) {
      navigate("/");
      return;
    }

    checkSubscription();
    fetchJobDetails();
  }, [id, user]);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      // Check if user has subscription info and it's active
      const isActive = user.subscription?.status === "active";
      setIsSubscribed(isActive);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsSubscribed(false);
    }
  };

  const fetchJobDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (jobError) throw jobError;

      // Fetch bids for this job if the user is the customer
      let bids: Bid[] = [];
      if (user?.id === jobData.customer_id) {
        const { data: bidsData, error: bidsError } = await supabase
          .from("bids")
          .select("*, painter:painter_id(id, name, avatar)")
          .eq("job_id", id)
          .order("created_at", { ascending: false });

        if (bidsError) throw bidsError;
        bids = bidsData as Bid[];
      } 
      // If user is a painter, only fetch their own bid if it exists
      else if (user?.role === "painter") {
        const { data: ownBidData, error: ownBidError } = await supabase
          .from("bids")
          .select("*")
          .eq("job_id", id)
          .eq("painter_id", user.id);

        if (ownBidError) throw ownBidError;
        bids = ownBidData as Bid[];
      }

      setJob({ ...jobData, bids });
    } catch (error: any) {
      console.error("Error fetching job details:", error);
      toast({
        title: "Error",
        description: "Failed to load job details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitBid = async (values: FormValues) => {
    if (!user || !job) return;

    // Check if user is a painter
    if (user.role !== "painter") {
      toast({
        title: "Not allowed",
        description: "Only painters can submit bids.",
        variant: "destructive",
      });
      return;
    }

    // Check if painter has a subscription
    if (!isSubscribed) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to bid on jobs.",
        variant: "destructive",
      });
      navigate("/subscription");
      return;
    }

    // Check if painter has already submitted a bid
    const existingBid = job.bids?.find(bid => bid.painter_id === user.id);
    if (existingBid) {
      toast({
        title: "Bid already submitted",
        description: "You have already submitted a bid for this job.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingBid(true);
    try {
      const { data, error } = await supabase
        .from("bids")
        .insert({
          job_id: job.id,
          painter_id: user.id,
          amount: values.bid_amount,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Bid submitted",
        description: "Your bid has been successfully submitted.",
      });

      // Update the job with the new bid
      if (data) {
        setJob(prev => {
          if (!prev) return null;
          const updatedBids = [...(prev.bids || []), data];
          return { ...prev, bids: updatedBids };
        });
      }

      // Reset the form
      form.reset();
    } catch (error: any) {
      console.error("Error submitting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!user || !job) return;
    
    // Check if user is the customer
    if (user.id !== job.customer_id) {
      toast({
        title: "Not allowed",
        description: "Only the customer can accept bids.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdatingBidStatus(true);
    try {
      // Update the selected bid to accepted
      const { error: updateBidError } = await supabase
        .from("bids")
        .update({ status: "accepted" })
        .eq("id", bidId);
        
      if (updateBidError) throw updateBidError;
      
      // Update all other bids to rejected
      const { error: rejectBidsError } = await supabase
        .from("bids")
        .update({ status: "rejected" })
        .eq("job_id", job.id)
        .neq("id", bidId);
        
      if (rejectBidsError) throw rejectBidsError;
      
      // Update job status to assigned
      const { error: updateJobError } = await supabase
        .from("jobs")
        .update({ status: "assigned" })
        .eq("id", job.id);
        
      if (updateJobError) throw updateJobError;
      
      toast({
        title: "Bid accepted",
        description: "You have accepted the bid. The painter will be notified.",
      });
      
      // Show the agreement form
      setSelectedBidId(bidId);
      setShowAcceptDialog(false);
      setShowAgreementForm(true);
      
      // Refresh job data
      fetchJobDetails();
    } catch (error: any) {
      console.error("Error accepting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBidStatus(false);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    if (!user || !job) return;
    
    // Check if user is the customer
    if (user.id !== job.customer_id) {
      toast({
        title: "Not allowed",
        description: "Only the customer can reject bids.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdatingBidStatus(true);
    try {
      // Update the bid to rejected
      const { error } = await supabase
        .from("bids")
        .update({ status: "rejected" })
        .eq("id", bidId);
        
      if (error) throw error;
      
      toast({
        title: "Bid rejected",
        description: "You have rejected the bid.",
      });
      
      // Refresh job data
      fetchJobDetails();
    } catch (error: any) {
      console.error("Error rejecting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBidStatus(false);
    }
  };

  const handleAgreementComplete = () => {
    setShowAgreementForm(false);
    toast({
      title: "Agreement signed",
      description: "The agreement has been signed. You will be redirected to your dashboard.",
    });
    
    // Redirect to appropriate page
    if (user?.role === "painter") {
      navigate("/painter-dashboard");
    } else {
      navigate("/profile");
    }
  };

  const renderImageGallery = () => {
    if (!job || !job.images || job.images.length === 0) {
      return (
        <div className="h-40 flex items-center justify-center bg-muted rounded-md">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">No images provided</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-5 gap-2">
          {job.images.slice(0, 5).map((image, index) => (
            <div 
              key={index}
              className={`relative ${index === 0 ? 'col-span-5 mb-2' : 'col-span-1'} cursor-pointer`}
              onClick={() => {
                setCurrentImageIndex(index);
                setShowImageDialog(true);
              }}
            >
              <img 
                src={image} 
                alt={`Project image ${index + 1}`} 
                className={`w-full rounded-md object-cover
                  ${index === 0 ? 'h-48 md:h-64' : 'h-16 md:h-20'}`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderJobStatus = () => {
    if (!job) return null;

    let statusText = "Open for Bids";
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";

    switch (job.status) {
      case "assigned":
        statusText = "Painter Assigned";
        variant = "secondary";
        break;
      case "completed":
        statusText = "Completed";
        variant = "outline";
        break;
      case "cancelled":
        statusText = "Cancelled";
        variant = "destructive";
        break;
    }

    return <Badge variant={variant}>{statusText}</Badge>;
  };

  const renderBidSection = () => {
    if (!user || !job) return null;

    // If user is the customer, show the bids they've received
    if (user.id === job.customer_id) {
      return renderCustomerBidsSection();
    }

    // If user is a painter, show the bid form or their existing bid
    if (user.role === "painter") {
      return renderPainterBidSection();
    }

    return null;
  };

  const renderPainterBidSection = () => {
    if (!job) return null;

    // Check if job is still open
    if (job.status !== "open") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Job Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This job is no longer open for bids.
            </p>
          </CardContent>
        </Card>
      );
    }

    // Check if painter has already submitted a bid
    const existingBid = job.bids?.find(bid => bid.painter_id === user?.id);
    if (existingBid) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Your Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Amount:</p>
                <p className="text-xl font-bold">${existingBid.amount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Status:</p>
                <Badge 
                  variant={
                    existingBid.status === "accepted" ? "default" : 
                    existingBid.status === "rejected" ? "destructive" : 
                    "secondary"
                  }
                >
                  {existingBid.status.charAt(0).toUpperCase() + existingBid.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Submitted:</p>
                <p>{format(new Date(existingBid.created_at), "MMM d, yyyy")}</p>
              </div>
              
              {existingBid.status === "pending" && (
                <p className="text-sm text-muted-foreground mt-4">
                  Your bid has been submitted and is awaiting the customer's response.
                </p>
              )}
              
              {existingBid.status === "accepted" && (
                <p className="text-sm text-muted-foreground mt-4">
                  Congratulations! Your bid has been accepted. Please wait for the customer to sign the agreement.
                </p>
              )}
              
              {existingBid.status === "rejected" && (
                <p className="text-sm text-muted-foreground mt-4">
                  Your bid was not selected for this job. Please check other opportunities in the marketplace.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // If no existing bid, show the bid form
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Bid</CardTitle>
          <CardDescription>
            Enter your price for completing this painting project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubscribed ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You need an active subscription to submit bids on jobs.
              </p>
              <Button onClick={() => navigate("/subscription")}>
                Get a Subscription
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitBid)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="bid_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Bid Amount ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Enter your bid amount"
                            className="pl-10"
                            type="number"
                            min="1"
                            step="0.01"
                            onChange={(e) => {
                              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value === undefined ? '' : field.value}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter the total amount you would charge for this project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmittingBid}
                >
                  {isSubmittingBid ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Bid...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Bid
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCustomerBidsSection = () => {
    if (!job) return null;
    
    if (!job.bids || job.bids.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You haven't received any bids for this job yet.
            </p>
          </CardContent>
        </Card>
      );
    }

    // Count bids by status
    const pendingBids = job.bids.filter(bid => bid.status === "pending").length;
    const acceptedBid = job.bids.find(bid => bid.status === "accepted");
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bids on Your Job</CardTitle>
          <CardDescription>
            {pendingBids} pending bid{pendingBids !== 1 ? 's' : ''}
            {acceptedBid && " • 1 accepted bid"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {job.status === "assigned" && acceptedBid && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800 mb-2">
                You've accepted a bid
              </h3>
              <p className="text-sm text-green-700 mb-3">
                You've accepted a bid from{" "}
                <span className="font-semibold">{(acceptedBid.painter as any)?.name || "a painter"}</span>{" "}
                for ${acceptedBid.amount.toFixed(2)}.
              </p>
            </div>
          )}
          
          <Tabs defaultValue={acceptedBid ? "accepted" : "pending"}>
            <TabsList>
              <TabsTrigger value="pending" disabled={pendingBids === 0}>
                Pending ({pendingBids})
              </TabsTrigger>
              <TabsTrigger value="accepted" disabled={!acceptedBid}>
                Accepted (1)
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({job.bids.filter(bid => bid.status === "rejected").length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4 mt-4">
              {job.bids
                .filter(bid => bid.status === "pending")
                .map((bid) => (
                  <div 
                    key={bid.id} 
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                  >
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-1">
                        <p className="font-semibold">
                          {(bid.painter as any)?.name || "Painter"}
                        </p>
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        ${bid.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Submitted {format(new Date(bid.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline" 
                        onClick={() => {
                          setSelectedBidId(bid.id);
                          setShowAcceptDialog(true);
                        }}
                        disabled={isUpdatingBidStatus}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleRejectBid(bid.id)}
                        disabled={isUpdatingBidStatus}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              
              {pendingBids === 0 && (
                <p className="text-muted-foreground py-4 text-center">
                  No pending bids
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="accepted" className="space-y-4 mt-4">
              {acceptedBid ? (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <p className="font-semibold">
                      {(acceptedBid.painter as any)?.name || "Painter"}
                    </p>
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    ${acceptedBid.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">
                    Accepted on {format(new Date(acceptedBid.updated_at), "MMM d, yyyy")}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center">
                  No accepted bids
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4 mt-4">
              {job.bids
                .filter(bid => bid.status === "rejected")
                .map((bid) => (
                  <div key={bid.id} className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <p className="font-semibold">
                        {(bid.painter as any)?.name || "Painter"}
                      </p>
                    </div>
                    <div className="text-xl font-semibold mb-2">
                      ${bid.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rejected on {format(new Date(bid.updated_at), "MMM d, yyyy")}
                    </div>
                  </div>
                ))}
              
              {job.bids.filter(bid => bid.status === "rejected").length === 0 && (
                <p className="text-muted-foreground py-4 text-center">
                  No rejected bids
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading job details...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Job not found or you don't have permission to view it.
            </p>
            <Button 
              className="mt-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permissions - painters with no subscription can only view jobs with no bids
  if (
    user?.role === "painter" && 
    !isSubscribed && 
    job.bids && 
    job.bids.length > 0 && 
    !job.bids.some(bid => bid.painter_id === user.id)
  ) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              You need an active subscription to view jobs that already have bids.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => navigate("/subscription")}>
                Get a Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              {renderJobStatus()}
            </div>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {job.city}, {job.state}
              </span>
              <span className="text-muted-foreground mx-1">•</span>
              <Clock className="h-4 w-4" />
              <span>
                Posted {format(new Date(job.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderImageGallery()}
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Project Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <Paintbrush className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm font-medium">Project Type</span>
                    </div>
                    <p>{job.project_type}</p>
                  </div>
                  
                  {job.budget_range && (
                    <div>
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Budget Range</span>
                      </div>
                      <p>{job.budget_range}</p>
                    </div>
                  )}
                  
                  {job.square_footage && (
                    <div>
                      <div className="flex items-center mb-2">
                        <Ruler className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Square Footage</span>
                      </div>
                      <p>{job.square_footage} sq ft</p>
                    </div>
                  )}
                  
                  {job.desired_start_date && (
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm font-medium">Desired Start Date</span>
                      </div>
                      <p>{format(new Date(job.desired_start_date), "MMMM d, yyyy")}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="whitespace-pre-line">{job.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-8">
          {renderBidSection()}
        </div>
      </div>
      
      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <button 
            className="absolute right-4 top-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={() => setShowImageDialog(false)}
          >
            <X className="h-6 w-6" />
          </button>
          
          <Carousel>
            <CarouselContent>
              {job.images?.map((img, i) => (
                <CarouselItem key={i}>
                  <div className="flex h-full items-center justify-center p-6">
                    <img 
                      src={img} 
                      alt={`Project image ${i + 1}`} 
                      className="max-h-[80vh] object-contain" 
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </DialogContent>
      </Dialog>
      
      {/* Accept Bid Confirmation Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Bid</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this bid? All other bids will be rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Once you accept a bid, you'll need to sign an agreement with the painter before work can begin.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              disabled={isUpdatingBidStatus}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => selectedBidId && handleAcceptBid(selectedBidId)}
              disabled={isUpdatingBidStatus}
            >
              {isUpdatingBidStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Yes, Accept Bid"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Agreement Dialog */}
      <Dialog open={showAgreementForm} onOpenChange={setShowAgreementForm}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sign Agreement</DialogTitle>
            <DialogDescription>
              Review and sign the agreement to finalize your project with the painter.
            </DialogDescription>
          </DialogHeader>
          
          {job && selectedBidId && (
            <div className="py-2">
              <DepositAgreementForm
                amount={job.bids.find(b => b.id === selectedBidId)?.amount || 0}
                onSuccess={handleAgreementComplete}
                onCancel={() => setShowAgreementForm(false)}
                bookingId={job.id}
                projectType={job.project_type}
                customerName={user?.name || "Customer"}
                painterName={(job.bids.find(b => b.id === selectedBidId)?.painter as any)?.name || "Painter"}
                bookingDate={job.desired_start_date ? format(new Date(job.desired_start_date), "MMMM d, yyyy") : format(new Date(), "MMMM d, yyyy")}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetails;
