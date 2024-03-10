// import Container from "@/components/Container";
// import AuthenticatedPage from "@/hoc/AuthenticatedPage";
// import { api } from "@/trpc/server";
// import Link from "next/link";

// async function NotificationPage() {
//   const updates = await api.user.notifications.query();
//   return (
//     <main>
//       <Container>
//         <div className="flex h-[500px] items-center justify-center font-semibold">
//           <div>
//             {updates.length === 0 && <>No Notifications...</>}
//             {updates.map((product) => (
//               <div key={product.id} className="mb-2">
//                 Update at - {product.room.updatedAt.toLocaleString()}
//                 <Link
//                   className="font-bold text-blue-400 underline"
//                   href={product.slug}
//                 >
//                   Click here
//                 </Link>
//               </div>
//             ))}
//           </div>
//         </div>
//       </Container>
//     </main>
//   );
// }
// export default AuthenticatedPage(NotificationPage, "/notifications");

import Container from "@/components/Container";
import React from "react";

export default function page() {
  return <Container>
    <main className="flex justify-center items-center font-medium text-sm h-52">
      No notifications...
    </main>
  </Container>;
}
