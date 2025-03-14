
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideInfo } from "lucide-react";

const PaintersOnlyMessage: React.FC = () => {
  const navigate = useNavigate();

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
        <p className="text-sm text-muted-foreground mb-4">
          If you'd like to register as a painter, please sign up with a painter account or
          contact support to change your account type.
        </p>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            To create a painter account, log out first and register as a painter.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/")}>Return to Home</Button>
        <Button onClick={() => navigate("/find-painters")}>Find Painters</Button>
      </CardFooter>
    </Card>
  );
};

export default PaintersOnlyMessage;
