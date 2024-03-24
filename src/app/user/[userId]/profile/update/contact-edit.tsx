"use client"

import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'
import type { User } from '@prisma/client'
import { Check, Edit3, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

function ContactEditArea({ user }: { user: User }) {

     const [mobileEditing, setMobileEditing] = useState(false)
     const [mobile, setMobile] = useState(user.mobile ?? "")
     const [active, setActive] = useState(user.mobileVerified)

     const updateInfo = api.user.update.useMutation()

     return (
          <section>
               <header className="mb-5 mt-8 px-2 w-full text-xl leading-none font-bold">Contact Info</header>
               <div className="flex flex-col gap-3 px-2">
                    <div className="email">
                         <h2 className='font-semibold leading-none mb-1'>Email</h2>
                         <p className='h-8 flex items-center'> {user.email} </p>
                    </div>
                    <div className="mobile">
                         <h2 className='font-semibold flex items-center leading-none mb-1'>
                              <span>Mobile</span>
                              <Switch checked={active} 
                                   className='scale-75' 
                                   onCheckedChange={async (mobileVerified) => {
                                        setActive(mobileVerified)
                                        await updateInfo.mutateAsync({ mobileVerified })
                                   }} 
                              />
                         </h2>
                         {mobileEditing ?
                              <div className="flex items-center gap-3">
                                   <div className='flex items-center gap-2'>
                                        <span className='font-bold text-sm text-gray-600'>+91</span>
                                        <Input
                                             type="number"
                                             value={mobile}
                                             onChange={(e) => setMobile(e.target.value)}
                                             className="h-8"
                                        />
                                   </div>
                                   {updateInfo.isLoading ?
                                        <Loader2 className='w-6 h-6 animate-spin' /> :
                                        <Check
                                             className="text-green-800 w-6 h-6"
                                             onClick={async () => {
                                                  await updateInfo
                                                       .mutateAsync({ mobile })
                                                       .then(() => {
                                                            setMobileEditing(false)
                                                       })
                                                       .catch(() => {
                                                            toast.error("Invalid input")
                                                       })
                                             }}
                                        />
                                   }
                              </div> :
                              <div className='flex gap-3 h-8 items-center'>
                                   <p> {mobile} </p>
                                   <Edit3 onClick={() => setMobileEditing(true)} className='w-6 h-6' />
                              </div>
                         }
                    </div>
               </div>
          </section>
     )
}

export default ContactEditArea
