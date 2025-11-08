import dotenv from "dotenv";
import express from "express";
import path from "path";
import { corsConfig } from "./config/cors";
import calendarRoutes from "./routes/calendar.routes";
import clientRoutes from "./routes/client.routes";
import reportRoutes from "./routes/report.routes";
import taxCalendarRoutes from "./routes/taxCalendar.routes";
import uploadsRoutes from "./routes/uploads.routes";
import userRoutes from "./routes/user.routes";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(corsConfig);

app.get("/", (req, res) => {
  res.send("Backend corriendo correctamente");
});

app.use("/api/calendar", calendarRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/tax-calendar", taxCalendarRoutes);
app.use("/api/reports", reportRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
