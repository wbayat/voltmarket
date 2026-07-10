import prisma from "../utils/prismaClient.js";

// controller for adding a vehicle to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { vehicleId } = req.body;

    // simple input validation
    if (!vehicleId || typeof vehicleId !== "number") {
      return res
        .status(400)
        .json({ message: "vehicleId is required and must be a number" });
    }

    // confirm if the vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // create the database entry to add vehicle to users wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: req.userId,
        vehicleId,
      },
    });

    res.status(201).json({ message: "Added to wishlist", wishlistItem });
  } catch (error) {
    if (error.code === "P2002") {
      // if vehicle is already in the wishlist, it can't be added again
      return res.status(409).json({ message: "Vehicle already in wishlist" });
    }
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong adding to wishlist" });
  }
};

// controller to get a users wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: req.userId },
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong fetching the wishlist" });
  }
};

// delete a vehicle from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_vehicleId: {
          userId: req.userId,
          vehicleId: parseInt(vehicleId),
        },
      },
    });

    if (!wishlistItem) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    await prisma.wishlistItem.delete({
      where: {
        userId_vehicleId: {
          userId: req.userId,
          vehicleId: parseInt(vehicleId),
        },
      },
    });

    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong removing from wishlist" });
  }
};
