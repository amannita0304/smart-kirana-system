import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { PageLoader } from '../components/ui/Loading';
import { productAPI, saleAPI, customerAPI } from '../api/services';
import { PAYMENT_METHODS } from '../utils/constants';
import { formatCurrency, formatDateTime } from '../utils/format';

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercent, setGstPercent] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      productAPI.getAll({ limit: 100 }),
      customerAPI.getAll({ limit: 100 }),
      saleAPI.getAll({ period: 'daily', limit: 20 }),
    ]).then(([p, c, s]) => {
      setProducts(p.data.data || []);
      setCustomers(c.data.data || []);
      setSales(s.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      toast.error('Out of stock / स्टॉक खत्म');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          toast.error('Not enough stock');
          return prev;
        }
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId: product._id, name: product.name, sellingPrice: product.sellingPrice, quantity: 1, maxStock: product.stockQuantity }];
    });
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0);
  const gstAmount = gstEnabled ? (cartTotal * gstPercent) / 100 : 0;
  const grandTotal = cartTotal + gstAmount;

  const handleSale = async () => {
    if (cart.length === 0) return toast.error('Add items to cart');
    if (paymentMethod === 'udhaar' && !customerId) return toast.error('Select customer for udhaar');

    setSubmitting(true);
    try {
      await saleAPI.create({
        items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
        customerId: customerId || undefined,
        paymentMethod,
        gstEnabled,
        gstPercent: gstEnabled ? Number(gstPercent) : 0,
      });
      toast.success('Sale completed! / बिक्री पूरी!');
      setCart([]);
      const res = await saleAPI.getAll({ period: 'daily', limit: 20 });
      setSales(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sale failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><Header title="Sales" titleHi="बिक्री" /><PageLoader /></>;

  return (
    <>
      <Header title="New Sale" titleHi="नई बिक्री" />
      <div className="p-4 lg:p-6 grid lg:grid-cols-3 gap-6">
        {/* Product picker */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Select Products" subtitle="सामान चुनें">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {products.filter((p) => p.stockQuantity > 0).map((p) => (
                <button
                  key={p._id}
                  onClick={() => addToCart(p)}
                  className="rounded-xl border border-slate-200 p-3 text-left hover:border-primary-500 hover:bg-primary-50 dark:border-slate-600 dark:hover:bg-primary-900/20 transition"
                >
                  <p className="font-semibold text-sm dark:text-white">{p.name}</p>
                  <p className="text-primary-600 font-bold text-sm">{formatCurrency(p.sellingPrice)}</p>
                  <p className="text-xs text-slate-400">Stock: {p.stockQuantity}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Today's Sales" subtitle="आज की बिक्री">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sales.map((s) => (
                <div key={s._id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
                  <span>{s.invoiceNumber}</span>
                  <span className="font-semibold text-primary-600">{formatCurrency(s.totalAmount)}</span>
                  <span className="text-slate-400">{formatDateTime(s.createdAt)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Cart / Bill */}
        <div className="space-y-4">
          <Card title="Bill / बिल" className="sticky top-20">
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Cart empty / खाली</p>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-sm">
                    <span className="flex-1 dark:text-white">{item.name} x{item.quantity}</span>
                    <span className="font-semibold">{formatCurrency(item.sellingPrice * item.quantity)}</span>
                    <button onClick={() => setCart(cart.filter((c) => c.productId !== item.productId))} className="ml-2 text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 mb-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Walk-in Customer / सामान्य ग्राहक</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>
              ))}
            </select>

            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 mb-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 mb-3 text-sm">
              <input type="checkbox" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} />
              GST ({gstPercent}%)
            </label>
            {gstEnabled && (
              <Input type="number" value={gstPercent} onChange={(e) => setGstPercent(e.target.value)} className="mb-3" />
            )}

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
              {gstEnabled && <div className="flex justify-between"><span>GST</span><span>{formatCurrency(gstAmount)}</span></div>}
              <div className="flex justify-between text-lg font-bold text-primary-600">
                <span>Total / कुल</span><span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Button className="w-full mt-4" size="lg" onClick={handleSale} loading={submitting} disabled={cart.length === 0}>
              <ShoppingCart size={20} /> Complete Sale / बिक्री करें
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
