
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { removeBackground, loadImage } from '@/utils/imageUtils';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProfileBackgroundUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
}

const ProfileBackgroundUploader: React.FC<ProfileBackgroundUploaderProps> = ({ 
  onImageUploaded 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      setIsUploading(true);
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
      onImageUploaded(imageUrl);
      toast({
        title: "Image uploaded",
        description: "Your background image has been uploaded."
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!uploadedImageUrl) return;
    
    try {
      setIsProcessing(true);
      toast({
        title: "Processing...",
        description: "Removing background from your image. This may take a minute."
      });
      
      // Fetch the image
      const response = await fetch(uploadedImageUrl);
      const imageBlob = await response.blob();
      
      // Load the image
      const img = await loadImage(imageBlob);
      
      // Remove background
      const processedBlob = await removeBackground(img);
      
      // Create URL for processed image
      const processedUrl = URL.createObjectURL(processedBlob);
      setUploadedImageUrl(processedUrl);
      onImageUploaded(processedUrl);
      
      toast({
        title: "Background removed",
        description: "Your image background has been successfully removed."
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing failed",
        description: "There was an error removing the background.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="background-image">Upload Profile Background</Label>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('background-image')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Image'
            )}
          </Button>
          {uploadedImageUrl && (
            <Button
              onClick={handleRemoveBackground}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Remove Background'
              )}
            </Button>
          )}
          <input
            type="file"
            id="background-image"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>
      
      {uploadedImageUrl && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <div className="border rounded-md overflow-hidden" style={{ maxWidth: '400px', maxHeight: '200px' }}>
            <img 
              src={uploadedImageUrl} 
              alt="Background preview" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBackgroundUploader;
