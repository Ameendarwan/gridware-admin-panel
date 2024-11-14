import { Button } from '@app/components/Button/Button';
import { Link } from 'react-router-dom';

const menuItems = [
  { label: 'Users', iconClass: 'fa-solid fa-users', to: '#' },
  { label: 'Customers', iconClass: 'fa-solid fa-user-tie', to: '#' },
  { label: 'Deployments', iconClass: 'fa-solid fa-network-wired', to: '#' },
  { label: 'Poles', iconClass: 'fa-solid fa-flag', to: '#' },
  { label: 'Devices', iconClass: 'fa-solid fa-tablet-alt', to: '#' },
  { label: 'Span Types', iconClass: 'fa-solid fa-ruler-combined', to: '#' },
  { label: 'Spans', iconClass: 'fa-solid fa-ruler-horizontal', to: '#' },
  { label: 'Permits', iconClass: 'fa-solid fa-file-alt', to: '#' },
  { label: 'Batch Tracking', iconClass: 'fa-solid fa-tasks', to: '#' },
  { label: 'Public info circuit', iconClass: 'fa-solid fa-link', to: '#' },
];

const Sidebar = () => {
  return (
    <div className="flex h-screen w-[181px] flex-col bg-[#3b3c4f] text-white">
      <div className="p-4">
        <h1 className="text-sm font-semibold">Gridware Admin Panel</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {menuItems.map(({ label, iconClass, to }) => (
          <Button
            key={label}
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
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
