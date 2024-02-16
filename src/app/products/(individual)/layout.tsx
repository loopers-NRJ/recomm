import { Toaster } from '@/components/ui/toaster'
import React from 'react'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      {children}
      <Toaster />
    </main>
  )
}

export default Layout
