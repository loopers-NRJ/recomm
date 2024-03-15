import Container from '@/components/Container'
import LoadingFeatured from '@/components/loading/LoadingFeatured'
import LoadingProducts from '@/components/loading/LoadingProducts'

function Loading() {
  return (
    <Container>
      <LoadingFeatured />
      <LoadingProducts />
    </Container>
  )
}

export default Loading
