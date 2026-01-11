import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, User, Mail, Minus, Plus } from 'lucide-react';
import { z } from 'zod';
import { Tables } from '@/integrations/supabase/types';

type PricingTier = Tables<'event_pricing_tiers'>;

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().min(9, 'Phone number is required').max(15),
  network: z.enum(['mtn', 'airteltigo', 'telecel'], { required_error: 'Please select a network' }),
});

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function EventRegistrationModal({ isOpen, onClose, eventId }: EventRegistrationModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    network: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!eventId,
  });

  // Fetch pricing tiers
  const { data: pricingTiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['event-pricing-tiers', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_pricing_tiers')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as PricingTier[];
    },
    enabled: isOpen && !!eventId,
  });

  const isLoading = eventLoading || tiersLoading;
  const hasTiers = pricingTiers && pricingTiers.length > 0;
  
  // Get selected tier or use default event price
  const selectedTier = hasTiers && selectedTierId 
    ? pricingTiers.find(t => t.id === selectedTierId) 
    : null;
  
  const unitPrice = selectedTier ? selectedTier.price : (event?.price || 0);
  const totalAmount = unitPrice * quantity;
  const maxSpots = selectedTier?.spots ?? event?.spots ?? 10;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate tier selection if tiers exist
    if (hasTiers && !selectedTierId) {
      toast({
        title: 'Please select a ticket type',
        variant: 'destructive',
      });
      return;
    }

    // Validate form
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          eventId,
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          quantity,
          network: formData.network,
          totalAmount,
          tierId: selectedTierId,
          tierName: selectedTier?.name,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Registration Successful!',
          description: 'Your payment has been processed. Check your phone for confirmation.',
        });
        onClose();
        setFormData({ fullName: '', email: '', phone: '', network: '' });
        setQuantity(1);
        setSelectedTierId(null);
      } else {
        toast({
          title: 'Payment Initiated',
          description: data.message || 'Please approve the payment on your phone.',
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Get Tickets</DialogTitle>
        </DialogHeader>

        {event && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-foreground">{event.title}</h3>
            <p className="text-sm text-muted-foreground">{event.date} • {event.location}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pricing Tiers Selection */}
          {hasTiers && (
            <div className="space-y-3">
              <Label>Select Ticket Type</Label>
              <RadioGroup value={selectedTierId || ''} onValueChange={setSelectedTierId}>
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTierId === tier.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTierId(tier.id)}
                  >
                    <RadioGroupItem value={tier.id} id={tier.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <Label htmlFor={tier.id} className="font-semibold cursor-pointer">
                          {tier.name}
                        </Label>
                        <span className="font-bold text-primary">
                          {event?.currency} {tier.price.toFixed(2)}
                        </span>
                      </div>
                      {tier.description && (
                        <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                      )}
                      {tier.spots !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {tier.spots > 0 ? `${tier.spots} spots left` : 'Sold out'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Default price display when no tiers */}
          {!hasTiers && event && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold text-primary">
                {event.currency} {event.price.toFixed(2)} per ticket
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Mobile Money)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="0599975352"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="network">Mobile Money Network</Label>
            <Select
              value={formData.network}
              onValueChange={(value) => handleInputChange('network', value)}
            >
              <SelectTrigger className={errors.network ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select your network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
                <SelectItem value="telecel">Telecel Cash</SelectItem>
              </SelectContent>
            </Select>
            {errors.network && <p className="text-sm text-destructive">{errors.network}</p>}
          </div>

          <div className="space-y-2">
            <Label>Number of Tickets</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(maxSpots, quantity + 1))}
                disabled={quantity >= maxSpots}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">
                {event?.currency} {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            disabled={isSubmitting || (hasTiers && !selectedTierId)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${event?.currency} ${totalAmount.toFixed(2)}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
