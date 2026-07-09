import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// TODO: fix cors later

app.use(express.json());
app.use(cookieParser());

export default app;
