import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  RefreshCw,
  Search,
  Users,
  CheckSquare
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
  event_id: string;
  events: {
    id: string;
    title: string;
    date: string;
    time: string | null;
    location: string;
    currency: string;
  } | null;
}

interface EventOption {
  id: string;
  title: string;
  date: string;
}

export default function CheckIn() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<RegistrationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  // Manual search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [events, setEvents] = useState<EventOption[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Fetch events for filter dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, date')
        .eq('is_active', true)
        .order('date', { ascending: false });
      
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  // Search registrations
  const searchRegistrations = async () => {
    if (!searchQuery.trim() && selectedEvent === 'all') {
      setRegistrations([]);
      return;
    }

    setIsSearching(true);
    try {
      let query = supabase
        .from('registrations')
        .select(`
          *,
          events!inner (
            id,
            title,
            date,
            time,
            location,
            currency
          )
        `)
        .eq('payment_status', 'completed');

      if (selectedEvent !== 'all') {
        query = query.eq('event_id', selectedEvent);
      }

      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);

      if (error) throw error;
      setRegistrations((data as RegistrationData[]) || []);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Failed to search registrations');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle individual check-in from list
  const handleListCheckIn = async (registration: RegistrationData) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', registration.id);

      if (error) throw error;

      setRegistrations(prev => 
        prev.map(r => 
          r.id === registration.id 
            ? { ...r, checked_in: true, checked_in_at: new Date().toISOString() }
            : r
        )
      );
      toast.success(`${registration.full_name} checked in!`);
    } catch (err) {
      console.error('Check-in error:', err);
      toast.error('Failed to check in');
    }
  };

  // Handle bulk check-in
  const handleBulkCheckIn = async () => {
    if (selectedIds.size === 0) {
      toast.error('No attendees selected');
      return;
    }

    const uncheckedIds = Array.from(selectedIds).filter(id => {
      const reg = registrations.find(r => r.id === id);
      return reg && !reg.checked_in;
    });

    if (uncheckedIds.length === 0) {
      toast.info('All selected attendees are already checked in');
      return;
    }

    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .in('id', uncheckedIds);

      if (error) throw error;

      setRegistrations(prev => 
        prev.map(r => 
          uncheckedIds.includes(r.id)
            ? { ...r, checked_in: true, checked_in_at: new Date().toISOString() }
            : r
        )
      );
      setSelectedIds(new Set());
      toast.success(`${uncheckedIds.length} attendee(s) checked in successfully!`);
    } catch (err) {
      console.error('Bulk check-in error:', err);
      toast.error('Failed to check in selected attendees');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all unchecked
  const selectAllUnchecked = () => {
    const uncheckedIds = registrations.filter(r => !r.checked_in).map(r => r.id);
    setSelectedIds(new Set(uncheckedIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

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
            id,
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

  const uncheckedCount = registrations.filter(r => !r.checked_in).length;
  const selectedUncheckedCount = Array.from(selectedIds).filter(id => {
    const reg = registrations.find(r => r.id === id);
    return reg && !reg.checked_in;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
              <Users className="w-6 h-6" />
              Event Check-In
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs defaultValue="scanner" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scanner" className="gap-2">
                  <Camera className="w-4 h-4" />
                  QR Scanner
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-2">
                  <Search className="w-4 h-4" />
                  Manual Search
                </TabsTrigger>
              </TabsList>

              {/* QR Scanner Tab */}
              <TabsContent value="scanner" className="space-y-6">
                <div className="max-w-md mx-auto">
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
                </div>
              </TabsContent>

              {/* Manual Search Tab */}
              <TabsContent value="manual" className="space-y-6">
                {/* Search Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchRegistrations()}
                    />
                  </div>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={searchRegistrations} disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                {/* Bulk Actions */}
                {registrations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllUnchecked}
                        disabled={uncheckedCount === 0}
                      >
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Select All Unchecked ({uncheckedCount})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        disabled={selectedIds.size === 0}
                      >
                        Clear Selection
                      </Button>
                    </div>
                    <div className="flex-1" />
                    <Button
                      onClick={handleBulkCheckIn}
                      disabled={isBulkProcessing || selectedUncheckedCount === 0}
                    >
                      {isBulkProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Check In Selected ({selectedUncheckedCount})
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Results Table */}
                {registrations.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Attendee</TableHead>
                          <TableHead className="hidden md:table-cell">Event</TableHead>
                          <TableHead className="hidden sm:table-cell">Tickets</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrations.map((reg) => (
                          <TableRow key={reg.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(reg.id)}
                                onCheckedChange={() => toggleSelection(reg.id)}
                                disabled={reg.checked_in}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{reg.full_name}</p>
                                <p className="text-sm text-muted-foreground">{reg.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <p className="text-sm">{reg.events?.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {reg.events?.date && format(new Date(reg.events.date), 'MMM d, yyyy')}
                              </p>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {reg.quantity}
                            </TableCell>
                            <TableCell>
                              {reg.checked_in ? (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Checked In
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {!reg.checked_in && (
                                <Button
                                  size="sm"
                                  onClick={() => handleListCheckIn(reg)}
                                >
                                  Check In
                                </Button>
                              )}
                              {reg.checked_in && reg.checked_in_at && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(reg.checked_in_at), 'h:mm a')}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Search for attendees by name or email</p>
                    <p className="text-sm">Or select an event to view all registrations</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
