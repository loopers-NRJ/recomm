import Container from '@/components/Container'

function VerifyPage() {
  return (
    <Container className='flex flex-col text-center min-h-[500px] items-center justify-center'>
      <CheckMark />
      Check Email Inbox
      <p className='text-sm font-light w-3/4 text-gray-500 mt-2'>
        We've sent a verification email to your email address. Please click the link in the email to verify your account.
      </p>
    </Container>
  )
}

function CheckMark() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
}

export default VerifyPage
