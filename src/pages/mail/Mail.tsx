import MailComponent from './components/MailContainer'
import { accounts, mails } from '@app/mock/data/data'

const Mail = () => {
  return (
    <>
      <div className="hidden flex-col md:flex">
        <MailComponent
          accounts={accounts}
          mails={mails}
          defaultLayout={undefined}
          defaultCollapsed={false}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}

export default Mail
