import bcrypt from "bcrypt";
import prisma from "../utils/prismaClient.js";
import { generateToken } from "../utils/jwt.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true, // This is to protect against XSS attacks
  secure: isProduction, // only sent over HTTPS in production but not in deployment
  sameSite: "lax", //  CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// controller for register endpoint
export const register = async (req, res) => {
  try {
    // input validation
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: result.error.errors });
    }

    const { name, email, password } = result.data;

    // check for existing user using email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // hash the password for safe storage
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong during registration" });
  }
};

// controller for the login endpoint
export const login = async (req, res) => {
  try {
    // input validation using zod
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: result.error.errors });
    }

    const { email, password } = result.data;

    // find the user using email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // generic messege when login fails
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.cookie("token", token, cookieOptions);
    res.json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong during login" });
  }
};

// controller for the logout endpoint.
export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }, // set by auth middleware
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
