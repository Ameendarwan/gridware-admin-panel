import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@app/lib/utils'
import { TooltipProvider } from '@app/components/Tooltip/Tooltip'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@app/components/Resizeable/Resizable'
import AccountSwitcher from '../AccountSwitcher/AccountSwitcher'
import { Separator } from '@radix-ui/react-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/Tabs/Tabs'
import { Input } from '@app/components/Input/Input'
import MailList from '../MailList/MailList'
import MailDisplay from '../MailDisplay/MailDisplay'

interface MailProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  mails: any[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

const MailContainer = ({
  accounts,
  mails,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(sizes)}`
        }}
        className="h-full max-h-[800px] items-stretch">
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`
          }}
          onResize={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`
          }}
          className={cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out')}>
          <div className={cn('flex h-[52px] items-center justify-center', isCollapsed ? 'h-[52px]' : 'px-2')}>
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">
                  All mail
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-zinc-600 dark:text-zinc-200">
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={mails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList items={mails.filter(item => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <MailDisplay mail={null} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}

export default MailContainer
