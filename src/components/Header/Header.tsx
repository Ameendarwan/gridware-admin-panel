import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import React, { useEffect, useState } from 'react';

import { urls } from '@app/routes/urls';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'react-router-dom';
import { redirectToLogin } from '@app/lib/authClient';

export const titles = {
  [urls.deployments.list]: 'Deployments',
  [urls.deployments.poleMap]: 'Map View',
  [urls.users.list]: 'Users',
  [urls.customers.list]: 'Customers',
  [urls.poles.list]: 'Poles',
  [urls.devices.list]: 'Devices',
  [urls.batchTracking.list]: 'Batch Tracking',
  [urls.publicInfoCircuit.list]: 'Public info circuit',
  [urls.csv.list]: 'CSV',
  [urls.edge.list]: 'Span(s)',
  [urls.bug.list]: 'Bug',
  [urls.dashboard]: '',
};

const Header = () => {
  const location = useLocation();
  const [title, setTitle] = useState('');
  const { user } = useAuth0();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    /**
     * Function to handle the logout process.
     * - Calls the `logout()` function to perform any additional logout operations (such as redirecting the user).
     */
    await redirectToLogin('', true);
  };

  useEffect(() => {
    /**
     * Effect hook to set the page title based on the current URL path.
     * - Iterates through a predefined set of paths (`titles`) and matches the current location pathname using `matchPath`.
     * - If a match is found, it sets the page title to the corresponding title from the `titles` object.
     * - The effect is triggered whenever the `location` changes (i.e., the URL path changes).
     */
    for (const path in titles) {
      const match = location.pathname.includes(path);
      if (match) {
        setTitle(titles[path] ?? '');
        break;
      }
    }
  }, [location]);

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      </div>
      <div className="relative flex items-center space-x-4">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 focus:outline-none">
          <Avatar className="rounded-[4px]">
            <AvatarFallback className="rounded-[4px] bg-[#686868] p-2 text-sm text-white">
              {user?.name
                ?.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700">{user?.email}</span>
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 top-8 z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
