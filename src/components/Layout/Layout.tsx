import { FC, ReactNode } from 'react';

import Header from '@app/components/Header';
import Sidebar from '@app/components/Sidebar';
import { Toaster } from '../Toaster/Toaster';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden !font-mont">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-auto">
        <Header />
        <main className="flex-1 overflow-auto bg-white p-0">{children}</main>
      </div>
      <Toaster />
    </div>
  );
};

export default Layout;
