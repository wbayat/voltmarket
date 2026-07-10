import prisma from "../utils/prismaClient.js";

export const getVehicles = async (req, res) => {
  try {
    // These fields are used to filter vehicles
    const { brand, color, minPrice, maxPrice, sortBy, order } = req.query;

    const where = { isActive: true };
    if (brand) where.brand = brand;
    if (color) where.color = color;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Vehicles can be sorted using these three options
    const allowedSortFields = ["price", "year", "range"];
    const orderBy = allowedSortFields.includes(sortBy)
      ? { [sortBy]: order === "desc" ? "desc" : "asc" } // default to desc order
      : { createdAt: "desc" };

    const vehicles = await prisma.vehicle.findMany({ where, orderBy });

    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong fetching vehicles" });
  }
};

// Get a specific vehicle using id
export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vehicle || !vehicle.isActive) {
      return res
        .status(404)
        .json({ message: `Vehicle with id = ${id} doesn't exist!` });
    }

    res.json(vehicle);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong fetching the vehicle" });
  }
};

// For hot deals
export const getHotDeals = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        isActive: true,
        isHotDeal: true,
      },
      orderBy: { price: "asc" },
    });

    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong fetching hot deals!" });
  }
};
