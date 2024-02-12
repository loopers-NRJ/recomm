/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import superjson from "superjson";
import { ZodError } from "zod";

import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { userPayload } from "@/types/prisma";
import { adminPageRegex, requestPathHeaderName } from "@/utils/constants";
import { getLogger } from "@/utils/logger";
import type { AccessType } from "@prisma/client";
import { TRPCError, initTRPC } from "@trpc/server";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */

export const createTRPCContext = async (opts: { headers: Headers }) => {
  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession();
  return {
    session,
    prisma,
    headers: opts.headers,
    logger: getLogger(prisma),
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
  let userAccesses: AccessType[] = [];
  // Update user last active, latitude and longitude
  if (ctx.session?.user) {
    const user = await prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        lastActive: new Date(),
      },
      include: userPayload.include,
    });
    if (user.role) {
      userAccesses = user.role.accesses.map((access) => access.type);
    }

    ctx.session.user = user;
  }

  const url = ctx.headers.get(requestPathHeaderName);
  const isAdminPage = url?.match(adminPageRegex) ?? false;

  return next({
    ctx: {
      session: {
        ...ctx.session,
        userAccesses,
      },
      isAdminPage,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const getProcedure = (
  accessType:
    | AccessType
    | [AccessType, AccessType, ...AccessType[]]
    | ((type: AccessType[]) => boolean),
) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const isAllowed =
      accessType instanceof Array
        ? ctx.session.userAccesses.some((access) => accessType.includes(access))
        : accessType instanceof Function
          ? accessType(ctx.session.userAccesses)
          : ctx.session.userAccesses.includes(accessType);

    if (!isAllowed) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
};
