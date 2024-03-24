import React from 'react'
import { Skeleton } from '../ui/skeleton'

function LoadingFeatured() {
  return (
    <>
      <Skeleton className="mb-5 sm:hidden rounded-xl w-full h-[167px]" />
      <div className="grid mb-5 min-h-[100px] grid-cols-4 grid-rows-1 gap-2" >
        <Skeleton className="h-full w-full rounded-xl"></Skeleton>
        <Skeleton className="h-full w-full rounded-xl"></Skeleton>
        <Skeleton className="h-full w-full rounded-xl"></Skeleton>
        <Skeleton className="h-full w-full rounded-xl"></Skeleton>
      </div>
    </>
  )
}

export default LoadingFeatured
