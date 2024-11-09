import {
  Activity,
  Box,
  CircuitBoard,
  FileText,
  Grid,
  ListTodo,
  Network,
  Power,
  Users,
  Users2,
} from 'lucide-react'
import { Button } from '@/components/Button/Button'
import { Avatar, AvatarFallback } from '@/components/Avatar/Avatar'
import { Link } from 'react-router-dom'

 const Sidebar = ()  => {
  return (
    <div className="flex h-screen w-64 flex-col bg-[#1f2937] text-white">
      <div className="p-4">
        <h1 className="text-lg font-semibold">Gridware Admin Panel</h1>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <Users className="h-4 w-4" />
            Users
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <Users2 className="h-4 w-4" />
            Customers
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <Box className="h-4 w-4" />
            Deployments
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <Power className="h-4 w-4" />
            Poles
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <Grid className="h-4 w-4" />
            Devices
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <Activity className="h-4 w-4" />
            Span Types
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <Network className="h-4 w-4" />
            Spans
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <FileText className="h-4 w-4" />
            Permits
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <ListTodo className="h-4 w-4" />
            Batch Tracking
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="#" className="flex items-center gap-3">
            <CircuitBoard className="h-4 w-4" />
            Public info circuit
          </Link>
        </Button>
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar className='rounded-[4px]'>
            <AvatarFallback className="bg-purple-600 rounded-[4px]">A</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Ali Nasir</span>
        </div>
      </div>
    </div>
  )
}
export default Sidebar;
