import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { idempotencyMiddleware } from "./middleware/idempotency.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Apply middleware
app.use(idempotencyMiddleware);

// Routes
app.use(paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
