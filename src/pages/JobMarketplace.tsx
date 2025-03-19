
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Job } from "@/types/job";
import { format } from "date-fns";
import { 
  Calendar, 
  Loader2, 
  MapPin, 
  Paintbrush, 
  Search,
  DollarSign,
  Ruler 
} from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const JobMarketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 9;

  useEffect(() => {
    if (!user) return;

    checkSubscription();
    fetchJobs();
  }, [user]);

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

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, bids(count)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedJobs = data.map(job => ({
        ...job,
        bid_count: job.bids?.[0]?.count || 0
      })) as Job[];

      setJobs(processedJobs);
      setFilteredJobs(processedJobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, projectTypeFilter, activeTab, jobs]);

  const applyFilters = () => {
    let filtered = [...jobs];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        job =>
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.city.toLowerCase().includes(query) ||
          job.state.toLowerCase().includes(query) ||
          job.project_type.toLowerCase().includes(query)
      );
    }

    // Apply project type filter
    if (projectTypeFilter) {
      filtered = filtered.filter(job => job.project_type === projectTypeFilter);
    }

    // Apply tab filter
    if (activeTab === "no-bids") {
      filtered = filtered.filter(job => job.bid_count === 0);
    }

    setFilteredJobs(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const ProjectTypes = [
    "Interior Painting",
    "Exterior Painting",
    "Cabinet Painting",
    "Deck/Fence Staining",
    "Wallpaper Installation",
    "Wallpaper Removal",
    "Popcorn Ceiling Removal",
    "Drywall Repair",
    "Color Consultation",
    "Commercial Painting",
    "Other"
  ];

  const navigateToJobDetails = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  // Get current page of jobs
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    if (filteredJobs.length <= jobsPerPage) return null;

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
            </PaginationItem>
          )}
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <PaginationItem key={number}>
              <PaginationLink 
                isActive={currentPage === number}
                onClick={() => paginate(number)}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => paginate(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  const renderJobCards = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading jobs...</span>
        </div>
      );
    }

    if (filteredJobs.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No jobs match your filters</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setProjectTypeFilter("");
              setActiveTab("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentJobs.map((job) => (
          <Card key={job.id} className="overflow-hidden h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl line-clamp-2">{job.title}</CardTitle>
                <Badge variant={job.bid_count === 0 ? "secondary" : "outline"}>
                  {job.bid_count} {job.bid_count === 1 ? "bid" : "bids"}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {job.city}, {job.state}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pb-2 flex-grow">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Paintbrush className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">{job.project_type}</span>
                </div>
                
                {job.budget_range && (
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{job.budget_range}</span>
                  </div>
                )}
                
                {job.square_footage && (
                  <div className="flex items-center mb-2">
                    <Ruler className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{job.square_footage} sq ft</span>
                  </div>
                )}
                
                {job.desired_start_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">
                      Start: {format(new Date(job.desired_start_date), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
              
              <Separator className="my-3" />
              
              <p className="text-sm line-clamp-3">{job.description}</p>
            </CardContent>

            <CardFooter className="pt-0">
              <div className="w-full flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Posted {format(new Date(job.created_at), "MMM d, yyyy")}
                </span>
                <Button 
                  onClick={() => navigateToJobDetails(job.id)}
                  disabled={!isSubscribed && job.bid_count > 0}
                >
                  View Details
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderSubscriptionRequired = () => {
    if (isSubscribed) return null;

    return (
      <div className="bg-muted/50 border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Subscription Required</h3>
        <p className="text-sm text-muted-foreground mb-3">
          You need an active subscription to view jobs that already have bids or to submit your own bids.
        </p>
        <Button onClick={() => navigate("/subscription")}>
          Get a Subscription
        </Button>
      </div>
    );
  };

  return (
    <div className="container max-w-screen-xl py-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and bid on available painting jobs in your area
          </p>
        </div>
      </div>

      {renderSubscriptionRequired()}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full md:w-auto flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select
            value={projectTypeFilter}
            onValueChange={setProjectTypeFilter}
          >
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Filter by project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Project Types</SelectItem>
              {ProjectTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          onClick={() => {
            setSearchQuery("");
            setProjectTypeFilter("");
            fetchJobs();
          }}
        >
          Refresh
        </Button>
      </div>

      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="no-bids">No Bids Yet</TabsTrigger>
        </TabsList>
      </Tabs>

      {renderJobCards()}
      {renderPagination()}
    </div>
  );
};

export default JobMarketplace;
