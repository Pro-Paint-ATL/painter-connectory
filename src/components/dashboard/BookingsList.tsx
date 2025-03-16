
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { PaintBucket } from "lucide-react";
import { BookingWithPayments } from "@/types/auth";
import BookingItem from "./BookingItem";

interface BookingsListProps {
  bookings: BookingWithPayments[];
  isLoading: boolean;
}

const BookingsList: React.FC<BookingsListProps> = ({ bookings, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bookings</CardTitle>
        <CardDescription>Manage all your painting projects</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading bookings...</div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingItem 
                key={booking.id} 
                booking={booking} 
                detailed={true} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PaintBucket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No bookings yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsList;
