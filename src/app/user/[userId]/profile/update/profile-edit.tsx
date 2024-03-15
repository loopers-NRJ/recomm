"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import type { User } from "@prisma/client";
import { Check, Edit3, Loader2, UserIcon } from "lucide-react";
import { useState } from "react";

function ProfileEditArea({ user }: { user: User }) {

     const updateInfo = api.user.update.useMutation()

     const [name, setName] = useState(user.name ?? undefined)
     const [editingName, setEditingName] = useState(false)

     return (
          <section className="flex w-full items-center p-3 gap-3">
               <div className="edit-profile relative overflow-visible" >
                    <Avatar className="h-32 w-32 border shadow-sm">
                         <AvatarImage src={user.image ?? undefined} />
                         <AvatarFallback>
                              <UserIcon className="h-full w-full p-4" />
                         </AvatarFallback>
                    </Avatar>
                    <Edit3 className="absolute w-8 h-8 right-3 bottom-0 border bg-slate-50 rounded-full p-1" />
               </div>
               <div className="name-edit flex flex-col gap-3">
                    {editingName ?
                         <div className="flex items-center gap-3">
                              <Input
                                   type="text"
                                   value={name}
                                   onChange={(e) => setName(e.target.value)}
                                   className="text-lg"
                              />
                              {updateInfo.isLoading ? 
                              <Loader2 className="w-6 h-6 animate-spin" /> :
                              <Check 
                                   onClick={async () => {
                                        await updateInfo.mutateAsync({ name })
                                        setEditingName(false)
                                   }}
                                   className="w-6 h-6 text-green-800" 
                              /> }
                         </div> :
                         <div className="flex gap-3 items-center h-10">
                              <span className="text-lg font-bold">{ name }</span>
                              <Edit3 onClick={() => setEditingName(true)} className="w-6 h-6" />
                         </div>
                    }
                    <Button size="sm" className="w-fit" asChild>
                         <a href={`/user/${user.id}/profile`}>Go to Profile Page</a>
                    </Button>
               </div>
          </section>
     )
}

export default ProfileEditArea
