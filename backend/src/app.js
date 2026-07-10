import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Imported Router here
import vehicleRoutes from "./routes/vehicle.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

// TODO: fix cors later

app.use(express.json());
app.use(cookieParser());

// Routes:
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);

export default app;
