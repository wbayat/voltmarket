import prisma from "../utils/prismaClient.js";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validators/cart.validator.js";

// gets the user's cart, or create one if it's the users first time on the website
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
};

// controller to add a vehicle to cart.
export const addToCart = async (req, res) => {
  try {
    // input handeling
    const result = addToCartSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: result.error.errors });
    }

    const { vehicleId, quantity } = result.data;

    // find vehicel to make sure it's a valid one
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle || !vehicle.isActive) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // chosen quantity by user must be less than available
    if (vehicle.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const cart = await getOrCreateCart(req.userId);

    // if the vehicle is already in the cart, increase the quantity instead of duplicating the row
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_vehicleId: {
          cartId: cart.id,
          vehicleId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { cartId: cart.id, vehicleId, quantity },
      });
    }

    res.status(201).json({ message: "Added to cart", cartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong adding to cart" });
  }
};

// controller to get a users cart so that it's consistant accross different sessions
export const getCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: { items: { include: { vehicle: true } } },
    });

    if (!cart) {
      return res.json({ items: [] }); // empty cart
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong fetching the cart" });
  }
};

// controller to update quantity of an item in the cart
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = updateCartItemSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: result.error.errors });
    }

    const { quantity } = result.data;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: { cart: true, vehicle: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.userId) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.vehicle.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    res.json({ message: "Cart item updated", cartItem: updated });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong updating the cart item" });
  }
};

// controller to delete an item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.userId) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await prisma.cartItem.delete({ where: { id: cartItem.id } });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong removing the cart item" });
  }
};
