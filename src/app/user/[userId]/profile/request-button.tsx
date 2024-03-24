"use client"

import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import type { User } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function SendRequestButton({ from, to }: { from: User, to: string }) {

     const request = api.inbox.create.useMutation({
          onSuccess: () => {
               toast.success('Request Sent')
          }
     })

     return (
          <div className='flex flex-col'>
               <Button size="sm"
                    className='w-fit'
                    disabled={request.isLoading || !from.mobileVerified}
                    onClick={() => {
                         request.mutate({ to })
                    }}>
                    {request.isLoading && <Loader2 className="animate-spin mr-1" />}
                    Send Request
               </Button>
               {!from.mobileVerified && <p className='text-xs'>
                    Enable your mobile number to send request
               </p>}
          </div>
     )
}

export default SendRequestButton
