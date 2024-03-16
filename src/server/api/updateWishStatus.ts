import { type PrismaClient, WishStatus } from "@prisma/client";
import type { SingleProductPayloadIncluded } from "@/types/prisma";
import { getLogger } from "@/utils/logger";

export function updateWishStatus(
  prisma: PrismaClient,
  product: SingleProductPayloadIncluded,
) {
  void prisma
    .$transaction(async (prisma) => {
      const { categoryWishIds, categoryWishedUserIds } =
        await getCategoryWishedUsers(prisma as PrismaClient, product);

      const { modelWisheIds, modelWishedUsersIds } = await getModelWishedUsers(
        prisma as PrismaClient,
        product,
      );

      const { brandWishIds, brandWishedUsersIds } = await getBrandWishedUsers(
        prisma as PrismaClient,
        product,
      );

      const wishIds = Array.from(
        new Set([...categoryWishIds, ...modelWisheIds, ...brandWishIds]),
      );

      const userIds = Array.from(
        new Set([
          ...categoryWishedUserIds,
          ...brandWishedUsersIds,
          ...modelWishedUsersIds,
        ]),
      );

      await prisma.wish.updateMany({
        where: {
          id: {
            in: wishIds,
          },
        },
        data: {
          status: WishStatus.available,
        },
      });

      await prisma.notification.createMany({
        data: userIds.map((userId) => ({
          link: `/products/${product.slug}`,
          title: `Exciting News: New Product Alert!`,
          description: `a new product matching your preferences is now available! ${product.seller.name} has posted a new in '${product.model.name}', Check it out.`,
          userId,
        })),
      });
    })
    .catch(async (error) => {
      await getLogger(prisma).error({
        message: "cannot update wishes",
        detail: JSON.stringify({
          procedure: "createProduct",
          message: "cannot update wishes",
          error,
        }),
        state: "common",
      });
    });
}

async function getCategoryWishedUsers(
  prisma: PrismaClient,
  product: SingleProductPayloadIncluded,
) {
  const categoryWishedUsers = await prisma.user.findMany({
    where: {
      wishes: {
        some: {
          categoryId: product.model.categoryId,
          lowerBound: {
            lte: product.price,
          },
          upperBound: {
            gte: product.price,
          },
        },
      },
    },
    select: {
      id: true,
      wishes: {
        select: {
          id: true,
        },
      },
    },
  });

  const categoryWishIds = categoryWishedUsers.flatMap((user) =>
    user.wishes.map((wish) => wish.id),
  );
  const categoryWishedUserIds = categoryWishedUsers.map((user) => user.id);
  return { categoryWishedUserIds, categoryWishIds };
}

async function getModelWishedUsers(
  prisma: PrismaClient,
  product: SingleProductPayloadIncluded,
) {
  const modelWishedUsers = await prisma.user.findMany({
    where: {
      wishes: {
        some: {
          modelId: product.modelId,
          lowerBound: {
            lte: product.price,
          },
          upperBound: {
            gte: product.price,
          },
        },
      },
    },
    select: {
      id: true,
      wishes: {
        select: {
          id: true,
        },
      },
    },
  });
  const modelWisheIds = modelWishedUsers.flatMap((user) =>
    user.wishes.map((wish) => wish.id),
  );
  const modelWishedUsersIds = modelWishedUsers.map((user) => user.id);

  return { modelWisheIds, modelWishedUsersIds };
}

async function getBrandWishedUsers(
  prisma: PrismaClient,
  product: SingleProductPayloadIncluded,
) {
  const brandWishedUsers = await prisma.user.findMany({
    where: {
      wishes: {
        some: {
          brandId: product.model.brandId,
          lowerBound: {
            lte: product.price,
          },
          upperBound: {
            gte: product.price,
          },
        },
      },
    },
    select: {
      id: true,
      wishes: {
        select: {
          id: true,
        },
      },
    },
  });

  const brandWishIds = brandWishedUsers.flatMap((user) =>
    user.wishes.map((wish) => wish.id),
  );

  const brandWishedUsersIds = brandWishedUsers.map((user) => user.id);

  return { brandWishIds, brandWishedUsersIds };
}
