
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateSubscriptionAfterCheckout } from '@/api/webhooks';
import { RefreshCw } from 'lucide-react';
import { Subscription } from '@/types/auth';

interface SubscriptionSyncButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const SubscriptionSyncButton: React.FC<SubscriptionSyncButtonProps> = ({ 
  className = '', 
  variant = 'outline' 
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();

  const handleSync = async () => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to sync your subscription",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await updateSubscriptionAfterCheckout(user.id);
      
      if (result.success) {
        // Update the local user state with the new subscription
        // Type assertion to ensure it matches the Subscription type
        const subscription = result.subscription as Subscription;
        
        await updateUserProfile({
          subscription
        });
        
        toast({
          title: "Subscription Synced",
          description: "Your subscription status has been updated successfully.",
        });
      } else {
        toast({
          title: "Sync Failed",
          description: "Failed to sync your subscription. Please contact support.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error syncing subscription:", error);
      toast({
        title: "Sync Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={handleSync}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Subscription
        </>
      )}
    </Button>
  );
};

export default SubscriptionSyncButton;
