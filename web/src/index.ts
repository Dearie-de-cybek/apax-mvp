import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import connectDatabase from "./config/database";
import errorMiddleware from "./middlewares/error";
import activityRoutes from "./routes/activity";
import balanceRoutes from "./routes/balance";
import userRoutes from "./routes/users";

const { MONGO_URI, JWT_SECRET } = process.env;
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

if (!MONGO_URI || !JWT_SECRET) {
  console.error("MONGO_URI and JWT_SECRET must be set, see src/config/config.env.example");
  process.exit(1);
}

const app = express();

app.use(cors({ origin: CLIENT_URL }));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

app.use("/activity", activityRoutes);
app.use("/balance", balanceRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

connectDatabase(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Mongoose connection error:", error);
    process.exit(1);
  });
