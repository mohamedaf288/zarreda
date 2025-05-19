import express from "express";
import Order from "../models/Order.js";
import Stock from "../models/Stock.js";

const router = express.Router();

// Route pour créer une nouvelle commande
router.post("/", async (req, res) => {
  try {
    const { items, clientName, location, phone, notes } = req.body;
    console.log("Received order items:", items);

    // Récupérer le stock actuel depuis MongoDB
    const currentStock = await Stock.findOne();
    if (!currentStock) {
      return res.status(500).json({
        success: false,
        message: "Erreur: Stock non initialisé",
      });
    }

    // Vérifier les quantités disponibles
    for (const item of items) {
      console.log("Processing item:", item);
      if (item.name === "دجاج محمر") {
        if (!item.part) {
          return res.status(400).json({
            success: false,
            message: "Veuillez sélectionner une partie du poulet",
          });
        }
        const quantity = parseFloat(item.quantity);
        if (
          !currentStock.djajLm7amar.parts[item.part] ||
          currentStock.djajLm7amar.parts[item.part] < quantity
        ) {
          return res.status(400).json({
            success: false,
            message: `Désolé, il ne reste que ${
              currentStock.djajLm7amar.parts[item.part] || 0
            }kg de ${item.part} disponible.`,
          });
        }
      } else {
        const stockKey =
          item.name === "بسطيلة بالحوت"
            ? "basstilabl7ot"
            : item.name === "طاجين اللحم بالبرقوق"
            ? "l7amblbar9o9"
            : item.name === "اللحم المشوي"
            ? "l7ammachwi"
            : null;

        if (!stockKey) {
          return res.status(400).json({
            success: false,
            message: `Plat non reconnu: ${item.name}`,
          });
        }

        const quantity = parseFloat(item.quantity);
        if (currentStock[stockKey] < quantity) {
          return res.status(400).json({
            success: false,
            message: `Désolé, il ne reste que ${currentStock[stockKey]}kg de ${item.name} disponible.`,
          });
        }
      }
    }

    // Mettre à jour le stock
    for (const item of items) {
      if (item.name === "دجاج محمر" && item.part) {
        const quantity = parseFloat(item.quantity);
        console.log(
          `Updating chicken part ${item.part} stock: current=${
            currentStock.djajLm7amar.parts[item.part]
          }, removing=${quantity}`
        );
        currentStock.djajLm7amar.parts[item.part] -= quantity;
      } else {
        const stockKey =
          item.name === "بسطيلة بالحوت"
            ? "basstilabl7ot"
            : item.name === "طاجين اللحم بالبرقوق"
            ? "l7amblbar9o9"
            : item.name === "اللحم المشوي"
            ? "l7ammachwi"
            : null;

        if (stockKey) {
          const quantity = parseFloat(item.quantity);
          console.log(
            `Updating ${stockKey} stock: current=${currentStock[stockKey]}, removing=${quantity}`
          );
          currentStock[stockKey] -= quantity;
        }
      }
    }

    // Sauvegarder le stock mis à jour
    await currentStock.save();
    console.log("Stock updated successfully");

    // Créer la commande
    const newOrder = new Order({
      items,
      clientName,
      location,
      phone,
      notes,
    });

    await newOrder.save();
    console.log("Order saved successfully");

    // Formater le stock pour la réponse
    const formattedStock = {
      "دجاج محمر": {
        parts: {
          cuisse: currentStock.djajLm7amar.parts.cuisse.toFixed(2),
          blanc: currentStock.djajLm7amar.parts.blanc.toFixed(2),
          aile: currentStock.djajLm7amar.parts.aile.toFixed(2),
          dos: currentStock.djajLm7amar.parts.dos.toFixed(2),
          entier: currentStock.djajLm7amar.parts.entier.toFixed(2),
        },
      },
      "بسطيلة بالحوت": currentStock.basstilabl7ot.toFixed(2),
      "طاجين اللحم بالبرقوق": currentStock.l7amblbar9o9.toFixed(2),
      "اللحم المشوي": currentStock.l7ammachwi.toFixed(2),
    };

    res.status(201).json({
      success: true,
      message: "Commande enregistrée avec succès",
      order: newOrder,
      stock: formattedStock,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de la commande",
      error: error.message,
    });
  }
});

// Route pour récupérer toutes les commandes
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des commandes",
      error: error.message,
    });
  }
});

// Route pour obtenir le stock
router.get("/stock", async (req, res) => {
  try {
    const currentStock = await Stock.findOne();
    if (!currentStock) {
      return res.status(404).json({
        success: false,
        message: "Stock non trouvé",
      });
    }

    // Formater le stock pour l'affichage en kilogrammes
    const formattedStock = {
      "دجاج محمر": {
        parts: {
          cuisse: currentStock.djajLm7amar.parts.cuisse.toFixed(2),
          blanc: currentStock.djajLm7amar.parts.blanc.toFixed(2),
          aile: currentStock.djajLm7amar.parts.aile.toFixed(2),
          dos: currentStock.djajLm7amar.parts.dos.toFixed(2),
          entier: currentStock.djajLm7amar.parts.entier.toFixed(2),
        },
      },
      "بسطيلة بالحوت": currentStock.basstilabl7ot.toFixed(2),
      "طاجين اللحم بالبرقوق": currentStock.l7amblbar9o9.toFixed(2),
      "اللحم المشوي": currentStock.l7ammachwi.toFixed(2),
    };

    res.json({
      success: true,
      stock: formattedStock,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du stock:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du stock",
    });
  }
});

// Route pour réinitialiser le stock
router.post("/reset-stock", async (req, res) => {
  try {
    // Supprimer le stock existant
    await Stock.deleteMany({});

    // Créer un nouveau stock avec les valeurs par défaut en kilogrammes
    const newStock = new Stock({
      djajLm7amar: {
        parts: {
          cuisse: 5, // 5kg
          blanc: 3, // 3kg
          aile: 2, // 2kg
          dos: 4, // 4kg
          entier: 2, // 2kg
        },
      },
      basstilabl7ot: 15, // 15kg
      l7amblbar9o9: 12, // 12kg
      l7ammachwi: 8, // 8kg
    });

    await newStock.save();

    // Formater le stock pour l'affichage
    const formattedStock = {
      "دجاج محمر": {
        parts: {
          cuisse: currentStock.djajLm7amar.parts.cuisse.toFixed(2),
          blanc: currentStock.djajLm7amar.parts.blanc.toFixed(2),
          aile: currentStock.djajLm7amar.parts.aile.toFixed(2),
          dos: currentStock.djajLm7amar.parts.dos.toFixed(2),
          entier: currentStock.djajLm7amar.parts.entier.toFixed(2),
        },
      },
      "بسطيلة بالحوت": currentStock.basstilabl7ot.toFixed(2),
      "طاجين اللحم بالبرقوق": currentStock.l7amblbar9o9.toFixed(2),
      "اللحم المشوي": currentStock.l7ammachwi.toFixed(2),
    };

    res.json({
      success: true,
      message: "Stock réinitialisé avec succès",
      stock: formattedStock,
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du stock:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation du stock",
      error: error.message,
    });
  }
});

router.post("/update-stock", async (req, res) => {
  try {
    const { product, quantity, part } = req.body;
    const stock = await Stock.findOne();

    if (!stock) {
      return res.status(404).json({ message: "Stock non trouvé" });
    }

    if (product === "djajLm7amar") {
      if (!part) {
        return res
          .status(400)
          .json({ message: "Partie non spécifiée pour le poulet" });
      }
      stock.djajLm7amar.parts[part] = parseFloat(quantity);
    } else {
      stock[product] = parseFloat(quantity);
    }

    await stock.save();

    // Formater le stock pour l'affichage
    const formattedStock = {
      "دجاج محمر": {
        parts: {
          cuisse: stock.djajLm7amar.parts.cuisse.toFixed(2),
          blanc: stock.djajLm7amar.parts.blanc.toFixed(2),
          aile: stock.djajLm7amar.parts.aile.toFixed(2),
          dos: stock.djajLm7amar.parts.dos.toFixed(2),
          entier: stock.djajLm7amar.parts.entier.toFixed(2),
        },
      },
      "بسطيلة بالحوت": stock.basstilabl7ot.toFixed(2),
      "طاجين اللحم بالبرقوق": stock.l7amblbar9o9.toFixed(2),
      "اللحم المشوي": stock.l7ammachwi.toFixed(2),
    };

    res.json(formattedStock);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du stock:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du stock" });
  }
});

router.post("/order", async (req, res) => {
  try {
    const { product, quantity, part } = req.body;
    const stock = await Stock.findOne();

    if (!stock) {
      return res.status(404).json({ message: "Stock non trouvé" });
    }

    const quantityValue = parseFloat(quantity);

    if (product === "djajLm7amar") {
      if (!part) {
        return res
          .status(400)
          .json({ message: "Partie non spécifiée pour le poulet" });
      }
      if (stock.djajLm7amar.parts[part] < quantityValue) {
        return res.status(400).json({
          message: `Stock insuffisant pour ${part}. Disponible: ${stock.djajLm7amar.parts[
            part
          ].toFixed(2)}kg`,
        });
      }
      stock.djajLm7amar.parts[part] -= quantityValue;
    } else {
      if (stock[product] < quantityValue) {
        return res.status(400).json({
          message: `Stock insuffisant pour ${product}. Disponible: ${stock[
            product
          ].toFixed(2)}kg`,
        });
      }
      stock[product] -= quantityValue;
    }

    await stock.save();

    // Formater le stock pour l'affichage
    const formattedStock = {
      "دجاج محمر": {
        parts: {
          cuisse: stock.djajLm7amar.parts.cuisse.toFixed(2),
          blanc: stock.djajLm7amar.parts.blanc.toFixed(2),
          aile: stock.djajLm7amar.parts.aile.toFixed(2),
          dos: stock.djajLm7amar.parts.dos.toFixed(2),
          entier: stock.djajLm7amar.parts.entier.toFixed(2),
        },
      },
      "بسطيلة بالحوت": stock.basstilabl7ot.toFixed(2),
      "طاجين اللحم بالبرقوق": stock.l7amblbar9o9.toFixed(2),
      "اللحم المشوي": stock.l7ammachwi.toFixed(2),
    };

    res.json(formattedStock);
  } catch (error) {
    console.error("Erreur lors de la commande:", error);
    res.status(500).json({ message: "Erreur lors de la commande" });
  }
});

export default router;
