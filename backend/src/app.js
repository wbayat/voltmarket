import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Imported Router here
import vehicleRoutes from "./routes/vehicle.routes.js";

const app = express();

// TODO: fix cors later

app.use(express.json());
app.use(cookieParser());

// Routes:
app.use("/api/vehicles", vehicleRoutes);

export default app;
