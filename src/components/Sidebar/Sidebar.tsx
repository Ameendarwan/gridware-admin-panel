import { Activity, Box, CircuitBoard, FileText, Grid, ListTodo, Network, Power, Users, Users2 } from 'lucide-react'
import { Button } from '@app/components/Button/Button'
import { Avatar, AvatarFallback } from '@app/components/Avatar/Avatar'
import { Link } from 'react-router-dom'

const menuItems = [
  { label: 'Users', icon: Users, to: '#' },
  { label: 'Customers', icon: Users2, to: '#' },
  { label: 'Deployments', icon: Box, to: '#' },
  { label: 'Poles', icon: Power, to: '#' },
  { label: 'Devices', icon: Grid, to: '#' },
  { label: 'Span Types', icon: Activity, to: '#' },
  { label: 'Spans', icon: Network, to: '#' },
  { label: 'Permits', icon: FileText, to: '#' },
  { label: 'Batch Tracking', icon: ListTodo, to: '#' },
  { label: 'Public info circuit', icon: CircuitBoard, to: '#' },
]

const Sidebar = () => {
  return (
    <div className="flex h-screen w-64 flex-col bg-[#1d273b] text-white">
      <div className="p-4">
        <h1 className="text-lg font-semibold">Gridware Admin Panel</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {menuItems.map(({ label, icon: Icon, to }) => (
          <Button
            key={label}
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
            asChild>
            <Link to={to} className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="rounded-[4px]">
            <AvatarFallback className="rounded-[4px] bg-purple-600">A</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Ali Nasir</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
