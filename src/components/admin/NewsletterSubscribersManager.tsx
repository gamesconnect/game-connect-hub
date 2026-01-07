import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Download, Mail } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export function NewsletterSubscribersManager() {
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const exportToCsv = () => {
    if (!subscribers || subscribers.length === 0) return;

    const headers = ['Email', 'Status', 'Subscribed Date'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(sub => [
        sub.email,
        sub.is_active ? 'Active' : 'Inactive',
        formatDate(sub.created_at)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const activeCount = subscribers?.filter(s => s.is_active).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} active subscriber{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        {subscribers && subscribers.length > 0 && (
          <Button onClick={exportToCsv} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : subscribers && subscribers.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>
                    {subscriber.is_active ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(subscriber.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No subscribers yet</p>
        </div>
      )}
    </div>
  );
}