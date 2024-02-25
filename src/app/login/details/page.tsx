import Container from '@/components/Container'
import AuthenticatedPage from '@/hoc/AuthenticatedPage'
import DetailsForm from './details-form'
import { getServerAuthSession } from '@/server/auth'

const DetailsPage = AuthenticatedPage(async() => {
  const { user } = await getServerAuthSession() ?? {};
  return (
    <Container>
      <h1 className="text-3xl font-bold mb-4">Complete Your Profile</h1>
      <DetailsForm userData={user} />
    </Container>
  )
})

export default DetailsPage
