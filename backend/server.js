import express from "express";
import cors from "cors";
import newsRoutes from "./routes/news.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/news", newsRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));