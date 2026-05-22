import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import { toggleSidebar, toggleDarkMode } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Header({ title, titleHi }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { darkMode } = useSelector((s) => s.ui);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out / लॉगआउट हो गया');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white lg:text-xl">
            {title}
          </h1>
          {titleHi && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{titleHi}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mr-2">
          <User size={16} />
          <span>{user?.ownerName}</span>
        </div>
        <button
          className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => dispatch(toggleDarkMode())}
          title="Dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          className="rounded-xl p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
