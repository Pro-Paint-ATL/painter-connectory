
import React, { useState, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/auth";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CompanyProfileFormProps {
  user: User;
}

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({ user }) => {
  const { updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>(
    user.companyInfo?.specialties || []
  );
  const [newSpecialty, setNewSpecialty] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    user.companyInfo?.logoUrl
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const companyName = formData.get("companyName") as string;
    const yearsInBusiness = parseInt(formData.get("yearsInBusiness") as string) || 0;
    const businessDescription = formData.get("businessDescription") as string;
    const isInsured = formData.has("isInsured");

    if (!user || !user.companyInfo) return;
    
    setIsLoading(true);
    
    try {
      // Upload logo if there's a new file
      let logoUrl = user.companyInfo?.logoUrl;
      
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }
      
      const updatedCompanyInfo = {
        ...user.companyInfo,
        companyName,
        yearsInBusiness,
        businessDescription,
        isInsured,
        specialties,
        logoUrl
      };
      
      await updateUserProfile({
        companyInfo: updatedCompanyInfo
      });
      
      toast({
        title: "Profile Updated",
        description: "Your company profile has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      // Create a unique file name using the user ID and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-logo-${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload company logo. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only JPEG or PNG files.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload images smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    setLogoFile(file);
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSpecialty = () => {
    if (!newSpecialty.trim()) return;
    if (specialties.includes(newSpecialty.trim())) {
      toast({
        title: "Specialty already exists",
        description: "This specialty is already in your list."
      });
      return;
    }
    
    setSpecialties([...specialties, newSpecialty.trim()]);
    setNewSpecialty("");
  };
  
  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>Manage your business information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="space-y-4">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative w-32 h-32 rounded-md overflow-hidden border bg-secondary/20">
                  <img 
                    src={logoPreview} 
                    alt="Company logo" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                    title="Remove logo"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-md border border-dashed flex items-center justify-center bg-secondary/20">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              
              <div className="space-y-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  id="logo"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Logo"}
                  {!isUploading && <Upload className="ml-2 h-4 w-4" />}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPEG, PNG. Max size: 5MB
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={user.companyInfo?.companyName || ""}
                placeholder="Your company name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                name="yearsInBusiness"
                type="number"
                min="0"
                defaultValue={user.companyInfo?.yearsInBusiness || ""}
                placeholder="e.g., 5"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Specialties</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSpecialty(specialty)}>
                  {specialty} <span className="ml-1">×</span>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Add a specialty"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSpecialty())}
              />
              <Button type="button" variant="outline" onClick={handleAddSpecialty}>
                Add
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              name="businessDescription"
              defaultValue={user.companyInfo?.businessDescription || ""}
              placeholder="Describe your painting business and services"
              rows={4}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isInsured"
              name="isInsured"
              defaultChecked={user.companyInfo?.isInsured || false}
            />
            <Label htmlFor="isInsured">My business is insured</Label>
          </div>
          
          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyProfileForm;
