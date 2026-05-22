import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../../store/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Shop registered! / दुकान रजिस्टर हो गई!');
      navigate('/');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <Store size={28} />
          </div>
          <h1 className="text-xl font-bold dark:text-white">Register Shop / दुकान रजिस्टर</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Shop Name"
            labelHi="दुकान का नाम"
            required
            value={form.shopName}
            onChange={(e) => setForm({ ...form, shopName: e.target.value })}
          />
          <Input
            label="Owner Name"
            labelHi="मालिक का नाम"
            required
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
          />
          <Input
            label="Phone"
            labelHi="फोन"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            labelHi="पासवर्ड"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Create Account / खाता बनाएं
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
