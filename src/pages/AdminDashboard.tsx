
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Calendar, PaintBucket, Search } from "lucide-react";

// Mock data for subscribed painters
const mockSubscribedPainters = [
  {
    id: "painter-1",
    name: "Mike Johnson",
    email: "mike@paintpro.com",
    subscriptionDate: "2023-08-15T10:30:00Z",
    status: "active",
    amountPaid: 49,
    nextBillingDate: "2023-09-15T10:30:00Z"
  },
  {
    id: "painter-2",
    name: "Sarah Williams",
    email: "sarah@colorexperts.com",
    subscriptionDate: "2023-07-22T14:15:00Z",
    status: "active",
    amountPaid: 49,
    nextBillingDate: "2023-08-22T14:15:00Z"
  },
  {
    id: "painter-3",
    name: "David Thompson",
    email: "david@perfectpaint.com",
    subscriptionDate: "2023-09-01T09:45:00Z",
    status: "active",
    amountPaid: 49,
    nextBillingDate: "2023-10-01T09:45:00Z"
  },
  {
    id: "painter-4",
    name: "Lisa Rodriguez",
    email: "lisa@freshcoats.com",
    subscriptionDate: "2023-08-05T16:20:00Z",
    status: "past_due",
    amountPaid: 49,
    nextBillingDate: "2023-09-05T16:20:00Z"
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [painters, setPainters] = useState(mockSubscribedPainters);
  
  // Calculate summary stats
  const totalRevenue = painters.reduce((sum, painter) => sum + painter.amountPaid, 0);
  const activePainters = painters.filter(p => p.status === "active").length;
  const pastDuePainters = painters.filter(p => p.status === "past_due").length;
  
  const filteredPainters = painters.filter(painter => 
    painter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    painter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage painter subscriptions and revenue</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold">${totalRevenue}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <PaintBucket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
              <h3 className="text-2xl font-bold">{activePainters}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="bg-destructive/10 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Past Due</p>
              <h3 className="text-2xl font-bold">{pastDuePainters}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Painter Subscriptions</CardTitle>
          <CardDescription>
            View and manage all painter subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search painters..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium text-sm">
              <div>Painter</div>
              <div>Subscription Date</div>
              <div>Status</div>
              <div>Amount</div>
              <div>Next Billing</div>
            </div>
            
            <div className="divide-y">
              {filteredPainters.length > 0 ? (
                filteredPainters.map((painter) => (
                  <div key={painter.id} className="grid grid-cols-5 gap-4 p-4 items-center text-sm">
                    <div>
                      <div className="font-medium">{painter.name}</div>
                      <div className="text-muted-foreground text-xs">{painter.email}</div>
                    </div>
                    <div>{formatDate(painter.subscriptionDate)}</div>
                    <div>
                      <Badge 
                        variant={painter.status === "active" ? "outline" : "destructive"}
                        className={painter.status === "active" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}
                      >
                        {painter.status === "active" ? "Active" : "Past Due"}
                      </Badge>
                    </div>
                    <div>${painter.amountPaid}/month</div>
                    <div>{formatDate(painter.nextBillingDate)}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No painters found matching your search.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
