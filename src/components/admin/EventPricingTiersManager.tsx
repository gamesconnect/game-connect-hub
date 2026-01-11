import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type PricingTier = Tables<'event_pricing_tiers'>;

interface TierFormData {
  name: string;
  price: number;
  description: string;
  spots: number | null;
  display_order: number;
}

const initialFormData: TierFormData = {
  name: '',
  price: 0,
  description: '',
  spots: null,
  display_order: 0,
};

interface EventPricingTiersManagerProps {
  eventId: string;
  eventTitle: string;
  onBack: () => void;
}

export function EventPricingTiersManager({ eventId, eventTitle, onBack }: EventPricingTiersManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [formData, setFormData] = useState<TierFormData>(initialFormData);

  const { data: tiers, isLoading } = useQuery({
    queryKey: ['event-pricing-tiers', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_pricing_tiers')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TierFormData) => {
      const { error } = await supabase.from('event_pricing_tiers').insert({
        ...data,
        event_id: eventId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-pricing-tiers', eventId] });
      toast({ title: 'Pricing tier created successfully' });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TierFormData> }) => {
      const { error } = await supabase.from('event_pricing_tiers').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-pricing-tiers', eventId] });
      toast({ title: 'Pricing tier updated successfully' });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('event_pricing_tiers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-pricing-tiers', eventId] });
      toast({ title: 'Pricing tier deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTier(null);
    setFormData(initialFormData);
  };

  const openEditDialog = (tier: PricingTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      price: tier.price,
      description: tier.description || '',
      spots: tier.spots,
      display_order: tier.display_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTier) {
      updateMutation.mutate({ id: editingTier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Pricing Tiers</h2>
            <p className="text-muted-foreground">{eventTitle}</p>
          </div>
        </div>
        <Button onClick={() => { setFormData(initialFormData); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Tier
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit Tier' : 'Create Tier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tier Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., VIP, Regular, Student"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's included in this tier?"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (GHS)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spots">Spots (leave empty for unlimited)</Label>
                <Input
                  id="spots"
                  type="number"
                  min="0"
                  value={formData.spots ?? ''}
                  onChange={(e) => setFormData({ ...formData, spots: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingTier ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : tiers && tiers.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Spots</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell className="font-medium">{tier.name}</TableCell>
                  <TableCell>GHS {tier.price}</TableCell>
                  <TableCell>{tier.spots ?? 'Unlimited'}</TableCell>
                  <TableCell>{tier.display_order}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(tier)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this pricing tier?')) {
                          deleteMutation.mutate(tier.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No pricing tiers yet. Add your first tier to get started.</p>
          <p className="text-sm mt-2">Events without tiers will use the default event price.</p>
        </div>
      )}
    </div>
  );
}
