import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/browserClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Footer } from '@/components/Footer';
import {
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Ticket,
  Clock,
  Share2,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentPending() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pollInterval, setPollInterval] = useState(2000);

  const { data: registration, isLoading } = useQuery({
    queryKey: ['registration', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          events (
            title,
            date,
            time,
            location,
            image_url,
            currency
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      // Redirect if payment is no longer pending
      if (data && data.payment_status === 'completed') {
        navigate(`/registration/${id}`);
        toast.success('Payment confirmed! Your registration is complete.');
      } else if (data && data.payment_status === 'failed') {
        navigate(`/registration/${id}`);
        toast.error('Payment failed. Please try again.');
      }

      return data;
    },
    enabled: !!id,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: true,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`registration-payment-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'registrations',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newStatus = payload.new.payment_status;

          if (newStatus === 'completed') {
            toast.success('Payment confirmed! Your registration is complete.');
            navigate(`/registration/${id}`);
          } else if (newStatus === 'failed') {
            toast.error('Payment failed. Please try again.');
            navigate(`/registration/${id}`);
          }

          queryClient.invalidateQueries({ queryKey: ['registration', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate, queryClient]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Confirmation',
          text: `My payment for ${registration?.events?.title}`,
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Registration not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const event = registration.events;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden shadow-xl">
            {/* Status Header */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 text-center border-b">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
                  <Clock className="w-10 h-10 text-white animate-pulse" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-foreground">Payment Pending</h1>
              <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                Pending Payment
              </Badge>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Event Info */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">{event?.title}</h2>
                <div className="flex gap-4">
                  {event?.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {event?.date && format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                        {event?.time && ` at ${event.time}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event?.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Attendee Info */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Attendee Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{registration.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-sm">{registration.email}</p>
                    </div>
                  </div>
                  {registration.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{registration.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tickets</p>
                      <p className="font-medium">{registration.quantity} ticket(s)</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="bg-orange-500/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {event?.currency || 'GHS'} {registration.total_amount.toFixed(2)}
                  </span>
                </div>
                {registration.stripe_payment_id && (
                  <p className="text-xs text-muted-foreground">
                    Transaction ID: {registration.stripe_payment_id}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Registered on: {format(new Date(registration.created_at), 'PPp')}
                </p>
              </div>

              {/* Share Button */}
              <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              {/* Processing Message */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium mb-2">
                  Your payment is being processed.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Please check your phone for the payment prompt. This page will update automatically once payment is confirmed.
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Booking Reference: <code className="bg-muted px-2 py-1 rounded">{registration.id.slice(0, 8).toUpperCase()}</code>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
