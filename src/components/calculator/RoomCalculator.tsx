import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  PaintBucket, 
  Trash2, 
  TicketPercent, 
  Sofa, 
  Home, 
  Plus,
  Trees,
  Shrub,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface RoomCalculatorProps {
  onCalculate: (totalCost: number, details: RoomDetail[] | ExteriorDetail[]) => void;
  painterId?: string;
  calculatorType: "interior" | "exterior";
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
  roomCost: number;
  vaultedCeiling: boolean;
  moveFurniture: boolean;
}

export interface ExteriorDetail {
  id: string;
  name: string;
  area: number;
  stories: number;
  siding: string;
  trim: boolean;
  windows: number;
  doors: number;
  features: {
    deckPorch: boolean;
    deckArea: number;
  };
  complexity: number;
  cost: number;
}

interface PaintRate {
  laborPerSqFt: number;
  doorCost: number;
  windowCost: number;
  ceilingCost: number;
  complexityFactor: number;
  furnitureMovingCost: number;
}

interface ExteriorRate {
  base: {
    vinyl: number;
    wood: number;
    brick: number;
    stucco: number;
    metal: number;
  };
  trim: number;
  doorCost: number;
  windowCost: number;
  multistoryFactor: number;
  deckCostPerSqFt: number;
  complexityFactor: number;
}

const defaultPaintRates: PaintRate = {
  laborPerSqFt: 4.50, // Base rate includes trim
  doorCost: 50,
  windowCost: 35,
  ceilingCost: 1.00, // $1.00 per sq ft for ceiling
  complexityFactor: 0.25, // 25% increase per complexity level
  furnitureMovingCost: 125, // $125 per room for moving furniture
};

const defaultExteriorRates: ExteriorRate = {
  base: {
    vinyl: 3.00,
    wood: 4.50,
    brick: 3.50,
    stucco: 4.00,
    metal: 3.50,
  },
  trim: 0.25, // Additional per sq ft (changed from 1.50 to 0.25)
  doorCost: 40, // Changed from 75 to 40
  windowCost: 20, // Changed from 45 to 20
  multistoryFactor: 0.30, // 30% increase per additional story
  deckCostPerSqFt: 3.00, // Changed from fixed cost to per sq ft
  complexityFactor: 0.25, // 25% increase per complexity level
};

const initialRooms: RoomDetail[] = [
  {
    id: "room1",
    name: "Living Room",
    walls: {
      width: 12,
      height: 9,
      area: 0,
    },
    ceiling: true,
    ceilingArea: 0,
    trim: true,
    doors: 2,
    windows: 3,
    complexity: 1,
    roomCost: 0,
    vaultedCeiling: false,
    moveFurniture: false,
  },
];

const initialExterior: ExteriorDetail[] = [
  {
    id: "exterior1",
    name: "House Exterior",
    area: 2000,
    stories: 1,
    siding: "vinyl",
    trim: true,
    windows: 10,
    doors: 2,
    features: {
      deckPorch: false,
      deckArea: 0
    },
    complexity: 1,
    cost: 0,
  },
];

const RoomCalculator: React.FC<RoomCalculatorProps> = ({ onCalculate, painterId, calculatorType }) => {
  const [rooms, setRooms] = useState<RoomDetail[]>(initialRooms);
  const [exteriors, setExteriors] = useState<ExteriorDetail[]>(initialExterior);
  const [paintRates] = useState<PaintRate>(defaultPaintRates);
  const [exteriorRates] = useState<ExteriorRate>(defaultExteriorRates);
  const [totalCost, setTotalCost] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<Array<{ id: string; discount: number; applied: boolean }>>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; discount: number; applied: boolean } | null>(null);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (calculatorType === "interior") {
      const updatedRooms = rooms.map((room) => {
        const floorArea = room.walls.width * room.walls.width; // Using width for both dimensions
        
        let roomCost = floorArea * paintRates.laborPerSqFt;
        
        if (room.vaultedCeiling) {
          roomCost *= 2;
        }
        
        if (room.ceiling) {
          roomCost += floorArea * paintRates.ceilingCost;
        }
        
        roomCost += room.doors * paintRates.doorCost;
        roomCost += room.windows * paintRates.windowCost;
        
        if (room.moveFurniture) {
          roomCost += paintRates.furnitureMovingCost;
        }
        
        roomCost *= 1 + ((room.complexity - 1) * paintRates.complexityFactor);
        
        return {
          ...room,
          walls: {
            ...room.walls,
            area: floorArea,
          },
          ceilingArea: floorArea,
          roomCost: Math.round(roomCost),
        };
      });
      
      setRooms(updatedRooms);
      const newTotalCost = updatedRooms.reduce((sum, room) => sum + room.roomCost, 0);
      setTotalCost(newTotalCost);
      
      if (appliedCoupon) {
        const discount = newTotalCost * appliedCoupon.discount;
        setDiscountedTotal(Math.round(newTotalCost - discount));
      } else {
        setDiscountedTotal(newTotalCost);
      }
      
      onCalculate(appliedCoupon ? discountedTotal : newTotalCost, updatedRooms);
    } else {
      const updatedExteriors = exteriors.map((exterior) => {
        const baseCostPerSqFt = exteriorRates.base[exterior.siding as keyof typeof exteriorRates.base];
        
        let exteriorCost = exterior.area * baseCostPerSqFt;
        
        if (exterior.trim) {
          exteriorCost += exterior.area * 0.2 * exteriorRates.trim;
        }
        
        exteriorCost += exterior.windows * exteriorRates.windowCost;
        exteriorCost += exterior.doors * exteriorRates.doorCost;
        
        if (exterior.stories > 1) {
          exteriorCost *= 1 + ((exterior.stories - 1) * exteriorRates.multistoryFactor);
        }
        
        if (exterior.features.deckPorch && exterior.features.deckArea > 0) {
          exteriorCost += exterior.features.deckArea * exteriorRates.deckCostPerSqFt;
        }
        
        exteriorCost *= 1 + ((exterior.complexity - 1) * exteriorRates.complexityFactor);
        
        return {
          ...exterior,
          cost: Math.round(exteriorCost),
        };
      });
      
      setExteriors(updatedExteriors);
      const newTotalCost = updatedExteriors.reduce((sum, exterior) => sum + exterior.cost, 0);
      setTotalCost(newTotalCost);
      
      if (appliedCoupon) {
        const discount = newTotalCost * appliedCoupon.discount;
        setDiscountedTotal(Math.round(newTotalCost - discount));
      } else {
        setDiscountedTotal(newTotalCost);
      }
      
      onCalculate(appliedCoupon ? discountedTotal : newTotalCost, updatedExteriors);
    }
  }, [rooms, paintRates, exteriors, exteriorRates, calculatorType, appliedCoupon, onCalculate]);

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
        roomCost: 0,
        vaultedCeiling: false,
        moveFurniture: false,
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

  const applyCoupon = () => {
    const coupon = availableCoupons.find(c => c.id === couponCode);
    
    if (!coupon) {
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is not valid.",
        variant: "destructive",
      });
      return;
    }

    if (coupon.applied) {
      toast({
        title: "Coupon Already Used",
        description: "This coupon has already been applied to another estimate.",
        variant: "destructive",
      });
      return;
    }

    setAppliedCoupon(coupon);
    
    setAvailableCoupons(
      availableCoupons.map(c => 
        c.id === coupon.id ? { ...c, applied: true } : c
      )
    );

    const discount = totalCost * coupon.discount;
    setDiscountedTotal(Math.round(totalCost - discount));
    
    toast({
      title: "Coupon Applied!",
      description: `${Math.round(coupon.discount * 100)}% discount applied to your estimate.`,
    });
    
    setCouponCode("");
  };

  const removeCoupon = () => {
    if (appliedCoupon) {
      setAvailableCoupons(
        availableCoupons.map(c => 
          c.id === appliedCoupon.id ? { ...c, applied: false } : c
        )
      );
      
      setAppliedCoupon(null);
      setDiscountedTotal(totalCost);
      
      toast({
        title: "Coupon Removed",
        description: "The discount has been removed from your estimate.",
      });
    }
  };

  const renderInteriorCalculator = () => (
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
                  <Label htmlFor={`${room.id}-ceiling`}>Paint Ceiling (+$1.00/sq ft)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${room.id}-vaulted`}
                    checked={room.vaultedCeiling}
                    onCheckedChange={(checked) =>
                      updateRoom(room.id, { vaultedCeiling: checked === true })
                    }
                  />
                  <Label htmlFor={`${room.id}-vaulted`}>Vaulted Ceiling (2x cost)</Label>
                </div>
              </div>
              
              <div className="border border-dashed border-muted-foreground/30 p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${room.id}-furniture`}
                    checked={room.moveFurniture}
                    onCheckedChange={(checked) =>
                      updateRoom(room.id, { moveFurniture: checked === true })
                    }
                  />
                  <div className="flex flex-col">
                    <Label htmlFor={`${room.id}-furniture`} className="flex items-center gap-2">
                      <Sofa className="h-4 w-4" />
                      Move Furniture (+$125)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      We'll move furniture to the center of the room for painting
                    </span>
                  </div>
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
            
            {renderCouponSection()}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 items-start text-sm text-muted-foreground">
          <p>This is a preliminary estimate based on the information provided.</p>
          <p>Final costs may vary based on site conditions and specific requirements.</p>
          {painterId && (
            <p>Labor rate: ${paintRates.laborPerSqFt.toFixed(2)} per square foot (trim included). Ceiling: +${paintRates.ceilingCost.toFixed(2)} per square foot. Furniture moving: +$125 per room.</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );

  const addExterior = () => {
    const newExteriorId = `exterior${exteriors.length + 1}`;
    setExteriors([
      ...exteriors,
      {
        id: newExteriorId,
        name: `Exterior Area ${exteriors.length + 1}`,
        area: 500,
        stories: 1,
        siding: "vinyl",
        trim: true,
        windows: 4,
        doors: 1,
        features: {
          deckPorch: false,
          deckArea: 0
        },
        complexity: 1,
        cost: 0,
      },
    ]);
  };

  const removeExterior = (id: string) => {
    if (exteriors.length > 1) {
      setExteriors(exteriors.filter((exterior) => exterior.id !== id));
    }
  };

  const updateExterior = (id: string, updates: Partial<ExteriorDetail>) => {
    setExteriors(
      exteriors.map((exterior) => (exterior.id === id ? { ...exterior, ...updates } : exterior))
    );
  };

  const renderCouponSection = () => {
    if (!painterId) return null;
    
    return (
      <>
        <Separator className="my-4" />
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="coupon-code">Have a Coupon Code?</Label>
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1"
                disabled={!!appliedCoupon}
              />
              {!appliedCoupon ? (
                <Button 
                  onClick={applyCoupon} 
                  disabled={!couponCode}
                  className="gap-2"
                >
                  <TicketPercent className="h-4 w-4" />
                  Apply
                </Button>
              ) : (
                <Button 
                  onClick={removeCoupon} 
                  variant="outline"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
          
          {appliedCoupon && (
            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TicketPercent className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {Math.round(appliedCoupon.discount * 100)}% Discount Applied
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Code: {appliedCoupon.id}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Original Total:</span>
                  <span>${totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Discount:</span>
                  <span>-${Math.round(totalCost * appliedCoupon.discount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          {appliedCoupon && (
            <div className="flex justify-between font-medium text-lg text-primary">
              <span>Discounted Total</span>
              <span>${discountedTotal.toLocaleString()}</span>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderExteriorCalculator = () => (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        {exteriors.map((exterior) => (
          <Card key={exterior.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <Input
                    value={exterior.name}
                    onChange={(e) => updateExterior(exterior.id, { name: e.target.value })}
                    className="text-lg font-medium px-0 border-0 max-w-64 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Exterior Area Name"
                  />
                  <CardDescription>
                    Estimated Cost: ${exterior.cost.toLocaleString()}
                  </CardDescription>
                </div>
                {exteriors.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExterior(exterior.id)}
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
                  <Label htmlFor={`${exterior.id}-area`}>Total Surface Area (sq ft)</Label>
                  <Input
                    id={`${exterior.id}-area`}
                    type="number"
                    min="100"
                    value={exterior.area}
                    onChange={(e) =>
                      updateExterior(exterior.id, { area: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${exterior.id}-stories`}>Number of Stories</Label>
                  <Select 
                    value={exterior.stories.toString()} 
                    onValueChange={(value) => updateExterior(exterior.id, { stories: Number(value) })}
                  >
                    <SelectTrigger id={`${exterior.id}-stories`}>
                      <SelectValue placeholder="Select stories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Story</SelectItem>
                      <SelectItem value="2">2 Stories</SelectItem>
                      <SelectItem value="3">3 Stories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${exterior.id}-siding`}>Siding Type</Label>
                <Select 
                  value={exterior.siding} 
                  onValueChange={(value) => updateExterior(exterior.id, { siding: value })}
                >
                  <SelectTrigger id={`${exterior.id}-siding`}>
                    <SelectValue placeholder="Select siding type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vinyl">Vinyl</SelectItem>
                    <SelectItem value="wood">Wood</SelectItem>
                    <SelectItem value="brick">Brick</SelectItem>
                    <SelectItem value="stucco">Stucco</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${exterior.id}-doors`}>Number of Doors</Label>
                  <Input
                    id={`${exterior.id}-doors`}
                    type="number"
                    min="0"
                    value={exterior.doors}
                    onChange={(e) =>
                      updateExterior(exterior.id, { doors: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${exterior.id}-windows`}>Number of Windows</Label>
                  <Input
                    id={`${exterior.id}-windows`}
                    type="number"
                    min="0"
                    value={exterior.windows}
                    onChange={(e) =>
                      updateExterior(exterior.id, { windows: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${exterior.id}-trim`}
                  checked={exterior.trim}
                  onCheckedChange={(checked) =>
                    updateExterior(exterior.id, { trim: checked === true })
                  }
                />
                <Label htmlFor={`${exterior.id}-trim`}>Include Trim Painting</Label>
              </div>

              <div className="border border-dashed border-muted-foreground/30 p-3 rounded-md">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Deck/Porch
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${exterior.id}-deck`}
                      checked={exterior.features.deckPorch}
                      onCheckedChange={(checked) =>
                        updateExterior(exterior.id, { 
                          features: { ...exterior.features, deckPorch: checked === true }
                        })
                      }
                    />
                    <Label htmlFor={`${exterior.id}-deck`}>Include Deck/Porch</Label>
                  </div>
                  {exterior.features.deckPorch && (
                    <div className="space-y-2 pl-6">
                      <Label htmlFor={`${exterior.id}-deck-area`}>Deck Area (sq ft)</Label>
                      <Input
                        id={`${exterior.id}-deck-area`}
                        type="number"
                        min="0"
                        value={exterior.features.deckArea}
                        onChange={(e) =>
                          updateExterior(exterior.id, { 
                            features: { ...exterior.features, deckArea: Number(e.target.value) }
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor={`${exterior.id}-complexity`}>Property Complexity</Label>
                  <span className="text-sm text-muted-foreground">
                    Level {exterior.complexity}
                  </span>
                </div>
                <Slider
                  id={`${exterior.id}-complexity`}
                  min={1}
                  max={5}
                  step={1}
                  value={[exterior.complexity]}
                  onValueChange={(value) =>
                    updateExterior(exterior.id, { complexity: value[0] })
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Simple</span>
                  <span>Complex</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addExterior} className="w-full gap-2">
        <Building className="h-4 w-4" />
        Add Another Exterior Area
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Estimate Summary</CardTitle>
          <CardDescription>Based on the details you provided</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exteriors.map((exterior) => (
              <div key={exterior.id} className="flex justify-between">
                <span>{exterior.name}</span>
                <span>${exterior.cost.toLocaleString()}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-medium text-lg">
              <span>Total Estimate</span>
              <span>${totalCost.toLocaleString()}</span>
            </div>
            
            {renderCouponSection()}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 items-start text-sm text-muted-foreground">
          <p>This is a preliminary estimate based on the information provided.</p>
          <p>Final costs may vary based on site conditions and specific requirements.</p>
          {painterId && (
            <p>Base rates vary by siding type. Additional costs for multi-story buildings, trim, doors ($40 each), windows ($20 each), and decks ($3.00 per sq ft).</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );

  return (
    <>
      {calculatorType === "interior" ? renderInteriorCalculator() : renderExteriorCalculator()}
    </>
  );
};

export default RoomCalculator;
