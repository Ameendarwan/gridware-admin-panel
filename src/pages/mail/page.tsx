import Mail from './components/mail';
import { accounts, mails } from './data'

const MailPage = () => {
  return (
    <>
      <div className="hidden flex-col md:flex">
        <Mail
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

export default MailPage;
