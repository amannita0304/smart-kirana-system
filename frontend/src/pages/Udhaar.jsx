import { useEffect, useState } from 'react';
import { HandCoins, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Loading';
import { udhaarAPI, customerAPI } from '../api/services';
import { formatCurrency, formatDate } from '../utils/format';

const statusColors = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-red-100 text-red-700',
};

export default function Udhaar() {
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [form, setForm] = useState({ customerId: '', amount: '', description: '' });
  const [payAmount, setPayAmount] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, c, s] = await Promise.all([
        udhaarAPI.getAll({ limit: 50 }),
        customerAPI.getAll({ limit: 100 }),
        udhaarAPI.getPendingSummary(),
      ]);
      setEntries(u.data.data || []);
      setCustomers(c.data.data || []);
      setSummary(s.data.summary);
    } catch {
      toast.error('Failed to load udhaar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await udhaarAPI.create({ customerId: form.customerId, amount: Number(form.amount), description: form.description });
      toast.success('Udhaar added / उधार जोड़ा गया');
      setAddModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await udhaarAPI.recordPayment(payModal._id, { amount: Number(payAmount), paymentMethod: 'cash' });
      toast.success('Payment recorded / भुगतान दर्ज');
      setPayModal(null);
      setPayAmount('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <><Header title="Udhaar" titleHi="उधार प्रबंधन" /><PageLoader /></>;

  return (
    <>
      <Header title="Udhaar Management" titleHi="उधार प्रबंधन" />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <Card>
            <p className="text-sm text-slate-500">Total Pending / कुल बकाया</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(summary?.totalPending)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Entries / प्रविष्टियां</p>
            <p className="text-2xl font-bold dark:text-white">{summary?.count ?? 0}</p>
          </Card>
        </div>

        <Button onClick={() => setAddModal(true)} size="lg">
          <Plus size={20} /> Add Udhaar / उधार जोड़ें
        </Button>

        <div className="space-y-3">
          {entries.map((u) => (
            <Card key={u._id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold dark:text-white">{u.customer?.name}</h3>
                  <p className="text-sm text-slate-500">{u.description}</p>
                  <p className="text-xs text-slate-400">{formatDate(u.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[u.status]}`}>
                    {u.status}
                  </span>
                  <p className="font-bold text-lg text-amber-600 mt-1">
                    {formatCurrency(u.pendingAmount)} pending
                  </p>
                  <p className="text-xs text-slate-400">of {formatCurrency(u.amount)}</p>
                </div>
                {u.status !== 'paid' && (
                  <Button size="sm" onClick={() => { setPayModal(u); setPayAmount(String(u.pendingAmount)); }}>
                    Record Payment / भुगतान
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Udhaar" titleHi="उधार जोड़ें">
        <form onSubmit={handleAdd} className="space-y-4">
          <select
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          >
            <option value="">Select Customer / ग्राहक चुनें</option>
            {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <Input label="Amount" labelHi="रकम" type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" className="w-full" size="lg">Save</Button>
        </form>
      </Modal>

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Record Payment" titleHi="भुगतान दर्ज करें">
        <form onSubmit={handlePayment} className="space-y-4">
          <p className="text-slate-600">Pending: <strong>{formatCurrency(payModal?.pendingAmount)}</strong></p>
          <Input label="Payment Amount" labelHi="भुगतान रकम" type="number" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          <Button type="submit" className="w-full" size="lg">Record Payment</Button>
        </form>
      </Modal>
    </>
  );
}
