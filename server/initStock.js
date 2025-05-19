import mongoose from "mongoose";
import Stock from "./models/Stock.js";

const initializeStock = async () => {
  try {
    // Vérifier si le stock existe déjà
    const existingStock = await Stock.findOne();

    if (!existingStock) {
      // Créer le stock initial
      const initialStock = new Stock({
        djajLm7amar: {
          total: 10,
          parts: {
            cuisse: 5,
            blanc: 3,
            aile: 2,
            dos: 4,
            entier: 2,
          },
        },
        basstilabl7ot: 15,
        l7amblbar9o9: 12,
        l7ammachwi: 8,
      });

      await initialStock.save();
      console.log("Stock initialisé avec succès !");
    } else {
      console.log("Le stock existe déjà dans la base de données.");
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation du stock:", error);
  }
};

export default initializeStock;
