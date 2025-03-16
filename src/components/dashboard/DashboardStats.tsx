
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, Star } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalEarnings: number;
    pendingBookings: number;
    completedBookings: number;
    averageRating: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="p-4 rounded-full bg-primary/10 mr-4">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="p-4 rounded-full bg-primary/10 mr-4">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Upcoming Jobs</p>
            <p className="text-2xl font-bold">{stats.pendingBookings}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="p-4 rounded-full bg-primary/10 mr-4">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rating</p>
            <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
