import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Adding dummy values to the database...");

  // cleanup before adding new values
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@voltmart.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  const alice = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@example.com",
      password: hashedPassword,
      role: "customer",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@example.com",
      password: hashedPassword,
      role: "customer",
    },
  });

  console.log("Created users");

  // Vehicles
  const vehicleData = [
    {
      brand: "Tesla",
      model: "Model 3",
      year: 2024,
      price: 42000,
      range: 358,
      color: "White",
      quantity: 12,
      imageUrls: [],
      description: "An electric sedan.",
      isHotDeal: true,
    },
    {
      brand: "Tesla",
      model: "Model Y",
      year: 2024,
      price: 48000,
      range: 330,
      color: "Black",
      quantity: 8,
      imageUrls: [],
      description: "SUV vehicle.",
      isHotDeal: false,
    },
    {
      brand: "Ford",
      model: "Mustang Mach-E",
      year: 2023,
      price: 39500,
      range: 300,
      color: "Red",
      quantity: 5,
      imageUrls: [],
      description: "An electric SUV.",
      isHotDeal: true,
    },
    {
      brand: "Chevrolet",
      model: "Bolt EUV",
      year: 2023,
      price: 27500,
      range: 247,
      color: "Blue",
      quantity: 15,
      imageUrls: [],
      description: "An electric car.",
      isHotDeal: false,
    },
    {
      brand: "Hyundai",
      model: "Ioniq 5",
      year: 2024,
      price: 44000,
      range: 303,
      color: "Silver",
      quantity: 10,
      imageUrls: [],
      description: "An electric car.",
      isHotDeal: false,
    },
    {
      brand: "Kia",
      model: "EV6",
      year: 2024,
      price: 43500,
      range: 310,
      color: "Gray",
      quantity: 7,
      imageUrls: [],
      description: "An electric car.",
      isHotDeal: true,
    },
    {
      brand: "Nissan",
      model: "Leaf",
      year: 2022,
      price: 21000,
      range: 149,
      color: "Green",
      quantity: 20,
      imageUrls: [],
      description: "An electric car.",
      isHotDeal: false,
    },
    {
      brand: "BMW",
      model: "i4",
      year: 2024,
      price: 56000,
      range: 301,
      color: "Black",
      quantity: 4,
      imageUrls: [],
      description: "An electric car.",
      isHotDeal: false,
    },
  ];

  const vehicles = [];
  for (const data of vehicleData) {
    const vehicle = await prisma.vehicle.create({ data });
    vehicles.push(vehicle);
  }

  console.log(`Created ${vehicles.length} vehicles`);

  // Cart
  const aliceCart = await prisma.cart.create({
    data: {
      userId: alice.id,
      items: {
        create: [
          { vehicleId: vehicles[0].id, quantity: 1 },
          { vehicleId: vehicles[3].id, quantity: 2 },
        ],
      },
    },
  });

  console.log("Created cart for alice with 2 items");

  // Wishlist for Bob
  await prisma.wishlistItem.createMany({
    data: [
      { userId: bob.id, vehicleId: vehicles[1].id },
      { userId: bob.id, vehicleId: vehicles[7].id },
    ],
  });

  console.log("Created wishlist items for bob");

  // Reviews
  await prisma.review.createMany({
    data: [
      {
        userId: alice.id,
        vehicleId: vehicles[0].id,
        rating: 5,
        comment: "First review.",
      },
      {
        userId: bob.id,
        vehicleId: vehicles[2].id,
        rating: 4,
        comment: "Second review.",
      },
      {
        userId: alice.id,
        vehicleId: vehicles[6].id,
        rating: 3,
        comment: "Third review.",
      },
    ],
  });

  console.log("Created reviews");

  // order
  await prisma.order.create({
    data: {
      userId: bob.id,
      totalPrice: vehicles[4].price,
      status: "completed",
      items: {
        create: [
          {
            vehicleId: vehicles[4].id,
            quantity: 1,
            priceAtPurchase: vehicles[4].price,
          },
        ],
      },
    },
  });

  console.log("Created a completed order for bob");

  console.log("Added all the fake values to db.");
}

main()
  .catch((e) => {
    console.error("failed to add the dummy values:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
