import prisma from "../utils/prismaClient.js";
import { processPayment } from "../utils/paymentService.js";
import { checkoutSchema } from "../validators/checkout.validator.js";

// controller to check out the current user's cart
export const checkout = async (req, res) => {
  try {
    const result = checkoutSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid card details", errors: result.error.errors });
    }
    // card details are format-checked only, never stored or actually charged
    const { cardholderName, cardNumber, expiryDate, cvv } = result.data;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: { items: { include: { vehicle: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // re-check stock right before charging, in case someone else bought
    // the last unit since it was added to the cart
    for (const item of cart.items) {
      if (!item.vehicle.isActive || item.vehicle.quantity < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.vehicle.brand} ${item.vehicle.model}`,
        });
      }
    }

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.vehicle.price * item.quantity,
      0,
    );

    // charge the mock payment service BEFORE touching the database
    const payment = processPayment();

    if (!payment.approved) {
      return res.status(402).json({ message: payment.message });
    }

    // everything below only runs if payment was approved
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.userId,
          totalPrice,
          status: "completed",
          items: {
            create: cart.items.map((item) => ({
              vehicleId: item.vehicleId,
              quantity: item.quantity,
              priceAtPurchase: item.vehicle.price,
              selectedColor: item.selectedColor,
              selectedInteriorColor: item.selectedInteriorColor,
            })),
          },
        },
        include: { items: true },
      });

      // reduce the quantity for each purchased vehicle
      for (const item of cart.items) {
        await tx.vehicle.update({
          where: { id: item.vehicleId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // clear the cart now that the order is placed
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json({ message: payment.message, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong during checkout" });
  }
};

// controller to list the current user's past orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { items: { include: { vehicle: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong fetching orders" });
  }
};

// controller to get a single order by id, only if it belongs to the current user
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { vehicle: true } } },
    });

    if (!order || order.userId !== req.userId) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong fetching the order" });
  }
};
