import prisma from "../utils/prismaClient.js";

const buildVehicleRanking = (groups, vehiclesById, metricName, getValue) => {
  return [...groups]
    .sort((a, b) => getValue(b) - getValue(a))
    .slice(0, 5)
    .map((group) => ({
      vehicle: vehiclesById.get(group.vehicleId),
      [metricName]: getValue(group),
    }))
    .filter((entry) => entry.vehicle);
};

// usage analytics controller for the admin dashboard
export const getUsageAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      activeVehicles,
      cartsCreated,
      cartQuantity,
      wishlistSaves,
      reviewsSubmitted,
      ordersPlaced,
      completedOrders,
      vehiclesSold,
      recentUsers,
      wishlistGroups,
      reviewGroups,
      cartGroups,
      purchaseGroups,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: { role: "customer" },
      }),

      prisma.vehicle.count({
        where: { isActive: true },
      }),

      prisma.cart.count(),

      prisma.cartItem.aggregate({
        _sum: { quantity: true },
      }),

      prisma.wishlistItem.count(),

      prisma.review.count(),

      prisma.order.count(),

      prisma.order.count({
        where: { status: "completed" },
      }),

      prisma.orderItem.aggregate({
        where: {
          order: {
            is: { status: "completed" },
          },
        },
        _sum: { quantity: true },
      }),

      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),

      prisma.wishlistItem.groupBy({
        by: ["vehicleId"],
        _count: { vehicleId: true },
      }),

      prisma.review.groupBy({
        by: ["vehicleId"],
        _count: { vehicleId: true },
        _avg: { rating: true },
      }),

      prisma.cartItem.groupBy({
        by: ["vehicleId"],
        _sum: { quantity: true },
      }),

      prisma.orderItem.groupBy({
        by: ["vehicleId"],
        where: {
          order: {
            is: { status: "completed" },
          },
        },
        _sum: { quantity: true },
      }),
    ]);

    const vehicleIds = [
      ...new Set(
        [
          ...wishlistGroups,
          ...reviewGroups,
          ...cartGroups,
          ...purchaseGroups,
        ].map((group) => group.vehicleId),
      ),
    ];

    const vehicles =
      vehicleIds.length === 0
        ? []
        : await prisma.vehicle.findMany({
            where: {
              id: { in: vehicleIds },
            },
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
            },
          });

    const vehiclesById = new Map(
      vehicles.map((vehicle) => [vehicle.id, vehicle]),
    );

    const mostWishlistedVehicles = buildVehicleRanking(
      wishlistGroups,
      vehiclesById,
      "wishlistCount",
      (group) => group._count.vehicleId,
    );

    const mostReviewedVehicles = buildVehicleRanking(
      reviewGroups,
      vehiclesById,
      "reviewCount",
      (group) => group._count.vehicleId,
    ).map((entry) => {
      const group = reviewGroups.find(
        (item) => item.vehicleId === entry.vehicle.id,
      );

      return {
        ...entry,
        averageRating: Number((group?._avg.rating ?? 0).toFixed(2)),
      };
    });

    const mostAddedToCartVehicles = buildVehicleRanking(
      cartGroups,
      vehiclesById,
      "quantityInCarts",
      (group) => group._sum.quantity ?? 0,
    );

    const mostPurchasedVehicles = buildVehicleRanking(
      purchaseGroups,
      vehiclesById,
      "quantityPurchased",
      (group) => group._sum.quantity ?? 0,
    );

    res.json({
      generatedAt: new Date().toISOString(),

      overview: {
        totalUsers,
        totalCustomers,
        activeVehicles,
        cartsCreated,
        vehiclesCurrentlyInCarts: cartQuantity._sum.quantity ?? 0,
        wishlistSaves,
        reviewsSubmitted,
        ordersPlaced,
        completedOrders,
        vehiclesSold: vehiclesSold._sum.quantity ?? 0,
      },

      popularVehicles: {
        mostWishlistedVehicles,
        mostReviewedVehicles,
        mostAddedToCartVehicles,
        mostPurchasedVehicles,
      },

      recentRegistrations: recentUsers,
    });
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ message: "Something went wrong fetching usage analytics " });
  }
};

//sales analytics controller for the admin dashboard
const roundMoney = (value) => Number(value.toFixed(2));

export const getSalesAnalytics = async (req, res) => {
  try {
    const vehicleIdQuery = req.query.vehicleId;
    let vehicleId;

    if (vehicleIdQuery !== undefined) {
      vehicleId = Number(vehicleIdQuery);

      if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
        return res
          .status(400)
          .json({ message: "vehicleId must be a positive integer" });
      }

      const vehicleExists = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { id: true },
      });

      if (!vehicleExists) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { is: { status: "completed" } },
        ...(vehicleId ? { vehicleId } : {}),
      },
      select: {
        orderId: true,
        quantity: true,
        priceAtPurchase: true,
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
          },
        },
      },
    });

    const vehicleSales = new Map();
    const orderIds = new Set();

    let totalUnitsSold = 0;
    let totalRevenue = 0;

    for (const item of orderItems) {
      const quantity = item.quantity;
      const priceAtPurchase = Number(item.priceAtPurchase);
      const itemRevenue = quantity * priceAtPurchase;

      orderIds.add(item.orderId);
      totalUnitsSold += quantity;
      totalRevenue += itemRevenue;

      const currentVehicle = vehicleSales.get(item.vehicle.id) ?? {
        vehicle: item.vehicle,
        unitsSold: 0,
        revenue: 0,
      };

      currentVehicle.unitsSold += quantity;
      currentVehicle.revenue += itemRevenue;

      vehicleSales.set(item.vehicle.id, currentVehicle);
    }

    const perVehicle = [...vehicleSales.values()]
      .map((entry) => ({
        vehicle: entry.vehicle,
        unitsSold: entry.unitsSold,
        revenue: roundMoney(entry.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      generatedAt: new Date().toISOString(),
      ordersCounted: orderIds.size,
      totalUnitsSold,
      totalRevenue: roundMoney(totalRevenue),
      perVehicle,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong fetching sales analytics" });
  }
};
