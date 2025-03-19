
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Job } from "@/types/job";
import { format } from "date-fns";
import { Loader2, PlusCircle, Search, Calendar, MapPin, Paintbrush } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (user.role !== "customer") {
      navigate("/");
      return;
    }

    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, bids(count)")
        .eq("customer_id", user?.id)
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
        description: "Failed to load your jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeTab, jobs]);

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

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(job => job.status === activeTab);
    }

    setFilteredJobs(filtered);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This cannot be undone.")) {
      return;
    }

    try {
      // Update job status to cancelled rather than deleting
      const { error } = await supabase
        .from("jobs")
        .update({ status: "cancelled" })
        .eq("id", jobId)
        .eq("customer_id", user?.id);

      if (error) throw error;

      toast({
        title: "Job cancelled",
        description: "Your job has been cancelled successfully.",
      });

      // Refresh the job list
      fetchJobs();
    } catch (error: any) {
      console.error("Error cancelling job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge>Open for Bids</Badge>;
      case 'assigned':
        return <Badge variant="secondary">Painter Assigned</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderJobs = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your jobs...</span>
        </div>
      );
    }

    if (filteredJobs.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">
            {searchQuery || activeTab !== "all"
              ? "No jobs match your filters"
              : "You haven't posted any jobs yet"}
          </p>
          {searchQuery || activeTab !== "all" ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
            >
              Clear Filters
            </Button>
          ) : (
            <Button onClick={() => navigate("/post-job")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Post Your First Job
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="overflow-hidden h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl line-clamp-2">{job.title}</CardTitle>
                {getStatusBadge(job.status)}
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
                <Badge variant="outline" className="font-normal">
                  {job.bid_count} {job.bid_count === 1 ? "bid" : "bids"}
                </Badge>
                <div className="flex gap-2">
                  {job.status === "open" && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/job/${job.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-screen-xl py-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Your Jobs</h1>
          <p className="text-muted-foreground">
            View, edit, and manage all your posted painting jobs
          </p>
        </div>
        <Button onClick={() => navigate("/post-job")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your jobs..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button 
          variant="outline" 
          onClick={fetchJobs}
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
          <TabsTrigger value="open">Open Jobs</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {renderJobs()}
    </div>
  );
};

export default ManageJobs;
