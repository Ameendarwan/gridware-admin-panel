import React, { FC, ReactNode } from 'react';
import Sidebar from '@app/components/Sidebar';
import Header from '@app/components/Header/Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-100 p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
