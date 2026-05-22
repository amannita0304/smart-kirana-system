import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../../store/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back! / स्वागत है!');
      navigate('/');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Smart Kirana
          </h1>
          <p className="text-slate-500">Business Manager / व्यापार प्रबंधक</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="your@email.com"
          />
          <Input
            label="Password"
            labelHi="पासवर्ड"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Login / लॉगिन
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New shop?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Register / रजिस्टर करें
          </Link>
        </p>
      </div>
    </div>
  );
}
