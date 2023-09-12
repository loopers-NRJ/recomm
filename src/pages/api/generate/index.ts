// import { prisma } from "@/server/db";
// import { NextApiRequest, NextApiResponse } from "next";

// async function seed() {
//   // Seed Categories
//   const categories = [
//     { name: "Electronics", picture: "electronics.jpg" },
//     { name: "Clothing", picture: "clothing.jpg" },
//     { name: "Furniture", picture: "furniture.jpg" },
//     { name: "Beauty", picture: "beauty.jpg" },
//     { name: "Sports", picture: "sports.jpg" },
//     { name: "Toys", picture: "toys.jpg" },
//     { name: "Groceries", picture: "groceries.jpg" },
//     { name: "Jewelry", picture: "jewelry.jpg" },
//     { name: "Health", picture: "health.jpg" },
//     { name: "Pets", picture: "pets.jpg" },
//     { name: "Home Decor", picture: "decor.jpg" },
//     { name: "Tools", picture: "tools.jpg" },
//   ];

//   await prisma.category.createMany({
//     data: categories,
//   });

//   // Seed Brands
//   const brands = [
//     { name: "Apple", picture: "apple.jpg" },
//     { name: "Nike", picture: "nike.jpg" },
//     { name: "Sony", picture: "sony.jpg" },
//     { name: "Adidas", picture: "adidas.jpg" },
//     { name: "Coca-Cola", picture: "cocacola.jpg" },
//     { name: "L'Oreal", picture: "loreal.jpg" },
//     { name: "AmazonBasics", picture: "amazonbasics.jpg" },
//     { name: "Puma", picture: "puma.jpg" },
//     { name: "Microsoft", picture: "microsoft.jpg" },
//     { name: "LEGO", picture: "lego.jpg" },
//     { name: "KitchenAid", picture: "kitchenaid.jpg" },
//   ];

//   await prisma.brand.createMany({
//     data: brands,
//   });

//   // // Fetch created brands to get their IDs
//   const fetchedBrands = await prisma.brand.findMany({
//     where: {
//       name: {
//         in: brands.map((brand) => brand.name),
//       },
//     },
//   });

//   const rooms = Array.from({ length: 12 }, (_, i) => ({
//     closedAt: new Date(Date.now() + i * 60 * 60 * 1000),
//   }));

//   await prisma.room.createMany({
//     data: rooms,
//   });

//   // Fetch the rooms
//   const fetchedRooms = await prisma.room.findMany({
//     where: {
//       closedAt: {
//         in: rooms.map((room) => room.closedAt),
//       },
//     },
//   });

//   // Seed Models
//   const models = [
//     {
//       name: "iPhone 12",
//       brandId: fetchedBrands.find((brand) => brand.name === "Apple")!.id,
//     },
//     {
//       name: "iPhone 13",
//       brandId: fetchedBrands.find((brand) => brand.name === "Apple")!.id,
//     },
//     {
//       name: "Air Max 90",
//       brandId: fetchedBrands.find((brand) => brand.name === "Nike")!.id,
//     },
//     {
//       name: "Air Max 95",
//       brandId: fetchedBrands.find((brand) => brand.name === "Nike")!.id,
//     },
//     {
//       name: "PlayStation 5",
//       brandId: fetchedBrands.find((brand) => brand.name === "Sony")!.id,
//     },
//     {
//       name: "UltraBoost",
//       brandId: fetchedBrands.find((brand) => brand.name === "Adidas")!.id,
//     },
//     {
//       name: "Classic",
//       brandId: fetchedBrands.find((brand) => brand.name === "Puma")!.id,
//     },
//     {
//       name: "Xbox Series X",
//       brandId: fetchedBrands.find((brand) => brand.name === "Microsoft")!.id,
//     },
//     {
//       name: "L'Oreal Paris",
//       brandId: fetchedBrands.find((brand) => brand.name === "L'Oreal")!.id,
//     },
//     {
//       name: "Air Fryer",
//       brandId: fetchedBrands.find((brand) => brand.name === "AmazonBasics")!.id,
//     },
//     {
//       name: "M1 MacBook Air",
//       brandId: fetchedBrands.find((brand) => brand.name === "Apple")!.id,
//     },
//     {
//       name: "LEGO Technic",
//       brandId: fetchedBrands.find((brand) => brand.name === "LEGO")!.id,
//     },
//     {
//       name: "Jorden 1",
//       brandId: fetchedBrands.find((brand) => brand.name === "Nike")!.id,
//     },
//     {
//       name: "Kitchen Mixer",
//       brandId: fetchedBrands.find((brand) => brand.name === "KitchenAid")!.id,
//     },
//   ];

//   await prisma.model.createMany({
//     data: models,
//   });

//   // Fetch created models to get their IDs
//   const createdModels = await prisma.model.findMany({
//     where: {
//       name: {
//         in: models.map((model) => model.name),
//       },
//     },
//   });

//   // Fetch a User with email
//   const user = await prisma.user.findUnique({
//     where: {
//       email: "imnaveenbharath@gmail.com",
//     },
//   });

//   // Seed Products
//   const products = [
//     {
//       price: 999.99,
//       description: "The latest iPhone with advanced features.",
//       images: ["iphone12.jpg"],
//       modelId: createdModels.find((model) => model.name === "iPhone 12")!.id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[0]!.id,
//     },
//     {
//       price: 149.99,
//       description: "Classic sneakers known for comfort and style.",
//       images: ["air_max_90.jpg"],
//       modelId: createdModels.find((model) => model.name === "Air Max 90")!.id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[1]!.id,
//     },
//     {
//       price: 1099.99,
//       description: "The latest iPhone with advanced features.",
//       images: ["iphone13.jpg"],
//       modelId: createdModels.find((model) => model.name === "iPhone 13")!.id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[2]!.id,
//     },
//     {
//       price: 169.99,
//       description: "Iconic sneakers known for style and comfort.",
//       images: ["air_max_95.jpg"],
//       modelId: createdModels.find((model) => model.name === "Air Max 95")!.id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[3]!.id,
//     },
//     {
//       price: 249.99,
//       description: "Next-gen gaming console for immersive gameplay.",
//       images: ["ps5.jpg"],
//       modelId: createdModels.find((model) => model.name === "PlayStation 5")!
//         .id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[4]!.id,
//     },
//     {
//       price: 49.99,
//       description: "Classic toy for creative building and play.",
//       images: ["lego_technic.jpg"],
//       modelId: createdModels.find((model) => model.name === "LEGO Technic")!.id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[5]!.id,
//     },
//     {
//       price: 299.99,
//       description: "Powerful laptop for work and entertainment.",
//       images: ["laptop.jpg"],
//       modelId: createdModels.find((model) => model.name === "M1 MacBook Air")!
//         .id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[6]!.id,
//     },
//     {
//       price: 89.99,
//       description: "Versatile kitchen appliance for healthier cooking.",
//       images: ["air_fryer.jpg"],
//       modelId: createdModels.find((model) => model.name === "Air Fryer")!.id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[7]!.id,
//     },
//     {
//       price: 79.99,
//       description: "Bestselling running shoes for comfort and performance.",
//       images: ["running_shoes.jpg"],
//       modelId: createdModels.find((model) => model.name === "Jorden 1")!.id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[8]!.id,
//     },
//     {
//       price: 199.99,
//       description: "Premium beauty product for a radiant look.",
//       images: ["loreal_paris.jpg"],
//       modelId: createdModels.find((model) => model.name === "L'Oreal Paris")!
//         .id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[9]!.id,
//     },
//     {
//       price: 399.99,
//       description: "Advanced gaming console with high-performance features.",
//       images: ["xbox_series_x.jpg"],
//       modelId: createdModels.find((model) => model.name === "Xbox Series X")!
//         .id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[10]!.id,
//     },
//     {
//       price: 299.99,
//       description: "Innovative kitchen appliance for baking enthusiasts.",
//       images: ["kitchen_mixer.jpg"],
//       modelId: createdModels.find((model) => model.name === "Kitchen Mixer")!
//         .id,
//       sellerId: user!.id,
//       roomId: fetchedRooms[11]!.id,
//     },
//   ];

//   interface product {
//     price: number;
//     description: string;
//     images: string[];
//     modelId: string;
//     sellerId: string;
//     roomId: string;
//   }

//   const createdProducts = await prisma.product.createMany({
//     data: products as product[],
//   });

//   console.log(`Created ${createdProducts.count} products`);
// }

// export default async function handler(
//   _req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   try {
//     await seed();
//     res.status(200).json({ message: "Seed successful" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Seed failed" });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
