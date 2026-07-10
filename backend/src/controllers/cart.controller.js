import prisma from "../utils/prismaClient.js";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validators/cart.validator.js";

// gets the user's cart, or create one if it's the users first time on the website
const getOrCreateCart = async (userId) => {};

// controller to add a vehicle to cart.
export const addToCart = async (req, res) => {};

// controller to get a users cart so that it's consistant accross different sessions
export const getCart = async (req, res) => {};

// controller to update quantity of an item in the cart
export const updateCartItem = async (req, res) => {};

// controller to delete an item from cart
export const removeCartItem = async (req, res) => {};
