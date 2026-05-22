import { useEffect, useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Loading';
import { productAPI } from '../api/services';
import { formatCurrency } from '../utils/format';

const stockBadge = (product) => {
  const status = product.stockStatus || (product.stockQuantity <= 0 ? 'out_of_stock' : product.stockQuantity <= product.lowStockThreshold ? 'low_stock' : 'in_stock');
  const styles = {
    in_stock: 'bg-green-100 text-green-700',
    low_stock: 'bg-amber-100 text-amber-700',
    out_of_stock: 'bg-red-100 text-red-700',
  };
  const labels = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', buyingPrice: '', sellingPrice: '', stockQuantity: '', lowStockThreshold: '5', barcode: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ search, limit: 50 });
      setProducts(res.data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await productAPI.create({
        ...form,
        buyingPrice: Number(form.buyingPrice),
        sellingPrice: Number(form.sellingPrice),
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
      });
      toast.success('Product added / सामान जोड़ा गया');
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <>
      <Header title="Products" titleHi="सामान / इन्वेंटरी" />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              placeholder="Search products / सामान खोजें"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setModalOpen(true)} size="lg">
            <Plus size={20} /> Add Product / सामान जोड़ें
          </Button>
        </div>

        {loading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <EmptyState icon={Package} title="No products" description="Add inventory items" action={<Button onClick={() => setModalOpen(true)}>Add Product</Button>} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <Card key={p._id}>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold dark:text-white">{p.name}</h3>
                  {stockBadge(p)}
                </div>
                <p className="text-sm text-slate-500">{p.category}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400">Buy / खरीद</p>
                    <p className="font-semibold">{formatCurrency(p.buyingPrice)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Sell / बिक्री</p>
                    <p className="font-semibold text-primary-600">{formatCurrency(p.sellingPrice)}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  Stock / स्टॉक: <strong>{p.stockQuantity}</strong> {p.unit || 'piece'}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Product" titleHi="सामान जोड़ें" size="lg">
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
          <Input label="Name" labelHi="नाम" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Category" labelHi="श्रेणी" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Buying Price" labelHi="खरीद मूल्य" type="number" required value={form.buyingPrice} onChange={(e) => setForm({ ...form, buyingPrice: e.target.value })} />
          <Input label="Selling Price" labelHi="बिक्री मूल्य" type="number" required value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
          <Input label="Stock Qty" labelHi="स्टॉक" type="number" required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
          <Input label="Low Stock Alert" type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
          <Input label="Barcode" className="sm:col-span-2" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          <Button type="submit" className="sm:col-span-2 w-full" size="lg">Save / सेव करें</Button>
        </form>
      </Modal>
    </>
  );
}
