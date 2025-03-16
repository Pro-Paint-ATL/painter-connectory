
import React, { useState } from "react";
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
      const updatedCompanyInfo = {
        ...user.companyInfo,
        companyName,
        yearsInBusiness,
        businessDescription,
        isInsured,
        specialties
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
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyProfileForm;
