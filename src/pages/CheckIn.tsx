import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  XCircle, 
  User, 
  Ticket,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface QRData {
  registrationId: string;
  eventId: string;
  name: string;
  quantity: number;
}

interface RegistrationData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  quantity: number;
  total_amount: number;
  payment_status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  events: {
    title: string;
    date: string;
    time: string | null;
    location: string;
    currency: string;
  } | null;
}

export default function CheckIn() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<RegistrationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setScanError(null);
    setScannedData(null);
    
    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await handleScan(decodedText);
          stopScanner();
        },
        () => {} // Ignore scan failures
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      setScanError('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScan = async (data: string) => {
    setIsProcessing(true);
    setScanError(null);

    try {
      const parsed: QRData = JSON.parse(data);
      
      if (!parsed.registrationId) {
        throw new Error('Invalid QR code');
      }

      // Fetch registration details
      const { data: registration, error } = await supabase
        .from('registrations')
        .select(`
          *,
          events (
            title,
            date,
            time,
            location,
            currency
          )
        `)
        .eq('id', parsed.registrationId)
        .single();

      if (error || !registration) {
        throw new Error('Registration not found');
      }

      setScannedData(registration as RegistrationData);
    } catch (err) {
      console.error('Scan error:', err);
      setScanError(err instanceof Error ? err.message : 'Invalid QR code');
      toast.error('Invalid or unrecognized QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scannedData) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', scannedData.id);

      if (error) throw error;

      setScannedData({
        ...scannedData,
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      });

      toast.success(`${scannedData.full_name} checked in successfully!`);
    } catch (err) {
      console.error('Check-in error:', err);
      toast.error('Failed to check in. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setScanError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You need admin privileges to access the check-in scanner.
            </p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <Link 
          to="/admin" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Link>

        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="text-center border-b bg-primary/5">
            <CardTitle className="flex items-center justify-center gap-2">
              <Camera className="w-6 h-6" />
              Event Check-In Scanner
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Scanner Area */}
            {!scannedData && (
              <div className="space-y-4">
                <div 
                  id={scannerContainerId} 
                  className={`w-full aspect-square rounded-lg overflow-hidden bg-muted ${
                    isScanning ? '' : 'flex items-center justify-center'
                  }`}
                >
                  {!isScanning && (
                    <div className="text-center text-muted-foreground">
                      <CameraOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Camera not active</p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={isScanning ? stopScanner : startScanner}
                  className="w-full"
                  variant={isScanning ? 'destructive' : 'default'}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isScanning ? (
                    <>
                      <CameraOff className="w-4 h-4 mr-2" />
                      Stop Scanner
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Start Scanner
                    </>
                  )}
                </Button>

                {scanError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                    <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-destructive">{scanError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Scanned Result */}
            {scannedData && (
              <div className="space-y-4">
                {/* Status Banner */}
                <div className={`rounded-lg p-4 text-center ${
                  scannedData.checked_in 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : scannedData.payment_status === 'completed'
                    ? 'bg-blue-500/10 border border-blue-500/20'
                    : 'bg-yellow-500/10 border border-yellow-500/20'
                }`}>
                  {scannedData.checked_in ? (
                    <>
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <h3 className="font-bold text-green-700 dark:text-green-400">Already Checked In</h3>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        {scannedData.checked_in_at && format(new Date(scannedData.checked_in_at), 'PPp')}
                      </p>
                    </>
                  ) : scannedData.payment_status === 'completed' ? (
                    <>
                      <Ticket className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-bold text-blue-700 dark:text-blue-400">Valid Ticket</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-500">Ready to check in</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                      <h3 className="font-bold text-yellow-700 dark:text-yellow-400">Payment {scannedData.payment_status}</h3>
                      <p className="text-sm text-yellow-600 dark:text-yellow-500">Cannot check in until payment is confirmed</p>
                    </>
                  )}
                </div>

                {/* Attendee Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-semibold">{scannedData.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Ticket className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tickets</p>
                      <p className="font-semibold">{scannedData.quantity} ticket(s)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Event</p>
                      <p className="font-semibold">{scannedData.events?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {scannedData.events?.date && format(new Date(scannedData.events.date), 'PPP')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <Badge variant="secondary" className="text-lg">
                      {scannedData.events?.currency || 'GHS'} {scannedData.total_amount.toFixed(2)}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={resetScanner}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Scan Another
                  </Button>
                  
                  {!scannedData.checked_in && scannedData.payment_status === 'completed' && (
                    <Button 
                      className="flex-1"
                      onClick={handleCheckIn}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Check In
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Point your camera at an attendee's QR code to scan
        </p>
      </div>
    </div>
  );
}
