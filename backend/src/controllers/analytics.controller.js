import prisma from "../utils/prismaClient.js";

const buildVehicleRanking = (
  groups, 
  vehiclesById,
  metricName,
  getValue
) => {
  return [...groups]
    .sort((a, b) => getValue(b) - getValue(a))
    .slice(0, 5)
    .map((group) => ({
      vehicle: vehiclesById.get(group.vehicleId),
      [metricName]: getValue(group),
    }))
    .filter((entry) => entry.vehicle);
}

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
      ... new Set(
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

    const vehiclesById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

    const mostWishlistedVehicles = buildVehicleRanking(
      wishlistGroups,
      vehiclesById,
      "wishlistCount",
      (group) => group._count.vehicleId
    );

    const mostReviewedVehicles = buildVehicleRanking(
      reviewGroups,
      vehiclesById,
      "reviewCount",
      (group) => group._count.vehicleId
    ).map((entry) => {
      const group = reviewGroups.find(
        (item) => item.vehicleId === entry.vehicle.id
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

    res.status(500).json({ message: "Something went wrong fetching usage analytics "});
  }
};