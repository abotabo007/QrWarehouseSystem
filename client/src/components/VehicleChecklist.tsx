import { useState } from 'react';
import { ChecklistItemInfo } from '@shared/schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VehicleChecklistItemProps {
  item: ChecklistItemInfo;
  onChange: (updated: ChecklistItemInfo) => void;
}

function VehicleChecklistItem({ item, onChange }: VehicleChecklistItemProps) {
  const handleStatusChange = (value: string) => {
    onChange({
      ...item,
      status: value as 'present' | 'missing',
      // Reset takenFromCabinet if item is present
      takenFromCabinet: value === 'present' ? false : item.takenFromCabinet
    });
  };

  const handleCabinetChange = (checked: boolean) => {
    onChange({
      ...item,
      takenFromCabinet: checked
    });
  };

  return (
    <Card className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{item.name}</h4>
          <div className="mt-2 space-x-4">
            <RadioGroup
              value={item.status}
              onValueChange={handleStatusChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="present" id={`${item.name}-present`} />
                <Label htmlFor={`${item.name}-present`}>Presente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="missing" id={`${item.name}-missing`} />
                <Label htmlFor={`${item.name}-missing`}>Mancante</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <Badge variant={item.status === 'present' ? 'success' : 'destructive'}>
          {item.status === 'present' ? 'OK' : 'Mancante'}
        </Badge>
      </div>
      
      {item.status === 'missing' && (
        <div className="mt-3 pl-5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${item.name}-cabinet`}
              checked={item.takenFromCabinet}
              onCheckedChange={handleCabinetChange}
            />
            <Label htmlFor={`${item.name}-cabinet`} className="text-sm text-gray-700">
              Prelevato da armadietto
            </Label>
          </div>
        </div>
      )}
    </Card>
  );
}

interface OxygenLevelInputProps {
  value: number;
  onChange: (value: number) => void;
}

function OxygenLevelInput({ value, onChange }: OxygenLevelInputProps) {
  return (
    <Card className="border border-gray-300 rounded-lg p-4 bg-blue-50">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-lg text-blue-800">Livello Ossigeno</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center">
          <Label htmlFor="oxygen-level" className="block text-gray-700 mr-3">
            Percentuale:
          </Label>
          <Input
            id="oxygen-level"
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-2"
            required
          />
          <span className="ml-2">%</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface VehicleChecklistProps {
  vehicleCode: string;
  vehicleName: string;
  userName: string;
  defaultItems: ChecklistItemInfo[];
  onSubmit: (data: { 
    items: ChecklistItemInfo[], 
    oxygenLevel: number 
  }) => void;
}

export default function VehicleChecklist({
  vehicleCode,
  vehicleName,
  userName,
  defaultItems,
  onSubmit
}: VehicleChecklistProps) {
  const [items, setItems] = useState<ChecklistItemInfo[]>(defaultItems);
  const [oxygenLevel, setOxygenLevel] = useState<number>(100);

  const updateItem = (index: number, updatedItem: ChecklistItemInfo) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      items,
      oxygenLevel
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Checklist Veicolo</h1>
        <Badge className="bg-[#E32719]">{vehicleName}</Badge>
      </div>
      
      <p className="text-gray-600">
        Volontario: <span className="font-semibold">{userName}</span>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Oxygen level input */}
        <OxygenLevelInput value={oxygenLevel} onChange={setOxygenLevel} />
        
        {/* Checklist items */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Presidi</h3>
          
          {items.map((item, index) => (
            <VehicleChecklistItem
              key={`${item.name}-${index}`}
              item={item}
              onChange={(updated) => updateItem(index, updated)}
            />
          ))}
        </div>
        
        <div className="pt-4">
          <button 
            type="submit"
            className="w-full bg-[#E32719] hover:bg-[#C42015] text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center"
          >
            <i className="fas fa-check-circle mr-2"></i>
            Invia Checklist
          </button>
        </div>
      </form>
    </div>
  );
}
