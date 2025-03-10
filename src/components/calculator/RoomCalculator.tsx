
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { PaintBucket, Trash2 } from "lucide-react";

interface RoomCalculatorProps {
  onCalculate: (totalCost: number, details: RoomDetail[]) => void;
  painterId?: string;
}

export interface RoomDetail {
  id: string;
  name: string;
  walls: {
    width: number;
    height: number;
    area: number;
  };
  ceiling: boolean;
  ceilingArea: number;
  trim: boolean;
  doors: number;
  windows: number;
  complexity: number;
  paintQuality: "basic" | "standard" | "premium";
  coats: number;
  roomCost: number;
}

interface PaintRate {
  labor: {
    basic: number;
    standard: number;
    premium: number;
  };
  materialPerSqFt: {
    basic: number;
    standard: number;
    premium: number;
  };
  doorCost: number;
  windowCost: number;
  trimCost: number;
  ceilingFactor: number;
  complexityFactor: number;
}

const defaultPaintRates: PaintRate = {
  labor: {
    basic: 1.75,
    standard: 2.5,
    premium: 4.0,
  },
  materialPerSqFt: {
    basic: 0.25,
    standard: 0.50,
    premium: 1.0,
  },
  doorCost: 50,
  windowCost: 35,
  trimCost: 1.25, // per sq ft of wall area
  ceilingFactor: 0.8, // percentage of wall rate
  complexityFactor: 0.25, // per complexity level
};

// Initialize with sample room
const initialRooms: RoomDetail[] = [
  {
    id: "room1",
    name: "Living Room",
    walls: {
      width: 12, // width in feet
      height: 9, // height in feet
      area: 0, // calculated
    },
    ceiling: true,
    ceilingArea: 0, // calculated
    trim: true,
    doors: 2,
    windows: 3,
    complexity: 1, // 1-5 scale
    paintQuality: "standard",
    coats: 2,
    roomCost: 0, // calculated
  },
];

const RoomCalculator: React.FC<RoomCalculatorProps> = ({ onCalculate, painterId }) => {
  const [rooms, setRooms] = useState<RoomDetail[]>(initialRooms);
  const [paintRates, setPaintRates] = useState<PaintRate>(defaultPaintRates);
  const [totalCost, setTotalCost] = useState(0);

  // If we have a painter ID, we could fetch their custom rates here
  useEffect(() => {
    if (painterId) {
      // In a real app, this would fetch the painter's custom rates from an API
      console.log(`Fetching rates for painter ${painterId}`);
      // Mock different rates for different painters
      if (painterId === "painter1") {
        setPaintRates({
          ...defaultPaintRates,
          labor: {
            basic: 2.0,
            standard: 3.0,
            premium: 4.5,
          },
        });
      }
    }
  }, [painterId]);

  // Calculate room costs whenever rooms or rates change
  useEffect(() => {
    const updatedRooms = rooms.map((room) => {
      // Calculate wall area: perimeter × height
      const perimeter = 2 * (room.walls.width + room.walls.width);
      const wallArea = perimeter * room.walls.height;
      
      // Calculate ceiling area: width × width
      const ceilingArea = room.walls.width * room.walls.width;
      
      // Get base rates based on paint quality
      const laborRatePerSqFt = paintRates.labor[room.paintQuality];
      const materialRatePerSqFt = paintRates.materialPerSqFt[room.paintQuality];
      
      // Calculate wall cost
      let roomCost = wallArea * (laborRatePerSqFt + materialRatePerSqFt) * room.coats;
      
      // Add ceiling cost if applicable
      if (room.ceiling) {
        roomCost += ceilingArea * (laborRatePerSqFt + materialRatePerSqFt) * paintRates.ceilingFactor * room.coats;
      }
      
      // Add trim cost if applicable
      if (room.trim) {
        roomCost += wallArea * paintRates.trimCost;
      }
      
      // Add door and window costs
      roomCost += room.doors * paintRates.doorCost;
      roomCost += room.windows * paintRates.windowCost;
      
      // Apply complexity factor
      roomCost *= 1 + ((room.complexity - 1) * paintRates.complexityFactor);
      
      return {
        ...room,
        walls: {
          ...room.walls,
          area: wallArea,
        },
        ceilingArea,
        roomCost: Math.round(roomCost),
      };
    });
    
    setRooms(updatedRooms);
    const newTotalCost = updatedRooms.reduce((sum, room) => sum + room.roomCost, 0);
    setTotalCost(newTotalCost);
    onCalculate(newTotalCost, updatedRooms);
  }, [rooms, paintRates, onCalculate]);

  const addRoom = () => {
    const newRoomId = `room${rooms.length + 1}`;
    setRooms([
      ...rooms,
      {
        id: newRoomId,
        name: `Room ${rooms.length + 1}`,
        walls: {
          width: 12,
          height: 9,
          area: 0,
        },
        ceiling: true,
        ceilingArea: 0,
        trim: true,
        doors: 1,
        windows: 1,
        complexity: 1,
        paintQuality: "standard",
        coats: 2,
        roomCost: 0,
      },
    ]);
  };

  const removeRoom = (id: string) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((room) => room.id !== id));
    }
  };

  const updateRoom = (id: string, updates: Partial<RoomDetail>) => {
    setRooms(
      rooms.map((room) => (room.id === id ? { ...room, ...updates } : room))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        {rooms.map((room) => (
          <Card key={room.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <Input
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                    className="text-lg font-medium px-0 border-0 max-w-64 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Room Name"
                  />
                  <CardDescription>
                    Estimated Cost: ${room.roomCost.toLocaleString()}
                  </CardDescription>
                </div>
                {rooms.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRoom(room.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${room.id}-width`}>Room Width (feet)</Label>
                  <Input
                    id={`${room.id}-width`}
                    type="number"
                    min="1"
                    value={room.walls.width}
                    onChange={(e) =>
                      updateRoom(room.id, {
                        walls: { ...room.walls, width: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${room.id}-height`}>Ceiling Height (feet)</Label>
                  <Input
                    id={`${room.id}-height`}
                    type="number"
                    min="1"
                    value={room.walls.height}
                    onChange={(e) =>
                      updateRoom(room.id, {
                        walls: { ...room.walls, height: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${room.id}-doors`}>Number of Doors</Label>
                  <Input
                    id={`${room.id}-doors`}
                    type="number"
                    min="0"
                    value={room.doors}
                    onChange={(e) =>
                      updateRoom(room.id, { doors: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${room.id}-windows`}>Number of Windows</Label>
                  <Input
                    id={`${room.id}-windows`}
                    type="number"
                    min="0"
                    value={room.windows}
                    onChange={(e) =>
                      updateRoom(room.id, { windows: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${room.id}-ceiling`}
                    checked={room.ceiling}
                    onCheckedChange={(checked) =>
                      updateRoom(room.id, { ceiling: checked === true })
                    }
                  />
                  <Label htmlFor={`${room.id}-ceiling`}>Paint Ceiling</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${room.id}-trim`}
                    checked={room.trim}
                    onCheckedChange={(checked) =>
                      updateRoom(room.id, { trim: checked === true })
                    }
                  />
                  <Label htmlFor={`${room.id}-trim`}>Paint Trim</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor={`${room.id}-complexity`}>Room Complexity</Label>
                  <span className="text-sm text-muted-foreground">
                    Level {room.complexity}
                  </span>
                </div>
                <Slider
                  id={`${room.id}-complexity`}
                  min={1}
                  max={5}
                  step={1}
                  value={[room.complexity]}
                  onValueChange={(value) =>
                    updateRoom(room.id, { complexity: value[0] })
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Simple</span>
                  <span>Complex</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${room.id}-quality`}>Paint Quality</Label>
                <Select
                  value={room.paintQuality}
                  onValueChange={(value: "basic" | "standard" | "premium") =>
                    updateRoom(room.id, { paintQuality: value })
                  }
                >
                  <SelectTrigger id={`${room.id}-quality`}>
                    <SelectValue placeholder="Select paint quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${room.id}-coats`}>Number of Coats</Label>
                <Select
                  value={room.coats.toString()}
                  onValueChange={(value) =>
                    updateRoom(room.id, { coats: parseInt(value) })
                  }
                >
                  <SelectTrigger id={`${room.id}-coats`}>
                    <SelectValue placeholder="Select number of coats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Coat</SelectItem>
                    <SelectItem value="2">2 Coats</SelectItem>
                    <SelectItem value="3">3 Coats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addRoom} className="w-full gap-2">
        <PaintBucket className="h-4 w-4" />
        Add Another Room
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Estimate Summary</CardTitle>
          <CardDescription>Based on the details you provided</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.id} className="flex justify-between">
                <span>{room.name}</span>
                <span>${room.roomCost.toLocaleString()}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-medium text-lg">
              <span>Total Estimate</span>
              <span>${totalCost.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 items-start text-sm text-muted-foreground">
          <p>This is a preliminary estimate based on the information provided.</p>
          <p>Final costs may vary based on site conditions and specific requirements.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoomCalculator;
