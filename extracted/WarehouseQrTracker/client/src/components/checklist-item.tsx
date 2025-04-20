import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ChecklistItemProps {
  id: string;
  name: string;
  quantity: number;
  minimumQuantity: number;
  isChecked: boolean;
  onQuantityChange: (id: string, quantity: number) => void;
  onCheckChange: (id: string, checked: boolean) => void;
}

export function ChecklistItem({
  id,
  name,
  quantity,
  minimumQuantity,
  isChecked,
  onQuantityChange,
  onCheckChange,
}: ChecklistItemProps) {
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  
  const handleQuantityChange = (value: string) => {
    const newValue = parseInt(value, 10) || 0;
    setCurrentQuantity(newValue);
    onQuantityChange(id, newValue);
  };
  
  return (
    <li className="flex items-start">
      <div className="flex items-center h-6 mt-0.5">
        <Checkbox
          id={`item-${id}`}
          checked={isChecked}
          onCheckedChange={(checked) => onCheckChange(id, checked as boolean)}
          className="text-primary-600"
        />
      </div>
      <div className="ml-3 flex-grow">
        <Label htmlFor={`item-${id}`} className="text-gray-700 font-medium">
          {name}
        </Label>
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            Quantità:{" "}
            <Input
              type="number"
              min="0"
              value={currentQuantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-12 h-6 text-center inline-block px-1"
              aria-label="Quantità attuale"
            />
          </span>
          <span>Quantità minima: {minimumQuantity}</span>
        </div>
      </div>
    </li>
  );
}
