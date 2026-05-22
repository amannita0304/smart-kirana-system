import { useEffect, useState } from 'react';
import { Users, Plus, Search, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Loading';
import { customerAPI } from '../api/services';
import { formatCurrency } from '../utils/format';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getAll({ search, limit: 50 });
      setCustomers(res.data.data || []);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await customerAPI.create(form);
      toast.success('Customer added / ग्राहक जोड़ा गया');
      setModalOpen(false);
      setForm({ name: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    }
  };

  return (
    <>
      <Header title="Customers" titleHi="ग्राहक" />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              placeholder="Search name or phone / खोजें"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setModalOpen(true)} size="lg">
            <Plus size={20} /> Add Customer / ग्राहक जोड़ें
          </Button>
        </div>

        {loading ? (
          <PageLoader />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer / पहला ग्राहक जोड़ें"
            action={<Button onClick={() => setModalOpen(true)}>Add Customer</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((c) => (
              <Card key={c._id}>
                <h3 className="font-bold text-lg dark:text-white">{c.name}</h3>
                <p className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                  <Phone size={14} /> {c.phone}
                </p>
                {c.address && (
                  <p className="text-sm text-slate-400 mt-1">{c.address}</p>
                )}
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Pending / बकाया</span>
                  <span
                    className={`font-bold ${c.pendingBalance > 0 ? 'text-amber-600' : 'text-primary-600'}`}
                  >
                    {formatCurrency(c.pendingBalance)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Customer"
        titleHi="ग्राहक जोड़ें"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" labelHi="नाम" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" labelHi="फोन" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Address" labelHi="पता" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Button type="submit" className="w-full" size="lg">Save / सेव करें</Button>
        </form>
      </Modal>
    </>
  );
}
