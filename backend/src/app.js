import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Imported Router here
import vehicleRoutes from "./routes/vehicle.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";

const app = express();

// TODO: fix cors later

app.use(express.json());
app.use(cookieParser());

// Routes:
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);

export default app;
