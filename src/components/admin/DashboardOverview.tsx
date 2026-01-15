import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/browserClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Loader2, DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { format, subDays, startOfMonth, eachDayOfInterval } from 'date-fns';

export function DashboardOverview() {
  const { data: registrations, isLoading: loadingRegistrations } = useQuery({
    queryKey: ['dashboard-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*, events (title, category)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: subscribers, isLoading: loadingSubscribers } = useQuery({
    queryKey: ['dashboard-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('newsletter_subscribers').select('*');
      if (error) throw error;
      return data;
    },
  });

  if (loadingRegistrations || loadingEvents || loadingSubscribers) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = registrations
    ?.filter((r) => r.payment_status === 'completed')
    .reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;

  const pendingRevenue = registrations
    ?.filter((r) => r.payment_status === 'pending')
    .reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;

  const totalRegistrations = registrations?.length || 0;
  const completedRegistrations = registrations?.filter((r) => r.payment_status === 'completed').length || 0;
  const activeEvents = events?.filter((e) => e.is_active).length || 0;
  const totalSubscribers = subscribers?.length || 0;

  // Revenue by day (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const revenueByDay = last7Days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayRevenue = registrations
      ?.filter((r) => {
        const regDate = format(new Date(r.created_at), 'yyyy-MM-dd');
        return regDate === dayStr && r.payment_status === 'completed';
      })
      .reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;

    return {
      date: format(day, 'EEE'),
      revenue: dayRevenue,
    };
  });

  // Revenue by event category
  const revenueByCategory = registrations
    ?.filter((r) => r.payment_status === 'completed')
    .reduce((acc, r) => {
      const category = r.events?.category || 'Other';
      acc[category] = (acc[category] || 0) + Number(r.total_amount);
      return acc;
    }, {} as Record<string, number>) || {};

  const categoryData = Object.entries(revenueByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Payment status distribution
  const statusData = [
    { name: 'Completed', value: registrations?.filter((r) => r.payment_status === 'completed').length || 0, color: 'hsl(var(--chart-1))' },
    { name: 'Pending', value: registrations?.filter((r) => r.payment_status === 'pending').length || 0, color: 'hsl(var(--chart-2))' },
    { name: 'Failed', value: registrations?.filter((r) => r.payment_status === 'failed').length || 0, color: 'hsl(var(--chart-3))' },
  ].filter((s) => s.value > 0);

  // Registrations trend (last 7 days)
  const registrationsTrend = last7Days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = registrations?.filter((r) => {
      const regDate = format(new Date(r.created_at), 'yyyy-MM-dd');
      return regDate === dayStr;
    }).length || 0;

    return {
      date: format(day, 'EEE'),
      registrations: count,
    };
  });

  const chartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
    registrations: { label: 'Registrations', color: 'hsl(var(--chart-2))' },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +GHS {pendingRevenue.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              {completedRegistrations} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              of {events?.length || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">newsletter subscribers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={revenueByDay}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Registrations Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Registrations Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <LineChart data={registrationsTrend}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Payment Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No registration data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
