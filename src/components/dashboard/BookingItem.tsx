
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { BookingWithPayments } from "@/types/auth";

interface BookingItemProps {
  booking: BookingWithPayments;
  detailed?: boolean;
}

const BookingItem: React.FC<BookingItemProps> = ({ booking, detailed = false }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "deposit_paid":
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "final_payment_pending":
        return "bg-orange-100 text-orange-800";
      case "pending_deposit":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className={`border rounded-lg ${detailed ? "overflow-hidden" : ""}`}>
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-medium">{booking.customerName}</div>
          <div className="text-sm text-muted-foreground">{booking.project_type}</div>
          <div className="flex flex-wrap items-center text-sm text-muted-foreground mt-1 gap-y-1">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {formatDate(booking.date)}
            <Clock className="h-3.5 w-3.5 mx-1 ml-2" />
            {booking.time}
            {detailed && (
              <>
                <span className="mx-2">•</span>
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {booking.address}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <Badge className={getStatusColor(booking.status)}>
            {getStatusLabel(booking.status)}
          </Badge>
          <div className="text-sm font-medium mt-2">
            {formatCurrency(booking.total_amount)}
          </div>
        </div>
      </div>
      
      {detailed && booking.notes && (
        <div className="bg-muted/50 p-3 text-sm border-t">
          <div className="font-medium mb-1">Notes:</div>
          <p className="text-muted-foreground">
            {booking.notes || "No additional notes provided."}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingItem;
