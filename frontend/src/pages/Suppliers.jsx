import { useEffect, useState } from 'react';
import { Truck, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Loading';
import { supplierAPI } from '../api/services';
import { formatCurrency } from '../utils/format';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const fetchSuppliers = async () => {
    try {
      const res = await supplierAPI.getAll();
      setSuppliers(res.data.suppliers || []);
    } catch {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await supplierAPI.create(form);
      toast.success('Supplier added');
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <><Header title="Suppliers" titleHi="सप्लायर" /><PageLoader /></>;

  return (
    <>
      <Header title="Suppliers" titleHi="सप्लायर प्रबंधन" />
      <div className="p-4 lg:p-6 space-y-4">
        <Button onClick={() => setModalOpen(true)} size="lg">
          <Plus size={20} /> Add Supplier / सप्लायर जोड़ें
        </Button>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <Card key={s._id}>
              <div className="flex items-center gap-2 mb-2">
                <Truck size={20} className="text-primary-600" />
                <h3 className="font-bold dark:text-white">{s.name}</h3>
              </div>
              {s.phone && <p className="text-sm text-slate-500">{s.phone}</p>}
              {s.address && <p className="text-sm text-slate-400">{s.address}</p>}
              <p className="mt-2 text-sm">
                Pending / बकाया:{' '}
                <strong className={s.pendingBalance > 0 ? 'text-amber-600' : 'text-primary-600'}>
                  {formatCurrency(s.pendingBalance)}
                </strong>
              </p>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Supplier" titleHi="सप्लायर जोड़ें">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" labelHi="नाम" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" labelHi="फोन" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Address" labelHi="पता" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Button type="submit" className="w-full" size="lg">Save</Button>
        </form>
      </Modal>
    </>
  );
}
