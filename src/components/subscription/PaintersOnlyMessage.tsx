
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PaintersOnlyMessage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Subscription Available for Painters Only</CardTitle>
        <CardDescription>
          This subscription plan is only available for painter accounts.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
      </CardFooter>
    </Card>
  );
};

export default PaintersOnlyMessage;
