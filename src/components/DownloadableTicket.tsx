import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Download, Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TicketData {
  registrationId: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventLocation: string;
  attendeeName: string;
  ticketNumber: number;
  totalTickets: number;
  currency: string;
  eventImageUrl?: string;
}

interface DownloadableTicketProps {
  ticket: TicketData;
}

export function DownloadableTicket({ ticket }: DownloadableTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  
  // Generate unique ticket code combining registration ID and ticket number
  const ticketCode = `${ticket.registrationId.slice(0, 8).toUpperCase()}-${String(ticket.ticketNumber).padStart(3, '0')}`;
  
  const qrData = JSON.stringify({
    registrationId: ticket.registrationId,
    ticketCode: ticketCode,
    ticketNumber: ticket.ticketNumber,
    attendee: ticket.attendeeName,
  });

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    try {
      const dataUrl = await toPng(ticketRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = `ticket-${ticketCode}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Failed to download ticket:', error);
      toast.error('Failed to download ticket. Please try again.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Ticket Design */}
      <div
        ref={ticketRef}
        className="relative bg-white rounded-xl overflow-hidden shadow-lg border-2 border-dashed border-primary/30"
        style={{ width: '400px', maxWidth: '100%' }}
      >
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              <span className="font-semibold text-sm">EVENT TICKET</span>
            </div>
            <span className="text-xs opacity-90">
              {ticket.ticketNumber} of {ticket.totalTickets}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Event Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
            {ticket.eventTitle}
          </h3>

          {/* Event Details */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                {format(new Date(ticket.eventDate), 'EEEE, MMMM d, yyyy')}
                {ticket.eventTime && ` • ${ticket.eventTime}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{ticket.eventLocation}</span>
            </div>
          </div>

          {/* Attendee Name */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Attendee</p>
            <p className="font-semibold text-gray-900">{ticket.attendeeName}</p>
          </div>

          {/* QR Code and Ticket Code */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ticket Code</p>
              <p className="font-mono font-bold text-lg text-primary">{ticketCode}</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm border">
              <QRCodeSVG
                value={qrData}
                size={80}
                level="H"
              />
            </div>
          </div>
        </div>

        {/* Ticket Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-dashed border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Present this ticket at the event entrance for check-in
          </p>
        </div>

        {/* Decorative Punch Holes */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-background rounded-full" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-background rounded-full" />
      </div>

      {/* Download Button */}
      <Button 
        onClick={handleDownload} 
        variant="outline" 
        size="sm" 
        className="w-full print:hidden"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Ticket {ticket.ticketNumber}
      </Button>
    </div>
  );
}

interface DownloadableTicketsListProps {
  registrationId: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventLocation: string;
  attendeeName: string;
  quantity: number;
  currency: string;
  eventImageUrl?: string;
}

export function DownloadableTicketsList({
  registrationId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  attendeeName,
  quantity,
  currency,
  eventImageUrl,
}: DownloadableTicketsListProps) {
  const tickets = Array.from({ length: quantity }, (_, index) => ({
    registrationId,
    eventTitle,
    eventDate,
    eventTime,
    eventLocation,
    attendeeName,
    ticketNumber: index + 1,
    totalTickets: quantity,
    currency,
    eventImageUrl,
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">
        Your Tickets ({quantity})
      </h3>
      <div className="flex flex-wrap justify-center gap-6">
        {tickets.map((ticket) => (
          <DownloadableTicket key={ticket.ticketNumber} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
