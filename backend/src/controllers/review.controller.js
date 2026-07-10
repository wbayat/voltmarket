import prisma from "../utils/prismaClient.js";
import { createReviewSchema } from "../validators/review.validator.js";

// controller to add a new review
export const createReview = async (req, res) => {
  try {
    // input handeling
    const result = createReviewSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: result.error.errors });
    }

    const { vehicleId, rating, comment } = result.data;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    // first check if the review is for a valid vehicle
    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // add the review to the db
    const review = await prisma.review.create({
      data: {
        userId: req.userId,
        vehicleId,
        rating,
        comment,
      },
    });

    res.status(201).json({ message: "Review created", review });
  } catch (error) {
    // each user can only leave one review. It fails if a user tries to leave more than one review for a vehicle
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "You already reviewed this vehicle" });
    }
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong creating the review" });
  }
};

// controller to get all the reviews for a given vehicle
export const getReviewsForVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { vehicleId: parseInt(vehicleId) },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong fetching reviews" });
  }
};
