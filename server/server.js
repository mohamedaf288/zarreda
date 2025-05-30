import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";
import initializeStock from "./initStock.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB Atlas
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://zarreda:S9mQ44L0WMx07DD1@cluster0.fqswxwq.mongodb.net/zarreda?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connecté à MongoDB Atlas");
    // Initialiser le stock après la connexion à la base de données
    await initializeStock();
  })
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB Atlas:", err);
  });

// Routes
app.use("/api/order", orderRoutes);

// Route de test pour vérifier que l'API fonctionne
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

const PORT = process.env.PORT || 5000;

// Pour le développement local
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

// Pour Vercel
export default app;
