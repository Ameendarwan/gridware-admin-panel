import { Button } from '@app/components/Button/Button';
import { Link, useLocation } from 'react-router-dom';
import { urls } from '@app/routes/urls';

const menuItems = [
  { label: 'Users', iconClass: 'fa-solid fa-users', to: urls.users },
  { label: 'Customers', iconClass: 'fa-solid fa-user-tie', to: '#' },
  { label: 'Deployments', iconClass: 'fa-solid fa-network-wired', to: urls.deployments },
  { label: 'Poles', iconClass: 'fa-solid fa-flag', to: '#' },
  { label: 'Devices', iconClass: 'fa-solid fa-tablet-alt', to: '#' },
  { label: 'Span Types', iconClass: 'fa-solid fa-ruler-combined', to: '#' },
  { label: 'Spans', iconClass: 'fa-solid fa-ruler-horizontal', to: '#' },
  { label: 'Permits', iconClass: 'fa-solid fa-file-alt', to: '#' },
  { label: 'Batch Tracking', iconClass: 'fa-solid fa-tasks', to: '#' },
  { label: 'Public info circuit', iconClass: 'fa-solid fa-link', to: '#' },
];

const Sidebar = () => {
  const location = useLocation();
  return (
    <div className="flex h-screen w-[181px] flex-col bg-[#3b3c4f] text-white">
      <Link className="p-4" to={urls.dashboard}>
        <h1 className="text-sm font-semibold">Gridware Admin Panel</h1>
      </Link>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {menuItems.map(({ label, iconClass, to }) => (
          <Button
            key={label}
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-white/10 hover:text-white ${
              location.pathname === to ? 'bg-white/10 font-semibold' : ''
            }`}
            asChild>
            <Link to={to} className="flex items-center gap-3">
              <i className={iconClass} />
              {label}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
