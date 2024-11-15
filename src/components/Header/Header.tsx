import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogout } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { userLoggedOut } from '@app/store/slices/auth';
import { useLocation } from 'react-router-dom';
import { urls } from '@app/routes/urls';

const titles = {
  [urls.deployments]: 'Deployments',
  [urls.users]: 'Users',
  [urls.customers]: 'Customers',
  [urls.poles]: 'Poles',
  [urls.dashboard]: '',
};

const Header = () => {
  const location = useLocation();
  const [title, setTitle] = useState('');
  const dispatch = useDispatch();
  const userDetails = useSelector((state: any) => state.auth.userDetails);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  function handleLogout() {
    googleLogout();
    Cookies.remove('token');
    dispatch(userLoggedOut());
  }

  useEffect(() => {
    if (location.pathname in titles) {
      setTitle(titles[location.pathname] ?? '');
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
              {userDetails.name
                ?.split(' ')
                .map((n: any[]) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700">{userDetails.email}</span>
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
