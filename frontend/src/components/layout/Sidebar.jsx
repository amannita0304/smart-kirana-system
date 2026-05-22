import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  HandCoins,
  Truck,
  ShoppingBag,
  FileText,
  Bell,
  X,
  Store,
} from 'lucide-react';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import { LABELS } from '../../utils/constants';

const navItems = [
  { to: '/', icon: LayoutDashboard, ...LABELS.dashboard },
  { to: '/sales', icon: ShoppingCart, ...LABELS.sales },
  { to: '/products', icon: Package, ...LABELS.products },
  { to: '/customers', icon: Users, ...LABELS.customers },
  { to: '/udhaar', icon: HandCoins, ...LABELS.udhaar },
  { to: '/suppliers', icon: Truck, ...LABELS.suppliers },
  { to: '/purchases', icon: ShoppingBag, ...LABELS.purchases },
  { to: '/reports', icon: FileText, ...LABELS.reports },
  { to: '/notifications', icon: Bell, ...LABELS.notifications },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((s) => s.ui);
  const { user } = useSelector((s) => s.auth);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${
      isActive
        ? 'bg-primary-600 text-white shadow-md'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
    }`;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white border-r border-slate-200 transition-transform dark:bg-slate-900 dark:border-slate-700 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-primary-600 p-2 text-white">
              <Store size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm leading-tight">
                Smart Kirana
              </p>
              <p className="text-xs text-slate-500 truncate max-w-[140px]">
                {user?.shopName || 'My Shop'}
              </p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => dispatch(setSidebarOpen(false))}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, en, hi }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={linkClass}
              onClick={() => dispatch(setSidebarOpen(false))}
            >
              <Icon size={20} />
              <span>
                {en}
                <span className="block text-xs opacity-70">{hi}</span>
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
