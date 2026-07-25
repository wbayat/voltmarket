import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Imported Router here
import vehicleRoutes from "./routes/vehicle.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import loanCalculatorRoutes from "./routes/loanCalculator.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";

const app = express();

// TODO: fix cors later

app.use(express.static("public"));

app.use(express.json());
app.use(cookieParser());

// Routes:
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/loan-calculator", loanCalculatorRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chatbot", chatbotRoutes);

export default app;
