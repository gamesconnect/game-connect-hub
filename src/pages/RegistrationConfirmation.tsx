import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  CheckCircle2, 
  Clock, 
  XCircle,
  Download,
  Share2,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export default function RegistrationConfirmation() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: registration, isLoading, error } = useQuery({
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
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Subscribe to realtime updates for this registration
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`registration-${id}`)
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
          const oldStatus = payload.old?.payment_status;
          
          if (newStatus !== oldStatus) {
            // Invalidate and refetch the query
            queryClient.invalidateQueries({ queryKey: ['registration', id] });
            
            if (newStatus === 'completed') {
              toast.success('Payment confirmed! Your registration is now complete.');
            } else if (newStatus === 'failed') {
              toast.error('Payment failed. Please try again or contact support.');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          label: 'Confirmed',
          color: 'bg-green-500/10 text-green-600 border-green-500/20',
          bgGradient: 'from-green-500/10 to-emerald-500/10',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending Payment',
          color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          bgGradient: 'from-yellow-500/10 to-orange-500/10',
        };
      default:
        return {
          icon: XCircle,
          label: 'Failed',
          color: 'bg-red-500/10 text-red-600 border-red-500/20',
          bgGradient: 'from-red-500/10 to-pink-500/10',
        };
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${registration?.events?.title}`,
          text: `My registration confirmation for ${registration?.events?.title}`,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Registration Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find this registration. It may have been removed or the link is incorrect.
            </p>
            <Button asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(registration.payment_status);
  const StatusIcon = statusConfig.icon;
  const event = registration.events;
  const qrData = JSON.stringify({
    registrationId: registration.id,
    eventId: registration.event_id,
    name: registration.full_name,
    quantity: registration.quantity,
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link 
            to="/events" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors print:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>

          {/* Main Ticket Card */}
          <Card className="overflow-hidden shadow-xl print:shadow-none">
            {/* Status Header */}
            <div className={`bg-gradient-to-r ${statusConfig.bgGradient} p-6 text-center border-b`}>
              <StatusIcon className={`w-16 h-16 mx-auto mb-3 ${registration.payment_status === 'completed' ? 'text-green-600' : registration.payment_status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`} />
              <h1 className="text-2xl font-bold mb-2">
                {registration.payment_status === 'completed' ? 'Registration Confirmed!' : 
                 registration.payment_status === 'pending' ? 'Payment Pending' : 'Payment Failed'}
              </h1>
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Event Info */}
              <div className="flex gap-4">
                {event?.image_url && (
                  <img 
                    src={event.image_url} 
                    alt={event.title} 
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-2">{event?.title}</h2>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {event?.date && format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                        {event?.time && ` at ${event.time}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
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
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{registration.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-sm">{registration.email}</p>
                    </div>
                  </div>
                  {registration.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{registration.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tickets</p>
                      <p className="font-medium">{registration.quantity} ticket(s)</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* QR Code */}
              <div className="flex flex-col items-center py-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Your Ticket QR Code
                </h3>
                <div className="bg-white p-4 rounded-xl shadow-inner">
                  <QRCodeSVG 
                    value={qrData} 
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Show this QR code at the event entrance
                </p>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="text-2xl font-bold text-primary">
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                <Button onClick={handlePrint} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Save / Print
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Pending Payment Notice */}
              {registration.payment_status === 'pending' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Your payment is being processed. Please check your phone for the payment prompt.
                    This page will update automatically once payment is confirmed.
                  </p>
                </div>
              )}
            </CardContent>

            {/* Footer */}
            <div className="bg-muted/30 px-6 py-4 text-center border-t">
              <p className="text-xs text-muted-foreground">
                Booking Reference: <code className="bg-muted px-2 py-1 rounded">{registration.id.slice(0, 8).toUpperCase()}</code>
              </p>
            </div>
          </Card>

          {/* Bookmark Reminder */}
          <p className="text-center text-sm text-muted-foreground mt-6 print:hidden">
            💡 Tip: Bookmark this page to access your ticket anytime
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
