import React from "react";
import { ChecklistItem } from "./checklist-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ChecklistItemData {
  id: string;
  name: string;
  quantity: number;
  minimumQuantity: number;
  isChecked: boolean;
}

interface ChecklistSectionProps {
  title: string;
  items: ChecklistItemData[];
  onItemCheckChange: (id: string, checked: boolean) => void;
  onItemQuantityChange: (id: string, quantity: number) => void;
}

export function ChecklistSection({
  title,
  items,
  onItemCheckChange,
  onItemQuantityChange,
}: ChecklistSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 border-b pb-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              id={item.id}
              name={item.name}
              quantity={item.quantity}
              minimumQuantity={item.minimumQuantity}
              isChecked={item.isChecked}
              onCheckChange={onItemCheckChange}
              onQuantityChange={onItemQuantityChange}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
