import React from 'react'
import { Skeleton } from '../ui/skeleton'

function LoadingFeatured() {
  return (
    <div className="mb-5 grid min-h-[200px] grid-cols-4 grid-rows-2 gap-2" >
      <Skeleton className="h-full w-full rounded-xl"></Skeleton>
      <Skeleton className="h-full w-full rounded-xl"></Skeleton>
      <Skeleton className="h-full w-full rounded-xl"></Skeleton>
      <Skeleton className="h-full w-full rounded-xl"></Skeleton>
      <Skeleton className="h-full w-full rounded-xl"></Skeleton>
      <Skeleton className="h-full w-full rounded-xl"></Skeleton>
      <Skeleton className="h-full w-full rounded-xl"></Skeleton>
      <Skeleton className="h-full w-full rounded-xl"></Skeleton>
      <Skeleton className="h-full w-full rounded-xl"></Skeleton>
    </div>
  )
}

export default LoadingFeatured
