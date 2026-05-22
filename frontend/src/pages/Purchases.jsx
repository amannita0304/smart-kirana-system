import { useEffect, useState } from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Loading';
import { purchaseAPI, supplierAPI, productAPI } from '../api/services';
import { formatCurrency, formatDate } from '../utils/format';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    supplierId: '', items: [{ name: '', quantity: 1, buyingPrice: '', productId: '' }], paidAmount: 0,
  });

  const fetchData = async () => {
    try {
      const [p, s, pr] = await Promise.all([
        purchaseAPI.getAll({ limit: 30 }),
        supplierAPI.getAll(),
        productAPI.getAll({ limit: 100 }),
      ]);
      setPurchases(p.data.data || []);
      setSuppliers(s.data.suppliers || []);
      setProducts(pr.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const emptyItem = () => ({ name: '', quantity: 1, buyingPrice: '', productId: '' });

  const addItem = () =>
    setForm({ ...form, items: [...form.items, emptyItem()] });

  const removeItem = (idx) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  /** Only send rows that have name + qty + price filled (skip blank "+ Add Item" rows) */
  const getValidItems = () =>
    form.items
      .filter(
        (i) =>
          i.name?.trim() &&
          Number(i.quantity) > 0 &&
          i.buyingPrice !== '' &&
          !Number.isNaN(Number(i.buyingPrice))
      )
      .map((i) => ({
        name: i.name.trim(),
        quantity: Number(i.quantity),
        buyingPrice: Number(i.buyingPrice),
        productId: i.productId || undefined,
      }));

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.supplierId) {
      toast.error('Please select supplier / सप्लायर चुनें');
      return;
    }

    const items = getValidItems();
    if (items.length === 0) {
      toast.error('Fill item name, quantity and price / नाम, मात्रा और कीमत भरें');
      return;
    }

    const total = items.reduce((sum, i) => sum + i.quantity * i.buyingPrice, 0);
    const paid = Number(form.paidAmount) || 0;
    if (paid > total) {
      toast.error(`Paid amount cannot be more than bill ₹${total}`);
      return;
    }

    try {
      await purchaseAPI.create({
        supplierId: form.supplierId,
        paidAmount: paid,
        items,
      });
      toast.success('Purchase recorded / खरीद दर्ज');
      setModalOpen(false);
      setForm({
        supplierId: '',
        items: [emptyItem()],
        paidAmount: 0,
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <><Header title="Purchases" titleHi="खरीद" /><PageLoader /></>;

  return (
    <>
      <Header title="Purchases" titleHi="खरीद प्रबंधन" />
      <div className="p-4 lg:p-6 space-y-4">
        <Button onClick={() => setModalOpen(true)} size="lg">
          <Plus size={20} /> Record Purchase / खरीद दर्ज करें
        </Button>

        <div className="space-y-3">
          {purchases.map((p) => (
            <Card key={p._id}>
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold dark:text-white">{p.invoiceNumber}</h3>
                  <p className="text-sm text-slate-500">{p.supplier?.name}</p>
                  <p className="text-xs text-slate-400">{formatDate(p.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(p.totalAmount)}</p>
                  <p className="text-xs text-amber-600">Pending: {formatCurrency(p.pendingAmount)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Purchase" titleHi="खरीद दर्ज" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <select
            className="w-full rounded-xl border px-4 py-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            required
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <p className="text-xs text-slate-500">
            Qty = quantity · Price = buying price per unit (खरीद कीमत)
          </p>

          {form.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 relative">
              {form.items.length > 1 && (
                <button
                  type="button"
                  className="absolute top-2 right-2 text-xs text-red-500 hover:underline"
                  onClick={() => removeItem(idx)}
                >
                  Remove
                </button>
              )}
              <select
                className="col-span-2 rounded-lg border px-2 py-1.5 text-sm dark:bg-slate-600"
                value={item.productId}
                onChange={(e) => {
                  const prod = products.find((p) => p._id === e.target.value);
                  const items = [...form.items];
                  items[idx] = {
                    ...items[idx],
                    productId: e.target.value,
                    name: prod?.name || items[idx].name,
                    buyingPrice: prod?.buyingPrice || items[idx].buyingPrice,
                  };
                  setForm({ ...form, items });
                }}
              >
                <option value="">Or type name manually</option>
                {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <Input label="Item name" labelHi="सामान" placeholder="e.g. Chawal" value={item.name} onChange={(e) => { const items = [...form.items]; items[idx].name = e.target.value; setForm({ ...form, items }); }} />
              <Input label="Qty" labelHi="मात्रा" type="number" min="0.01" step="1" placeholder="2" value={item.quantity} onChange={(e) => { const items = [...form.items]; items[idx].quantity = e.target.value; setForm({ ...form, items }); }} />
              <Input label="Price (per unit)" labelHi="कीमत/इकाई" type="number" min="0" step="0.01" placeholder="50" value={item.buyingPrice} onChange={(e) => { const items = [...form.items]; items[idx].buyingPrice = e.target.value; setForm({ ...form, items }); }} />
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addItem}>+ Add Item</Button>
          <Input label="Paid Amount" labelHi="भुगतान" type="number" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} />
          <Button type="submit" className="w-full" size="lg">Save Purchase</Button>
        </form>
      </Modal>
    </>
  );
}
