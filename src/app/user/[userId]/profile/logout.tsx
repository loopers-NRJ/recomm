"use client"
import React from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

function LogoutButton() {
  return (
    <Button
      onClick={() => void signOut({callbackUrl: '/'})}
      className="col-span-1 block cursor-pointer rounded-lg bg-gray-900 px-6 py-3 text-center font-medium leading-6 text-gray-200 hover:bg-black hover:text-white"
    >
      Log Out
    </Button>
  )
}

export default LogoutButton
