import { DollarSign, TrendingUp, TrendingDown, ShoppingBag, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PanelWrapper } from './PanelWrapper';
import { Badge } from '@/components/ui/badge';
import { fetchShopifyRevenue, isShopifyConfigured, type ShopifyRevenueData } from '@/lib/shopify-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function KPICard({ label, value, change, prefix = '' }: {
  label: string;
  value: string;
  change?: number;
  prefix?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-serif-bold text-foreground mt-1">{prefix}{value}</p>
      {change !== undefined && change !== 0 && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${change > 0 ? 'text-primary' : 'text-destructive'}`}>
          {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{change > 0 ? '+' : ''}{change.toFixed(1)}% vs yesterday</span>
        </div>
      )}
    </div>
  );
}

function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h3 className="font-serif text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">30-Day Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 87%)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(0 0% 42%)" />
          <YAxis tick={{ fontSize: 10 }} stroke="hsl(0 0% 42%)" />
          <Tooltip
            contentStyle={{
              background: 'hsl(0 0% 100%)',
              border: '1px solid hsl(40 15% 87%)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(120 38% 31%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(120 38% 31%)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChannelCards() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h3 className="font-serif text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Channels</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Shopify</span>
          </div>
          {isShopifyConfigured() ? (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Connected</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">Not connected</Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">AWIN</span>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Active</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">TikTok Shop</span>
          </div>
          <Badge variant="outline" className="text-[10px] text-muted-foreground">Pending</Badge>
        </div>
      </div>
    </div>
  );
}

export function RevenuePanel() {
  const { data, isError } = useQuery<ShopifyRevenueData>({
    queryKey: ['shopify-revenue'],
    queryFn: fetchShopifyRevenue,
    staleTime: 300000,
    refetchInterval: 300000,
    retry: 1,
  });

  const kpi = data?.kpi;
  const hasData = kpi && kpi.totalRevenue > 0;

  return (
    <PanelWrapper title="Revenue" icon={<DollarSign className="h-5 w-5 text-primary" />} error={isError}>
      {!hasData && (
        <div className="rounded-lg bg-secondary border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {data?.period || 'Connect Shopify to see revenue data'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add <code className="font-mono text-[10px] bg-muted px-1 rounded">VITE_SHOPIFY_STORE_URL</code> and
            <code className="font-mono text-[10px] bg-muted px-1 rounded ml-1">VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> to .env
          </p>
        </div>
      )}

      {hasData && kpi && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard label="30-Day Revenue" value={kpi.totalRevenue.toLocaleString()} prefix="$" change={kpi.dayOverDayChange} />
            <KPICard label="Orders" value={kpi.orderCount.toLocaleString()} />
            <KPICard label="AOV" value={kpi.averageOrderValue.toFixed(2)} prefix="$" />
            <KPICard label="Day/Day" value={`${kpi.dayOverDayChange > 0 ? '+' : ''}${kpi.dayOverDayChange.toFixed(1)}%`} />
          </div>

          {/* Trend Chart */}
          <RevenueChart data={data?.dailyRevenue ?? []} />

          {/* Top Products */}
          {data?.topProducts && data.topProducts.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h3 className="font-serif text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Top Products</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border text-[11px]">
                    <th className="py-1.5 pr-4">Product</th>
                    <th className="py-1.5 pr-4 text-right">Units</th>
                    <th className="py-1.5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-foreground font-medium">{p.title}</td>
                      <td className="py-2 pr-4 text-right text-muted-foreground tabular-nums">{p.unitsSold}</td>
                      <td className="py-2 text-right text-foreground font-medium tabular-nums">${p.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ChannelCards />
    </PanelWrapper>
  );
}
