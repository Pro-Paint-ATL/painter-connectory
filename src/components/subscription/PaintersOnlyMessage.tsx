
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideInfo, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PaintersOnlyMessage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogoutAndRegister = async () => {
    try {
      await logout();
      setTimeout(() => {
        navigate("/");
        // Set a small timeout to open the register dialog
        setTimeout(() => {
          const event = new CustomEvent('open-register-painter');
          window.dispatchEvent(event);
        }, 500);
      }, 100);
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <LucideInfo className="h-5 w-5 text-primary" />
          <CardTitle>Subscription Available for Painters Only</CardTitle>
        </div>
        <CardDescription>
          This subscription plan is specifically designed for professional painter accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your current account is not registered as a painter. To access our subscription benefits:
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <h3 className="font-medium text-amber-800 mb-2">Options to access painter features:</h3>
            <ul className="list-disc list-inside text-sm text-amber-700 space-y-2">
              <li>Log out and create a new account as a painter</li>
              <li>Contact support to change your account type</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={() => navigate("/find-painters")}>
          Find Painters Instead
        </Button>
        <Button 
          variant="default" 
          onClick={handleLogoutAndRegister}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out & Register as Painter</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaintersOnlyMessage;
