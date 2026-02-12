import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Tags,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Feed', icon: LayoutDashboard },
  { to: '/sources', label: 'Sources', icon: Globe },
  { to: '/keywords', label: 'Keywords', icon: Tags },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside
      style={{ width: '256px', minWidth: '256px' }}
      className="fixed left-0 top-0 bottom-0 bg-sidebar flex flex-col z-30"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Clearfeed
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-1 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
              }`
            }
          >
            <Shield className="h-[18px] w-[18px]" />
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
