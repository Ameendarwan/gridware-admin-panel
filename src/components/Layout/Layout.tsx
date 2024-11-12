import React, { FC, ReactNode } from 'react'
import Sidebar from '@app/components/Sidebar'

interface LayoutProps {
  children: ReactNode
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-100 p-4">{children}</main>
    </div>
  )
}

export default Layout
