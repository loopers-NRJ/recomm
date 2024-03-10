import { type PrismaClient, WishStatus } from "@prisma/client";
import type { SingleProductPayloadIncluded } from "@/types/prisma";
import { getLogger } from "@/utils/logger";

export function updateWishStatus(
  prisma: PrismaClient,
  product: SingleProductPayloadIncluded,
) {
  void prisma
    .$transaction(async (prisma) => {
      // Updating all the wishes with the categoryId to available
      await updateCategoryWishes(prisma as PrismaClient, product);
      // Updating all the wishes with the modelId to available
      await updateModelWishes(prisma as PrismaClient, product);
      // Updating all the wishes with the brandId to available
      await updateBrandWishes(prisma as PrismaClient, product);
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

async function updateCategoryWishes(
  prisma: PrismaClient,
  product: SingleProductPayloadIncluded,
) {
  const categoryWishedUsers = await prisma.user.findMany({
    where: {
      wishes: {
        some: {
          categoryId: product.model.categoryId,
          status: WishStatus.pending,
          lowerBound: {
            gte: product.price,
          },
          upperBound: {
            lte: product.price,
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
  const categoryWishedWisheIds = categoryWishedUsers.flatMap((user) =>
    user.wishes.map((wish) => wish.id),
  );
  const categoryWishedUsersIds = categoryWishedUsers.map((user) => user.id);

  await prisma.wish.updateMany({
    where: {
      id: {
        in: categoryWishedWisheIds,
      },
    },
    data: {
      status: WishStatus.available,
    },
  });
  await prisma.notification.createMany({
    data: categoryWishedUsersIds.map((userId) => ({
      link: `/products/${product.slug}`,
      title: `New product in ${product.model.category.name}`,
      description: `${product.seller.name} has posted a new product in '${product.model.category.name}' category that you wished for`,
      userId,
    })),
  });
}

async function updateModelWishes(
  prisma: PrismaClient,
  product: SingleProductPayloadIncluded,
) {
  const modelWishedUsers = await prisma.user.findMany({
    where: {
      wishes: {
        some: {
          modelId: product.modelId,
          status: WishStatus.pending,
          lowerBound: {
            gte: product.price,
          },
          upperBound: {
            lte: product.price,
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
  const modelWishedWisheIds = modelWishedUsers.flatMap((user) =>
    user.wishes.map((wish) => wish.id),
  );
  const modelWishedUsersIds = modelWishedUsers.map((user) => user.id);

  await prisma.wish.updateMany({
    where: {
      id: {
        in: modelWishedWisheIds,
      },
    },
    data: {
      status: WishStatus.available,
    },
  });
  await prisma.notification.createMany({
    data: modelWishedUsersIds.map((userId) => ({
      link: `/products/${product.slug}`,
      title: `New product in ${product.model.name}`,
      description: `${product.seller.name} has posted a new product in '${product.model.name}' model that you wished for`,
      userId,
    })),
  });
}

async function updateBrandWishes(
  prisma: PrismaClient,
  product: SingleProductPayloadIncluded,
) {
  const brandWishedUsers = await prisma.user.findMany({
    where: {
      wishes: {
        some: {
          brandId: product.model.brandId,
          status: WishStatus.pending,
          lowerBound: {
            gte: product.price,
          },
          upperBound: {
            lte: product.price,
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
  const brandWishedWisheIds = brandWishedUsers.flatMap((user) =>
    user.wishes.map((wish) => wish.id),
  );
  const brandWishedUsersIds = brandWishedUsers.map((user) => user.id);

  await prisma.wish.updateMany({
    where: {
      id: {
        in: brandWishedWisheIds,
      },
    },
    data: {
      status: WishStatus.available,
    },
  });
  await prisma.notification.createMany({
    data: brandWishedUsersIds.map((userId) => ({
      link: `/products/${product.slug}`,
      title: `New product in ${product.model.brand.name}`,
      description: `${product.seller.name} has posted a new product in '${product.model.brand.name}' brand that you wished for`,
      userId,
    })),
  });
}
