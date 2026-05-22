import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TrendingUp,
  IndianRupee,
  HandCoins,
  Users,
  Package,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Header from '../components/layout/Header';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import { PageLoader } from '../components/ui/Loading';
import { dashboardAPI } from '../api/services';
import { setPeriod } from '../store/slices/uiSlice';
import { formatCurrency } from '../utils/format';

const periods = [
  { value: 'daily', label: 'Today / आज' },
  { value: 'weekly', label: 'Week / सप्ताह' },
  { value: 'monthly', label: 'Month / महीना' },
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { period } = useSelector((s) => s.ui);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await dashboardAPI.getStats(period);
        setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [period]);

  if (loading) return <><Header title="Dashboard" titleHi="डैशबोर्ड" /><PageLoader /></>;

  const { stats, salesTrend, topProducts, lowStockProducts } = data || {};

  return (
    <>
      <Header title="Dashboard" titleHi="डैशबोर्ड" />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Period selector */}
        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => dispatch(setPeriod(p.value))}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                period === p.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            icon={IndianRupee}
            label="Total Sales"
            labelHi="कुल बिक्री"
            value={formatCurrency(stats?.totalSales)}
            color="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Profit"
            labelHi="कुल मुनाफा"
            value={formatCurrency(stats?.totalProfit)}
            color="blue"
          />
          <StatCard
            icon={HandCoins}
            label="Pending Udhaar"
            labelHi="बकाया उधार"
            value={formatCurrency(stats?.pendingUdhaar)}
            color="amber"
          />
          <StatCard
            icon={Users}
            label="Customers"
            labelHi="ग्राहक"
            value={stats?.totalCustomers ?? 0}
            color="purple"
          />
          <StatCard
            icon={Package}
            label="Products"
            labelHi="सामान"
            value={stats?.totalProducts ?? 0}
            color="blue"
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock"
            labelHi="कम स्टॉक"
            value={lowStockProducts?.length ?? 0}
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Sales Trend (7 days)" subtitle="बिक्री का रुझान">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Top Products" subtitle="सबसे ज्यादा बिकने वाला">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(topProducts || []).map((p) => ({ name: p._id?.slice(0, 12), qty: p.totalQuantity }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qty" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Low stock alerts */}
        {lowStockProducts?.length > 0 && (
          <Card title="Low Stock Alerts" subtitle="कम स्टॉक चेतावनी">
            <div className="space-y-2">
              {lowStockProducts.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-amber-700 font-semibold text-sm">
                    {p.stockQuantity} left / बचे
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
