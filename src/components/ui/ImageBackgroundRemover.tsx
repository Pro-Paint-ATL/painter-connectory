
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { removeBackground, loadImage } from '@/utils/imageUtils';

interface ImageBackgroundRemoverProps {
  imageUrl: string;
  onProcessed: (newImageUrl: string) => void;
}

const ImageBackgroundRemover = ({ imageUrl, onProcessed }: ImageBackgroundRemoverProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemoveBackground = async () => {
    try {
      setIsProcessing(true);
      
      // Fetch the image
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();
      
      // Load the image
      const img = await loadImage(imageBlob);
      
      // Remove background
      const processedBlob = await removeBackground(img);
      
      // Create URL for processed image
      const processedUrl = URL.createObjectURL(processedBlob);
      onProcessed(processedUrl);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleRemoveBackground}
      disabled={isProcessing}
    >
      {isProcessing ? 'Processing...' : 'Make Background Transparent'}
    </Button>
  );
};

export default ImageBackgroundRemover;
