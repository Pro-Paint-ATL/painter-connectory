
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaintBucket, Brush, Calendar, MapPin, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { BookingWithPayments, User } from "@/types/auth";
import { NavigateFunction } from "react-router-dom";
import BookingItem from "./BookingItem";
import SubscriptionSyncButton from "@/components/subscription/SubscriptionSyncButton";

interface DashboardOverviewProps {
  bookings: BookingWithPayments[];
  isLoading: boolean;
  user: User;
  setActiveTab: (tab: string) => void;
  navigate: NavigateFunction;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  bookings, 
  isLoading, 
  user, 
  setActiveTab, 
  navigate 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your latest painting projects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading bookings...</div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <BookingItem key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PaintBucket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No bookings yet</p>
              </div>
            )}
            {bookings.length > 0 && (
              <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("bookings")}>
                View All Bookings
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current Pro Painter subscription</CardDescription>
          </CardHeader>
          <CardContent>
            {user.subscription ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Badge variant={user.subscription.status === "active" ? "default" : "outline"}>
                      {user.subscription.status === "active" ? "Active" : user.subscription.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.subscription.plan} Plan - ${user.subscription.amount || 0}/{user.subscription.interval || "month"}
                  </p>
                  {user.subscription.endDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Renews: {new Date(user.subscription.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => navigate("/subscription")}>Manage</Button>
                  <SubscriptionSyncButton variant="ghost" className="px-2" />
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="mb-4">You don't have an active subscription</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                  <Button onClick={() => navigate("/subscription")}>Subscribe Now</Button>
                  <SubscriptionSyncButton variant="secondary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Already subscribed through Stripe? Click "Sync Subscription"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>Your business information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              {user.companyInfo?.logoUrl ? (
                <div className="w-20 h-20 rounded-md overflow-hidden mx-auto mb-2">
                  <img 
                    src={user.companyInfo.logoUrl} 
                    alt={user.companyInfo.companyName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <Avatar className="h-20 w-20 mx-auto mb-2">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.companyInfo?.companyName?.charAt(0) || user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <h3 className="font-medium text-lg">
                {user.companyInfo?.companyName || user.name}
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Brush className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Specialties</div>
                  <div className="text-sm text-muted-foreground">
                    {user.companyInfo?.specialties?.length ? 
                      user.companyInfo.specialties.join(", ") : 
                      "No specialties added"}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Experience</div>
                  <div className="text-sm text-muted-foreground">
                    {user.companyInfo?.yearsInBusiness ? 
                      `${user.companyInfo.yearsInBusiness} years in business` : 
                      "Experience not specified"}
                  </div>
                </div>
              </div>
              
              {user.location?.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-sm text-muted-foreground">
                      {user.location.address}
                    </div>
                  </div>
                </div>
              )}
              
              {user.location?.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Contact</div>
                    <div className="text-sm text-muted-foreground">
                      {user.location.phone}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setActiveTab("profile")}
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
