
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Clock, 
  Edit, 
  Loader2, 
  MapPin, 
  Plus, 
  Paintbrush, 
  Trash2,
  Users
} from "lucide-react";
import { Job } from "@/types/job";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (user.role !== "customer") {
      toast({
        title: "Access Denied",
        description: "Only customers can access the job management page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchJobs();
  }, [user, navigate]);

  const fetchJobs = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, bids(count)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedJobs = data.map(job => ({
        ...job,
        bid_count: job.bids?.[0]?.count || 0
      })) as Job[];

      setJobs(processedJobs);
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

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobToDelete)
        .eq("customer_id", user?.id);

      if (error) throw error;

      toast({
        title: "Job Deleted",
        description: "Your job has been deleted successfully.",
      });

      // Update local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobToDelete));
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setJobToDelete(null);
    }
  };

  const renderJobStatus = (status: string) => {
    let statusText = status.charAt(0).toUpperCase() + status.slice(1);
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";

    switch (status) {
      case "open":
        statusText = "Open for Bids";
        variant = "default";
        break;
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

  const filteredJobs = () => {
    switch (activeTab) {
      case "active":
        return jobs.filter(job => job.status === "open" || job.status === "assigned");
      case "completed":
        return jobs.filter(job => job.status === "completed");
      case "cancelled":
        return jobs.filter(job => job.status === "cancelled");
      default:
        return jobs;
    }
  };

  const renderJobCards = () => {
    const filtered = filteredJobs();

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your jobs...</span>
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">
            {activeTab === "active" 
              ? "You don't have any active jobs. Create a new job to get started!" 
              : "No jobs found in this category."}
          </p>
          {activeTab === "active" && (
            <Button onClick={() => navigate("/post-job")}>
              <Plus className="mr-2 h-4 w-4" />
              Post a New Job
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((job) => (
          <Card key={job.id} className="overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl line-clamp-2">{job.title}</CardTitle>
                {renderJobStatus(job.status)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {job.city}, {job.state}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pb-2 flex-grow">
              <div className="flex items-center mb-2">
                <Paintbrush className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">{job.project_type}</span>
              </div>
              
              <div className="flex items-center mb-2">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">
                  {job.bid_count} bid{job.bid_count !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">
                  {job.desired_start_date 
                    ? `Start: ${format(new Date(job.desired_start_date), "MMM d, yyyy")}` 
                    : "No start date specified"}
                </span>
              </div>
              
              <div className="mt-4">
                <p className="text-sm line-clamp-2">{job.description}</p>
              </div>
            </CardContent>

            <CardFooter className="pt-2 flex-shrink-0">
              <div className="w-full flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Posted {format(new Date(job.created_at), "MMM d, yyyy")}
                </span>
                <div className="flex gap-2">
                  {job.status === "open" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this job? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              setJobToDelete(job.id);
                              handleDeleteJob();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting && jobToDelete === job.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button 
                    onClick={() => navigate(`/job/${job.id}`)}
                    size="sm"
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
            Post jobs, review bids, and manage your painting projects
          </p>
        </div>
        <Button onClick={() => navigate("/post-job")}>
          <Plus className="mr-2 h-4 w-4" />
          Post a New Job
        </Button>
      </div>

      <Tabs 
        defaultValue="active" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {renderJobCards()}
    </div>
  );
};

export default ManageJobs;
