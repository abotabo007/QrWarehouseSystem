import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Trash } from 'lucide-react';
import { INVENTORY_STATUS_OPTIONS } from '@/lib/constants';
import { InventoryItem as InventoryItemType } from '@shared/schema';

interface InventoryItemProps {
  item: InventoryItemType;
  onEdit: (updatedItem: InventoryItemType) => void;
  onDelete: (id: number) => void;
}

export default function InventoryItem({ item, onEdit, onDelete }: InventoryItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedItem, setEditedItem] = useState<InventoryItemType>(item);

  const handleSave = () => {
    onEdit(editedItem);
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    onDelete(item.id);
    setIsDeleteDialogOpen(false);
  };

  // Badge color based on status
  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Disponibile':
        return 'bg-green-100 text-green-800';
      case 'Bassa Scorta':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Scadenza':
        return 'bg-red-100 text-red-800';
      case 'Esaurito':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">{item.name}</td>
      <td className="py-3 px-4">{item.quantity}</td>
      <td className="py-3 px-4">{item.expiryDate || 'N/A'}</td>
      <td className="py-3 px-4">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getBadgeClass(item.status)}`}>
          {item.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditDialogOpen(true)}
          className="text-blue-500 hover:text-blue-700 mr-2"
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash size={16} />
        </Button>
      </td>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Articolo</DialogTitle>
            <DialogDescription>
              Modifica le informazioni dell'articolo di magazzino.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={editedItem.name}
                onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantità
              </Label>
              <Input
                id="quantity"
                type="number"
                value={editedItem.quantity}
                onChange={(e) => setEditedItem({ ...editedItem, quantity: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry" className="text-right">
                Scadenza
              </Label>
              <Input
                id="expiry"
                value={editedItem.expiryDate || ''}
                onChange={(e) => setEditedItem({ ...editedItem, expiryDate: e.target.value })}
                className="col-span-3"
                placeholder="MM/YYYY"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Stato
              </Label>
              <Select
                value={editedItem.status}
                onValueChange={(value) => setEditedItem({ ...editedItem, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma Eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare l'articolo "{item.name}"? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </tr>
  );
}
