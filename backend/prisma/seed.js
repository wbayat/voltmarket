import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Adding dummy values to the database...");

  // cleanup before adding new values
  // vehicleHistoryRecord must be cleared before vehicle, since it references it
  await prisma.vehicleHistoryRecord.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // deleteMany() doesn't reset Postgres's auto-increment sequences, so
  // without this, every reseed run would start ids higher than the last
  const tablesWithAutoincrementIds = [
    "VehicleHistoryRecord",
    "Review",
    "WishlistItem",
    "OrderItem",
    "Order",
    "CartItem",
    "Cart",
    "Vehicle",
    "User",
  ];
  for (const table of tablesWithAutoincrementIds) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), 1, false);`,
    );
  }

  // Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@voltmarket.com",
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

  const vehicleData = [
    {
      brand: "Tesla",
      model: "Model 3",
      year: 2024,
      price: 42000,
      range: 358,
      color: "White",
      quantity: 12,
      imageUrls: [
        "https://www.motorbiscuit.com/wp-content/uploads/2022/06/2023-tesla-model-3-white-shot.jpg",
        "https://www.motorbiscuit.com/wp-content/uploads/2022/06/2023-tesla-model-3-white-charging.jpg",
      ],
      description: "An electric sedan.",
      isHotDeal: true,
      condition: "NEW",
      availableColors: ["White", "Black", "Red"],
      availableInteriorColors: ["Black", "White"],
    },
    {
      brand: "Tesla",
      model: "Model Y",
      year: 2024,
      price: 48000,
      range: 330,
      color: "Black",
      quantity: 8,
      imageUrls: [
        "https://media.ed.edmunds-media.com/tesla/model-y/2024/oem/2024_tesla_model-y_4dr-suv_performance_fq_oem_1_1600.jpg",
      ],
      description: "SUV vehicle.",
      isHotDeal: false,
      condition: "NEW",
      availableColors: ["Black", "White", "Blue"],
      availableInteriorColors: ["Black", "White"],
    },
    {
      brand: "Ford",
      model: "Mustang Mach-E",
      year: 2023,
      price: 39500,
      range: 300,
      color: "Red",
      quantity: 5,
      imageUrls: [
        "https://hips.hearstapps.com/hmg-prod/images/2021-ford-mustang-mach-e-e4x-111-1625066618.jpg",
      ],
      description: "An electric SUV.",
      isHotDeal: true,
      condition: "NEW",
      availableColors: ["Red", "Black", "Gray"],
      availableInteriorColors: ["Black"],
    },
    {
      brand: "Chevrolet",
      model: "Bolt EUV",
      year: 2023,
      price: 27500,
      range: 247,
      color: "Blue",
      quantity: 15,
      imageUrls: [
        "https://static.cargurus.com/images/forsale/2026/07/25/22/04/2023_chevrolet_bolt_euv-pic-1973908341803795777-1024x768.jpeg",
      ],
      description: "An electric car.",
      isHotDeal: false,
      condition: "NEW",
      availableColors: ["Blue", "White", "Silver"],
      availableInteriorColors: ["Black", "Gray"],
    },
    {
      brand: "Hyundai",
      model: "Ioniq 5",
      year: 2024,
      price: 44000,
      range: 303,
      color: "Silver",
      quantity: 10,
      imageUrls: [
        "https://hips.hearstapps.com/mtg-prod/65a44d38bd9f880008777ef2/2024-hyundai-ioniq-5-front-view-113.jpg?w=768&width=768&q=75&format=webp",
      ],
      description: "An electric car.",
      isHotDeal: false,
      condition: "NEW",
      availableColors: ["Silver", "White", "Black"],
      availableInteriorColors: ["Black", "Beige"],
    },
    {
      brand: "Kia",
      model: "EV6",
      year: 2024,
      price: 43500,
      range: 310,
      color: "Gray",
      quantity: 7,
      imageUrls: [
        "https://cimg0.ibsrv.net/ibimg/hgm/1920x1080-1/100/903/kia-ev6_100903352.jpg",
      ],
      description: "An electric car.",
      isHotDeal: true,
      condition: "NEW",
      availableColors: ["Gray", "Red", "White"],
      availableInteriorColors: ["Black"],
    },
    {
      brand: "Nissan",
      model: "Leaf",
      year: 2022,
      price: 21000,
      range: 149,
      color: "Green",
      quantity: 20,
      imageUrls: [
        "https://i.gaw.to/content/photos/48/60/486087-nissan-leaf-2022-une-grosse-baisse-de-prix-pour-suivre-la-bolt-ev.jpg",
      ],
      description: "An electric car.",
      isHotDeal: false,
      condition: "NEW",
      availableColors: ["Green", "White", "Black"],
      availableInteriorColors: ["Black", "Gray"],
    },
    {
      brand: "BMW",
      model: "i4",
      year: 2024,
      price: 56000,
      range: 301,
      color: "Black",
      quantity: 4,
      imageUrls: [
        "https://www.privatecollectionmotors.com/imagetag/881/25/l/Used-2024-BMW-i4-M50-Gran-Coupe-M50-1732670249.jpg",
      ],
      description: "An electric car.",
      isHotDeal: false,
      condition: "NEW",
      availableColors: ["Black", "White", "Blue"],
      availableInteriorColors: ["Black", "Beige"],
    },
    {
      brand: "Tesla",
      model: "Model S",
      year: 2020,
      price: 34000,
      range: 370,
      color: "Blue",
      quantity: 2,
      imageUrls: [
        "https://i.gaw.to/vehicles/photos/40/22/402217-2020-tesla-model-s.jpg?1024x640",
      ],
      description: "A well-maintained used Model S.",
      isHotDeal: false,
      condition: "USED",
      mileage: 42000,
      availableColors: ["Blue"],
      availableInteriorColors: ["Black"],
    },
    {
      brand: "Nissan",
      model: "Leaf",
      year: 2019,
      price: 15000,
      range: 130,
      color: "White",
      quantity: 3,
      imageUrls: [
        "https://smartcdn.gprod.postmedia.digital/driving/wp-content/uploads/2019/01/2019-nissan-leaf-plus-front.jpg",
      ],
      description: "A budget-friendly used Leaf.",
      isHotDeal: false,
      condition: "USED",
      mileage: 58000,
      availableColors: ["White"],
      availableInteriorColors: ["Gray"],
    },
  ];

  const vehicles = [];
  for (const data of vehicleData) {
    const vehicle = await prisma.vehicle.create({ data });
    vehicles.push(vehicle);
  }

  console.log(`Created ${vehicles.length} vehicles`);

  // Vehicle history records for the used vehicles
  const usedModelS = vehicles.find(
    (v) => v.model === "Model S" && v.condition === "USED",
  );
  const usedLeaf = vehicles.find(
    (v) => v.model === "Leaf" && v.condition === "USED",
  );

  if (usedModelS) {
    await prisma.vehicleHistoryRecord.createMany({
      data: [
        {
          vehicleId: usedModelS.id,
          eventType: "accident",
          description: "Minor rear-end collision, bumper replaced.",
          eventDate: new Date("2022-03-15"),
        },
        {
          vehicleId: usedModelS.id,
          eventType: "service",
          description: "Routine battery health check, passed.",
          eventDate: new Date("2023-06-01"),
        },
      ],
    });
  }

  if (usedLeaf) {
    await prisma.vehicleHistoryRecord.createMany({
      data: [
        {
          vehicleId: usedLeaf.id,
          eventType: "owner_change",
          description: "Sold by original owner, single previous owner.",
          eventDate: new Date("2023-01-10"),
        },
      ],
    });
  }

  console.log("Created vehicle history records for used vehicles");

  const aliceCart = await prisma.cart.create({
    data: {
      userId: alice.id,
      items: {
        create: [
          {
            vehicleId: vehicles[0].id,
            quantity: 1,
            selectedColor: vehicles[0].availableColors[0],
            selectedInteriorColor: vehicles[0].availableInteriorColors[0],
          },
          {
            vehicleId: vehicles[3].id,
            quantity: 2,
            selectedColor: vehicles[3].availableColors[1],
            selectedInteriorColor: vehicles[3].availableInteriorColors[0],
          },
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
            selectedColor: vehicles[4].availableColors[0],
            selectedInteriorColor: vehicles[4].availableInteriorColors[0],
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
