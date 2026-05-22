import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Package, HandCoins } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import { PageLoader } from '../components/ui/Loading';
import { notificationAPI } from '../api/services';

const typeIcons = {
  low_stock: Package,
  out_of_stock: AlertTriangle,
  pending_udhaar: HandCoins,
};

const priorityColors = {
  high: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
  medium: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20',
  low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
};

export default function Notifications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI
      .getAll()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Header title="Alerts" titleHi="सूचनाएं" /><PageLoader /></>;

  const { notifications = [], summary = {} } = data || {};

  return (
    <>
      <Header title="Notifications" titleHi="सूचनाएं और अलर्ट" />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Low Stock', hi: 'कम स्टॉक', value: summary.lowStockCount, color: 'text-amber-600' },
            { label: 'Out of Stock', hi: 'खत्म', value: summary.outOfStockCount, color: 'text-red-600' },
            { label: 'Pending Udhaar', hi: 'बकाया', value: summary.pendingUdhaarCount, color: 'text-orange-600' },
            { label: 'Total Alerts', hi: 'कुल', value: notifications.length, color: 'text-primary-600' },
          ].map((s) => (
            <Card key={s.label}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? 0}</p>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-slate-400">{s.hi}</p>
            </Card>
          ))}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-12 text-slate-400">
              <Bell size={48} />
              <p className="mt-4">No alerts — all good! / सब ठीक है!</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-4 rounded-xl border-l-4 p-4 ${priorityColors[n.priority] || priorityColors.medium}`}
                >
                  <Icon size={24} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold dark:text-white">{n.message}</p>
                    <p className="text-sm text-slate-500">{n.messageHi}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
