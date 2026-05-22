import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PageLoader } from '../components/ui/Loading';
import { reportAPI } from '../api/services';
import { formatCurrency, formatDate } from '../utils/format';

const tabs = [
  { id: 'sales', label: 'Sales Report', hi: 'बिक्री रिपोर्ट' },
  { id: 'profit', label: 'Profit Report', hi: 'मुनाफा रिपोर्ट' },
  { id: 'udhaar', label: 'Udhaar Report', hi: 'उधार रिपोर्ट' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let res;
        if (activeTab === 'sales') res = await reportAPI.sales({ period });
        else if (activeTab === 'profit') res = await reportAPI.profit({ period });
        else res = await reportAPI.udhaar();
        setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeTab, period]);

  return (
    <>
      <Header title="Reports" titleHi="रिपोर्ट" />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                activeTab === t.id ? 'bg-primary-600 text-white' : 'bg-white border dark:bg-slate-800 dark:border-slate-600'
              }`}
            >
              {t.label} / {t.hi}
            </button>
          ))}
        </div>

        {activeTab !== 'udhaar' && (
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1 text-sm capitalize ${period === p ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-slate-500'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <Button variant="secondary" onClick={() => window.print()}>
          <Download size={18} /> Print / Export PDF
        </Button>

        {loading ? (
          <PageLoader />
        ) : (
          <Card>
            {activeTab === 'sales' && data?.summary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div><p className="text-sm text-slate-500">Total Sales</p><p className="text-xl font-bold">{formatCurrency(data.summary.totalSales)}</p></div>
                  <div><p className="text-sm text-slate-500">Profit</p><p className="text-xl font-bold text-primary-600">{formatCurrency(data.summary.totalProfit)}</p></div>
                  <div><p className="text-sm text-slate-500">GST</p><p className="text-xl font-bold">{formatCurrency(data.summary.totalGst)}</p></div>
                  <div><p className="text-sm text-slate-500">Invoices</p><p className="text-xl font-bold">{data.summary.invoiceCount}</p></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-slate-500"><th>Invoice</th><th>Customer</th><th>Amount</th><th>Date</th></tr></thead>
                    <tbody>
                      {(data.sales || []).map((s) => (
                        <tr key={s._id} className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-2">{s.invoiceNumber}</td>
                          <td>{s.customerName}</td>
                          <td className="font-semibold">{formatCurrency(s.totalAmount)}</td>
                          <td>{formatDate(s.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'profit' && data?.totals && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-sm text-slate-500">Sales</p><p className="text-xl font-bold">{formatCurrency(data.totals.totalSales)}</p></div>
                  <div><p className="text-sm text-slate-500">Cost</p><p className="text-xl font-bold">{formatCurrency(data.totals.totalCost)}</p></div>
                  <div><p className="text-sm text-slate-500">Profit</p><p className="text-xl font-bold text-primary-600">{formatCurrency(data.totals.totalProfit)}</p></div>
                </div>
                {(data.profitByDay || []).map((d) => (
                  <div key={d._id} className="flex justify-between py-2 border-b text-sm">
                    <span>{d._id}</span>
                    <span className="text-primary-600 font-semibold">{formatCurrency(d.profit)}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'udhaar' && (
              <div className="space-y-4">
                <p className="text-2xl font-bold text-amber-600">
                  Total Pending: {formatCurrency(data?.totalPending)}
                </p>
                <p className="text-slate-500">{data?.customerCount} customers with balance</p>
                {(data?.customersWithBalance || []).map((c) => (
                  <div key={c._id} className="flex justify-between py-2 border-b">
                    <span className="font-medium">{c.name} — {c.phone}</span>
                    <span className="font-bold text-amber-600">{formatCurrency(c.pendingBalance)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
