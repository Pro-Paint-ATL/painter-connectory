
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  address: z.string().min(5, "Address is required"),
  zip_code: z.string().min(5, "Valid ZIP code is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  project_type: z.string().min(1, "Project type is required"),
  budget_range: z.string().optional(),
  square_footage: z.number().positive().optional(),
  desired_start_date: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const projectTypes = [
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

const budgetRanges = [
  "Under $500",
  "$500 - $1,000",
  "$1,000 - $2,500",
  "$2,500 - $5,000",
  "$5,000 - $10,000",
  "Over $10,000",
  "Not sure yet"
];

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      zip_code: "",
      city: "",
      state: "",
      project_type: "",
      budget_range: "",
      square_footage: undefined,
      desired_start_date: undefined,
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files) return;
    
    const newFiles = Array.from(files);
    
    // Check total number of images
    if (images.length + newFiles.length > MAX_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${MAX_IMAGES} images in total.`,
        variant: "destructive",
      });
      return;
    }
    
    // Filter out files that are too large or not images
    const validFiles = newFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setImages(prev => [...prev, ...validFiles]);
    
    // Create temporary URLs for preview
    validFiles.forEach(file => {
      setImageUrls(prev => [...prev, URL.createObjectURL(file)]);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const uploadImagesToStorage = async (jobId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of images) {
      const fileName = `${jobId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from("job_images")
        .upload(fileName, file);
      
      if (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Error uploading image",
          description: error.message,
          variant: "destructive",
        });
        continue;
      }
      
      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from("job_images")
          .getPublicUrl(data.path);
        
        uploadedUrls.push(publicUrl);
      }
    }
    
    return uploadedUrls;
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to post a job",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First create the job record
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          customer_id: user.id,
          title: values.title,
          description: values.description,
          address: values.address,
          zip_code: values.zip_code,
          city: values.city,
          state: values.state,
          project_type: values.project_type,
          budget_range: values.budget_range,
          square_footage: values.square_footage,
          desired_start_date: values.desired_start_date ? values.desired_start_date.toISOString() : null,
          images: [],
          status: "open",
        })
        .select("id")
        .single();
      
      if (jobError) {
        throw jobError;
      }
      
      // Now upload the images and update the job record with the image URLs
      if (images.length > 0 && jobData?.id) {
        const imageUrls = await uploadImagesToStorage(jobData.id);
        
        if (imageUrls.length > 0) {
          const { error: updateError } = await supabase
            .from("jobs")
            .update({ images: imageUrls })
            .eq("id", jobData.id);
          
          if (updateError) {
            console.error("Error updating job with image URLs:", updateError);
          }
        }
      }
      
      toast({
        title: "Job posted successfully",
        description: "Your job has been posted to the marketplace.",
      });
      
      navigate("/manage-jobs");
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast({
        title: "Error posting job",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Painting Job</CardTitle>
          <CardDescription>
            Describe your painting project to receive bids from qualified painters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Paint Living Room and Kitchen" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear title that summarizes your painting needs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your painting project in detail. Include information about the surfaces to be painted, current condition, any repairs needed, color preferences, etc." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The more details you provide, the more accurate bids you'll receive
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 90210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Los Angeles" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="project_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projectTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="budget_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="square_footage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Footage (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 500" 
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value === undefined ? '' : field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Approximate area to be painted in square feet
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="desired_start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Desired Start Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When would you like the work to start?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <FormLabel htmlFor="images">Project Images (Optional, up to 5)</FormLabel>
                  <div className="mt-2">
                    <label htmlFor="images" className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-6 w-6 text-gray-500 mb-2" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG or JPEG (MAX. 5MB each)
                        </p>
                      </div>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <FormDescription>
                    Upload images of the area to be painted to help painters provide accurate bids
                  </FormDescription>
                  
                  {imageUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full rounded-md object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting Job...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
