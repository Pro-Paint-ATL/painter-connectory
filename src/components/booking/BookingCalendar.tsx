import React, { useState } from "react";
import { format, addDays, addMonths, startOfWeek, endOfWeek, startOfDay, isSameDay, isAfter, isBefore, isToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface BookingCalendarProps {
  painterId: string;
  onTimeSelected: (date: Date, time: string) => void;
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ painterId, onTimeSelected, onSelectDate, selectedDate: externalSelectedDate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(externalSelectedDate);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [monthOffset, setMonthOffset] = useState(0);
  const [availability, setAvailability] = useState<Availability[]>([]);

  React.useEffect(() => {
    const generateMockAvailability = () => {
      const now = new Date();
      const nextThreeMonths = Array.from({ length: 90 }, (_, i) => addDays(now, i + 1));
      
      const weekdays = nextThreeMonths.filter(date => {
        const day = date.getDay();
        return day !== 0 && day !== 6;
      });
      
      return weekdays.map(date => {
        const morningSlots = ["9:00 AM", "10:00 AM", "11:00 AM"];
        const afternoonSlots = ["1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
        
        const availableTimes = [
          ...morningSlots.filter(() => Math.random() > 0.3),
          ...afternoonSlots.filter(() => Math.random() > 0.3),
        ];
        
        return {
          date,
          times: availableTimes.length > 0 ? availableTimes : [],
        };
      });
    };
    
    setAvailability(generateMockAvailability());
  }, [painterId]);

  const getAvailableTimesForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    const dayAvailability = availability.find(avail => 
      isSameDay(avail.date, date)
    );
    
    return dayAvailability?.times || [];
  };

  const availableTimesForSelectedDate = getAvailableTimesForDate(selectedDate);

  const hasAvailability = (date: Date) => {
    const dayAvailability = availability.find(avail => 
      isSameDay(avail.date, date)
    );
    
    return dayAvailability && dayAvailability.times.length > 0;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
    if (date && onSelectDate) {
      onSelectDate(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onTimeSelected(selectedDate, time);
    }
  };

  const handlePreviousMonth = () => {
    setMonthOffset(prev => prev - 1);
  };

  const handleNextMonth = () => {
    setMonthOffset(prev => prev + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {format(addMonths(new Date(), monthOffset), "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={addMonths(new Date(), monthOffset)}
            className="rounded-md border pointer-events-auto"
            modifiers={{
              available: (date) => hasAvailability(date),
            }}
            modifiersClassNames={{
              available: "border-2 border-primary/20 bg-primary/5 font-medium",
            }}
            disabled={(date) => 
              isToday(date) || 
              isBefore(date, new Date()) || 
              isAfter(date, addMonths(new Date(), 3)) ||
              !hasAvailability(date)
            }
          />
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardContent className="p-6">
          <h3 className="font-medium text-lg mb-4">
            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a Date"}
          </h3>
          
          {selectedDate ? (
            availableTimesForSelectedDate.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableTimesForSelectedDate.map((time, index) => (
                  <Button
                    key={index}
                    variant={selectedTime === time ? "default" : "outline"}
                    className={cn(
                      "h-auto py-3 justify-start",
                      selectedTime === time ? "bg-primary text-primary-foreground" : ""
                    )}
                    onClick={() => handleTimeSelect(time)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                No available times for this date
              </div>
            )
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              Please select a date to view available times
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;
