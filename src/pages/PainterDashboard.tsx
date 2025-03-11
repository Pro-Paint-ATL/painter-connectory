import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, Star, DollarSign, Settings, PaintBucket, Briefcase, FileEdit, LogOut, Shield, Upload, CheckCircle2, XCircle } from "lucide-react";
import { PainterCompanyInfo } from "@/types/auth";

const PainterDashboard = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [specialtiesInput, setSpecialtiesInput] = useState("");
  
  // Company info form state
  const [companyInfo, setCompanyInfo] = useState<Omit<PainterCompanyInfo, 'yearsInBusiness'> & { yearsInBusiness: string | number }>({
    companyName: user?.companyInfo?.companyName || "",
    yearsInBusiness: user?.companyInfo?.yearsInBusiness || "",
    isInsured: user?.companyInfo?.isInsured || false,
    insuranceAmount: user?.companyInfo?.insuranceAmount || "",
    businessDescription: user?.companyInfo?.businessDescription || "",
    specialties: user?.companyInfo?.specialties || []
  });
  
  // Update form state when user data loads
  useEffect(() => {
    if (user?.companyInfo) {
      setCompanyInfo({
        companyName: user.companyInfo.companyName || "",
        yearsInBusiness: user.companyInfo.yearsInBusiness || "",
        isInsured: user.companyInfo.isInsured || false,
        insuranceAmount: user.companyInfo.insuranceAmount || "",
        businessDescription: user.companyInfo.businessDescription || "",
        specialties: user.companyInfo.specialties || []
      });
      setSpecialtiesInput(user.companyInfo.specialties?.join(", ") || "");
    }
  }, [user]);
  
  // Redirect to customer profile if user is not a painter
  useEffect(() => {
    if (user && user.role !== "painter") {
      navigate("/profile");
    }
  }, [user, navigate]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSpecialtiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialtiesInput(e.target.value);
  };
  
  const handleSaveCompanyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process specialties from comma-separated string to array
    const specialtiesArray = specialtiesInput
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);
      
    // Properly convert yearsInBusiness to number or undefined
    const updatedCompanyInfo: PainterCompanyInfo = {
      companyName: companyInfo.companyName,
      yearsInBusiness: companyInfo.yearsInBusiness ? Number(companyInfo.yearsInBusiness) : undefined,
      isInsured: companyInfo.isInsured,
      insuranceAmount: companyInfo.insuranceAmount,
      businessDescription: companyInfo.businessDescription,
      specialties: specialtiesArray,
      // Maintain any other fields that might exist
      insuranceDocumentUrl: user?.companyInfo?.insuranceDocumentUrl,
      logoUrl: user?.companyInfo?.logoUrl,
      portfolio: user?.companyInfo?.portfolio
    };
    
    try {
      await updateUserProfile({
        companyInfo: updatedCompanyInfo
      });
      
      toast({
        title: "Company Profile Updated",
        description: "Your company information has been saved successfully."
      });
    } catch (error) {
      console.error("Error updating company profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your company profile.",
        variant: "destructive"
      });
    }
  };
  
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      // Upload logo to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-logo.${fileExt}`;
      const { data, error } = await useAuth().supabase.storage
        .from('painter-assets')
        .upload(`logos/${fileName}`, file, { upsert: true });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = useAuth().supabase.storage
        .from('painter-assets')
        .getPublicUrl(`logos/${fileName}`);
      
      // Create properly typed updated company info
      const updatedCompanyInfo: PainterCompanyInfo = {
        companyName: companyInfo.companyName,
        yearsInBusiness: companyInfo.yearsInBusiness ? Number(companyInfo.yearsInBusiness) : undefined,
        isInsured: companyInfo.isInsured,
        insuranceAmount: companyInfo.insuranceAmount,
        businessDescription: companyInfo.businessDescription,
        specialties: companyInfo.specialties,
        logoUrl: urlData?.publicUrl,
        // Preserve other fields
        insuranceDocumentUrl: user?.companyInfo?.insuranceDocumentUrl,
        portfolio: user?.companyInfo?.portfolio
      };
      
      // Update user profile
      await updateUserProfile({
        companyInfo: updatedCompanyInfo
      });
      
      toast({
        title: "Logo Uploaded",
        description: "Your company logo has been uploaded successfully."
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your logo.",
        variant: "destructive"
      });
    }
  };
  
  const handleUploadInsurance = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      // Upload insurance document to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-insurance.${fileExt}`;
      const { data, error } = await useAuth().supabase.storage
        .from('painter-assets')
        .upload(`insurance/${fileName}`, file, { upsert: true });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = useAuth().supabase.storage
        .from('painter-assets')
        .getPublicUrl(`insurance/${fileName}`);
      
      // Create properly typed updated company info
      const updatedCompanyInfo: PainterCompanyInfo = {
        companyName: companyInfo.companyName,
        yearsInBusiness: companyInfo.yearsInBusiness ? Number(companyInfo.yearsInBusiness) : undefined,
        isInsured: true,
        insuranceAmount: companyInfo.insuranceAmount,
        businessDescription: companyInfo.businessDescription,
        specialties: companyInfo.specialties,
        insuranceDocumentUrl: urlData?.publicUrl,
        // Preserve other fields
        logoUrl: user?.companyInfo?.logoUrl,
        portfolio: user?.companyInfo?.portfolio
      };
      
      // Update user profile
      await updateUserProfile({
        companyInfo: updatedCompanyInfo
      });
      
      setCompanyInfo(prev => ({
        ...prev,
        isInsured: true
      }));
      
      toast({
        title: "Insurance Document Uploaded",
        description: "Your insurance document has been uploaded successfully."
      });
    } catch (error) {
      console.error("Error uploading insurance document:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your insurance document.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-center py-8">Loading painter dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPro = user.subscription?.status === "active";
  const hasCompanyInfo = user.companyInfo?.companyName && user.companyInfo.companyName.length > 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.avatar || user.companyInfo?.logoUrl} />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      <PaintBucket className="h-8 w-8 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.companyInfo?.companyName || user.name}</h2>
                  <div className="flex items-center mt-1">
                    <Badge variant={isPro ? "default" : "secondary"} className="mr-2">
                      {isPro ? "Pro Painter" : "Painter"}
                    </Badge>
                    {user.companyInfo?.isInsured && (
                      <Badge variant="outline" className="bg-green-50">
                        <Shield className="h-3 w-3 mr-1" /> Insured
                      </Badge>
                    )}
                  </div>
                </div>
                
                {!hasCompanyInfo && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 font-medium">
                      Complete your company profile to appear in painter searches
                    </p>
                  </div>
                )}
                
                {!isPro && (
                  <div className="mb-6 p-3 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm font-medium mb-2">Upgrade to Pro Painter</p>
                    <Button 
                      onClick={() => navigate("/subscription")}
                      className="w-full"
                      size="sm"
                    >
                      <Star className="h-4 w-4 mr-2" /> Go Pro
                    </Button>
                  </div>
                )}
                
                <nav className="space-y-1">
                  <Button 
                    variant={activeTab === "dashboard" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button 
                    variant={activeTab === "company" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("company")}
                  >
                    <PaintBucket className="mr-2 h-4 w-4" />
                    Company Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate("/profile")}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    Bookings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/subscription")}>
                    <Star className="mr-2 h-4 w-4" />
                    Subscription
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </nav>
                
                <div className="mt-6 pt-6 border-t">
                  <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-3/4">
            {activeTab === "dashboard" && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold">Painter Dashboard</h1>
                  <p className="text-muted-foreground">Manage your painter profile, bookings, and business</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                          <h3 className="text-2xl font-bold">4</h3>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Customers</p>
                          <h3 className="text-2xl font-bold">12</h3>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Earnings</p>
                          <h3 className="text-2xl font-bold">$2,450</h3>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-full">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
                    <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming">
                    <Card>
                      <CardHeader>
                        <CardTitle>Upcoming Bookings</CardTitle>
                        <CardDescription>Manage your scheduled painting jobs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Sample upcoming bookings - would come from API in production */}
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">Alex Johnson</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Mar 25, 2025 - Interior Painting
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-2">
                              <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
                              <Button size="sm" variant="outline">Details</Button>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">Sarah Miller</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Apr 10, 2025 - Exterior Painting
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-2">
                              <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                              <Button size="sm" variant="outline">Details</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    <Card>
                      <CardHeader>
                        <CardTitle>Completed Jobs</CardTitle>
                        <CardDescription>View your finished painting projects</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Sample completed jobs - would come from API in production */}
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">Michael Brown</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Feb 15, 2025 - Kitchen Repainting
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`h-4 w-4 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <Button size="sm" variant="outline">Invoice</Button>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row md:items-center p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">Jessica Taylor</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Jan 20, 2025 - Living Room
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <Button size="sm" variant="outline">Invoice</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
            
            {activeTab === "company" && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold">Company Profile</h1>
                  <p className="text-muted-foreground">Manage your company information and appearance in searches</p>
                </div>
                
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Add details about your painting business</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveCompanyInfo} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name*</Label>
                          <Input 
                            id="companyName"
                            name="companyName"
                            value={companyInfo.companyName}
                            onChange={handleInputChange}
                            placeholder="Elite Painters, Inc."
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="yearsInBusiness">Years in Business</Label>
                          <Input 
                            id="yearsInBusiness"
                            name="yearsInBusiness"
                            type="number"
                            value={companyInfo.yearsInBusiness}
                            onChange={handleInputChange}
                            placeholder="5"
                          />
                        </div>
                        
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <Label htmlFor="businessDescription">Business Description</Label>
                          <Textarea 
                            id="businessDescription"
                            name="businessDescription"
                            value={companyInfo.businessDescription}
                            onChange={handleInputChange}
                            placeholder="Describe your painting services and expertise..."
                            rows={4}
                          />
                        </div>
                        
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                          <Input 
                            id="specialties"
                            value={specialtiesInput}
                            onChange={handleSpecialtiesChange}
                            placeholder="Interior, Exterior, Commercial, Residential"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter specialties separated by commas (e.g., Interior, Exterior, Commercial)
                          </p>
                        </div>
                        
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="isInsured"
                              name="isInsured"
                              checked={companyInfo.isInsured}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="isInsured">My business is insured</Label>
                          </div>
                        </div>
                        
                        {companyInfo.isInsured && (
                          <div className="space-y-2">
                            <Label htmlFor="insuranceAmount">Insurance Amount</Label>
                            <Input 
                              id="insuranceAmount"
                              name="insuranceAmount"
                              value={companyInfo.insuranceAmount}
                              onChange={handleInputChange}
                              placeholder="$1,000,000"
                            />
                          </div>
                        )}
                      </div>
                      
                      <Button type="submit">Save Company Information</Button>
                    </form>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Logo</CardTitle>
                      <CardDescription>Upload your business logo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {user.companyInfo?.logoUrl ? (
                          <div className="flex flex-col items-center">
                            <div className="w-32 h-32 overflow-hidden rounded-lg border border-gray-200 mb-4">
                              <img 
                                src={user.companyInfo.logoUrl} 
                                alt="Company Logo" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex items-center text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Logo uploaded
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                            <PaintBucket className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-muted-foreground mb-4">Upload your company logo</p>
                          </div>
                        )}
                        
                        <Label 
                          htmlFor="logoUpload" 
                          className="flex justify-center w-full cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary py-2 px-4 rounded-md font-medium transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {user.companyInfo?.logoUrl ? 'Change Logo' : 'Upload Logo'}
                        </Label>
                        <input 
                          id="logoUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleUploadLogo}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 512x512px. JPG, PNG or WebP format.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Insurance Document</CardTitle>
                      <CardDescription>Upload proof of insurance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {user.companyInfo?.insuranceDocumentUrl ? (
                          <div className="flex items-center p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center text-sm text-green-600 mb-1">
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Insurance document uploaded
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Your insurance verification is under review
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(user.companyInfo?.insuranceDocumentUrl, '_blank')}
                            >
                              View
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                            <Shield className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-muted-foreground mb-4">Upload your insurance documents</p>
                          </div>
                        )}
                        
                        <Label 
                          htmlFor="insuranceUpload" 
                          className="flex justify-center w-full cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary py-2 px-4 rounded-md font-medium transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {user.companyInfo?.insuranceDocumentUrl ? 'Update Document' : 'Upload Document'}
                        </Label>
                        <input 
                          id="insuranceUpload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleUploadInsurance}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                          Upload proof of insurance (PDF, JPG, or PNG)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                    <CardDescription>Showcase your past painting projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {user.companyInfo?.portfolio && user.companyInfo.portfolio.length > 0 ? (
                        user.companyInfo.portfolio.map((image, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img 
                              src={image} 
                              alt={`Portfolio image ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-muted-foreground">Add photos</p>
                          </div>
                          <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-muted-foreground">Add photos</p>
                          </div>
                          <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-muted-foreground">Add photos</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" /> Upload Portfolio Images
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Upload photos of your best painting projects (JPG, PNG or WebP format)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PainterDashboard;
