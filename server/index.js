import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Connexion à MongoDB Atlas
const MONGODB_URI =
  "mongodb+srv://zarreda:S9mQ44L0WMx07DD1@cluster0.fqswxwq.mongodb.net/zarreda?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connecté à MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB Atlas:", err);
  });

app.use("/order", orderRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
