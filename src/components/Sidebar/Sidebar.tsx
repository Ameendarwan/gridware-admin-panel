import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/Tooltip/Tooltip';

import { Button } from '@app/components/Button/Button';
import { MapMode } from '@app/pages/Deployments/components/MapBox/types';
import { setIsMainSidebarCollapsed } from '@app/store/slices/sidebarsSlice';
import { setMode } from '@app/store/slices/edgesSlice';
import { urls } from '@app/routes/urls';
import { useDispatch } from 'react-redux';

const menuItems = [
  { label: 'Users', iconClass: 'fa-solid fa-users', to: urls.users.list },
  { label: 'Customers', iconClass: 'fa-solid fa-user-tie', to: urls.customers.list },
  { label: 'Deployments', iconClass: 'fa-solid fa-network-wired', to: urls.deployments.list },
  { label: 'Poles', iconClass: 'fa-solid fa-flag', to: urls.poles.list },
  { label: 'Devices', iconClass: 'fa-solid fa-tablet-alt', to: urls.devices.list },
  { label: 'Public info circuit', iconClass: 'fa-solid fa-link', to: urls.publicInfoCircuit.list },
  { label: 'CSV', iconClass: 'fa-solid fa-file-csv', to: urls.csv.list },
  { label: 'Span(s)', iconClass: 'fa-solid fa-ruler-horizontal', to: urls.edge.list },
  { label: 'Batch Tracking', iconClass: 'fa-solid fa-tasks', to: urls.batchTracking.list },
  { label: 'Bug', iconClass: 'fa-solid fa-ruler-combined', to: urls.bug.list },
];

interface MenuItemProps {
  label: string;
  iconClass: string;
  to: string;
  isCollapsed: boolean;
  isActive: boolean;
  onNavigate: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, iconClass, to, isCollapsed, isActive, onNavigate }) => {
  const content = (
    <Button
      variant="ghost"
      className={`w-full justify-start text-white hover:bg-white/10 hover:text-white ${
        isActive ? 'bg-white/10 font-semibold' : ''
      }`}
      asChild>
      <Link to={to} className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`} onClick={onNavigate}>
        <span className="w-4">
          <i className={iconClass} />
        </span>
        {!isCollapsed && label}
      </Link>
    </Button>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="bg-primary text-white">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();

  const handleCollapse = () => {
    const updatedCollapsedStatus = !isCollapsed;
    setIsCollapsed(updatedCollapsedStatus);
    dispatch(setIsMainSidebarCollapsed(updatedCollapsedStatus));
  };

  const handleNavigate = () => {
    dispatch(setMode(MapMode.NOVIEW));
  };

  return (
    <TooltipProvider>
      <div
        className={`relative flex h-screen flex-col bg-primary text-white transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}>
        <div className="flex items-center p-4">
          <Link className={`flex gap-x-2 truncate ${isCollapsed ? 'hidden' : 'block'}`} to={urls.users.list}>
            <h1 className="text-md font-semibold">DST Webmanager</h1>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-primary text-white hover:bg-primary hover:text-white"
                onClick={handleCollapse}>
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-white">
              {isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {menuItems.map(item => (
            <MenuItem
              key={item.label}
              label={item.label}
              iconClass={item.iconClass}
              to={item.to}
              isCollapsed={isCollapsed}
              isActive={location.pathname.includes(item.to)}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>
        <div className={`flex items-center p-4`}>
          <span>{import.meta.env.VITE_VERSION}</span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
