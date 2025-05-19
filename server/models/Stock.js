import mongoose from "mongoose";

const StockSchema = new mongoose.Schema(
  {
    djajLm7amar: {
      parts: {
        cuisse: { type: Number, default: 5 },
        blanc: { type: Number, default: 3 },
        aile: { type: Number, default: 2 },
        dos: { type: Number, default: 4 },
        entier: { type: Number, default: 2 },
      },
    },
    basstilabl7ot: { type: Number, default: 15 },
    l7amblbar9o9: { type: Number, default: 12 },
    l7ammachwi: { type: Number, default: 8 },
  },
  { timestamps: true }
);

const Stock = mongoose.model("Stock", StockSchema);

export default Stock;
