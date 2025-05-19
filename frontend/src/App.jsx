import { useState, useEffect } from "react";
import axios from "axios";

// Produits et données de formulaire
const products = [
  {
    id: 1,
    name: "دجاج محمر",
    image: "/images/Djaj Lm7amar.jpg",
    hasPartChoice: true,
  },
  {
    id: 2,
    name: "بسطيلة بالحوت",
    image: "/images/Basstila b Djaj.jpg",
    hasPartChoice: false,
  },
  {
    id: 3,
    name: "طاجين اللحم بالبرقوق",
    image: "/images/L7am blbar9o9.jpg",
    hasPartChoice: false,
  },
  {
    id: 4,
    name: "اللحم المشوي",
    image: "/images/L7am Machwi.jpg",
    hasPartChoice: false,
  },
];

const quantities = [
  { value: "0.25kg", label: "0.25kg" },
  { value: "0.5kg", label: "0.5kg" },
  { value: "0.75kg", label: "0.75kg" },
  { value: "1kg", label: "1kg" },
  { value: "1.25kg", label: "1.25kg" },
  { value: "1.5kg", label: "1.5kg" },
  { value: "1.75kg", label: "1.75kg" },
  { value: "2kg", label: "2kg" },
];

const CHICKEN_PARTS = [
  { value: "cuisse", label: "فخذ" },
  { value: "blanc", label: "صدر" },
  { value: "aile", label: "جناح" },
  { value: "dos", label: "ظهر" },
  { value: "entier", label: "كامل" },
];

export default function App() {
  console.log("App component rendering");

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [selectedParts, setSelectedParts] = useState({});
  const [formData, setFormData] = useState({
    clientName: "",
    location: "",
    phone: "",
    notes: "",
  });
  const [stock, setStock] = useState({});
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Charger le stock au démarrage
  useEffect(() => {
    console.log("Fetching stock data");
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      console.log("Making API call to fetch stock");
      const response = await axios.get("http://localhost:5000/order/stock");
      console.log("Stock data received:", response.data);
      setStock(response.data.stock || {});
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération du stock:", error);
      setAlert({
        type: "error",
        message: "Erreur lors de la récupération du stock",
      });
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (product, quantity) => {
    console.log("handleQuantityChange called with:", { product, quantity });

    setSelectedQuantities((prev) => ({
      ...prev,
      [product.id]: quantity,
    }));

    if (quantity && quantity !== "") {
      setSelectedItems((prev) => {
        const existingItem = prev.find((item) => item.id === product.id);
        if (existingItem) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity, part: null } : item
          );
        }
        return [...prev, { ...product, quantity, part: null }];
      });
    } else {
      setSelectedItems((prev) => prev.filter((item) => item.id !== product.id));
    }
  };

  const handlePartChange = (product, part) => {
    console.log("handlePartChange called with:", { product, part });

    // Mettre à jour selectedParts
    setSelectedParts((prev) => {
      const newParts = { ...prev };
      if (part) {
        newParts[product.id] = part;
      } else {
        delete newParts[product.id];
      }
      console.log("Updated selectedParts:", newParts);
      return newParts;
    });

    // Mettre à jour selectedItems
    setSelectedItems((prev) => {
      const updatedItems = prev.map((item) => {
        if (item.id === product.id) {
          return { ...item, part };
        }
        return item;
      });
      console.log("Updated selectedItems:", updatedItems);
      return updatedItems;
    });
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== productId));
    setSelectedQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
    setSelectedParts((prev) => {
      const newParts = { ...prev };
      delete newParts[productId];
      return newParts;
    });
  };

  const closeAlert = () => {
    setAlert(null);
    setShowOrderForm(false);
    setSelectedItems([]);
    setSelectedQuantities({});
    setSelectedParts({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Préparer les items pour l'envoi
      const itemsToSend = selectedItems.map((item) => ({
        ...item,
        // S'assurer que part est null pour les plats non-poulet
        part: item.name === "دجاج محمر" ? item.part : null,
      }));

      const response = await axios.post("http://localhost:5000/order", {
        items: itemsToSend,
        ...formData,
      });
      setStock(response.data.stock);
      setAlert({
        type: "success",
        message: "تم تسجيل الطلب بنجاح!",
      });
      setFormData({
        clientName: "",
        location: "",
        phone: "",
        notes: "",
      });
      setTimeout(closeAlert, 3000);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setAlert({
        type: "error",
        message: "حدث خطأ أثناء تسجيل الطلب",
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const getAvailabilityMessage = (productName, part = null) => {
    if (!stock[productName]) return "نفذ";

    if (productName === "دجاج محمر") {
      if (part) {
        const quantity = parseFloat(stock[productName].parts?.[part]) || 0;
        return quantity <= 0 ? "نفذ" : `${quantity} كيلوغرام متوفر`;
      } else {
        const totalQuantity = Object.values(
          stock[productName].parts || {}
        ).reduce((sum, quantity) => sum + (parseFloat(quantity) || 0), 0);
        return totalQuantity <= 0
          ? "نفذ"
          : `${totalQuantity.toFixed(2)} الكمية الإجمالية`;
      }
    }

    const quantity = parseFloat(stock[productName]) || 0;
    return quantity <= 0 ? "نفذ" : `${quantity} كيلوغرام متوفر`;
  };

  const isAvailable = (productName, part = null) => {
    if (!stock[productName]) return false;

    if (productName === "دجاج محمر") {
      if (part) {
        return (parseFloat(stock[productName].parts?.[part]) || 0) > 0;
      }
      return Object.values(stock[productName].parts || {}).some(
        (quantity) => (parseFloat(quantity) || 0) > 0
      );
    }

    return (parseFloat(stock[productName]) || 0) > 0;
  };

  const handleConfirmSelection = () => {
    setShowOrderForm(true);
  };

  const handleBackToSelection = () => {
    setShowOrderForm(false);
  };

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="app-container">
      <h1 className="main-title">zarreda.com تشهيتي؟ </h1>
      {alert && (
        <div
          className={`alert alert-${alert.type}`}
          onClick={() => setAlert(null)}
        >
          <div className="alert-content">
            <span className="alert-icon">
              {alert.type === "success" ? "✓" : "!"}
            </span>
            <p>{alert.message}</p>
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="image-container">
                <img src={product.image} alt={product.name} />
                <div className="available-quantity">
                  {getAvailabilityMessage(product.name)}
                </div>
                {isAvailable(product.name) && (
                  <div className="quantity-selector">
                    <select
                      value={selectedQuantities[product.id] || ""}
                      onChange={(e) =>
                        handleQuantityChange(product, e.target.value)
                      }
                      className="quantity-select"
                    >
                      <option value="">كمية</option>
                      {quantities.map((q) => (
                        <option key={q.value} value={q.value}>
                          {q.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="image-overlay">
                  <p>{product.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              background: "white",
              padding: "15px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              width: "300px",
              maxHeight: "400px",
              overflowY: "auto",
              zIndex: 100,
            }}
          >
            <h2
              style={{
                margin: "0 0 10px 0",
                color: "#8b4513",
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              Votre sélection ({selectedItems.length}{" "}
              {selectedItems.length > 1 ? "plats" : "plat"})
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "15px",
              }}
            >
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px",
                    background: "#f9f9f9",
                    borderRadius: "5px",
                    fontSize: "0.9rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>{item.name}</span>
                    <span>-</span>
                    <span>{item.quantity}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4444",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      padding: "0 5px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {!showOrderForm && (
              <button
                onClick={handleConfirmSelection}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#45a049")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
              >
                Passer à la commande
              </button>
            )}
          </div>
        )}
      </div>

      {showOrderForm && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255, 255, 255, 0.7)",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            width: "90%",
            maxWidth: "400px",
            maxHeight: "80vh",
            overflowY: "auto",
            backdropFilter: "blur(5px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <button
            onClick={handleBackToSelection}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              color: "#666",
              cursor: "pointer",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.85rem",
              transition: "all 0.3s",
              padding: "6px 10px",
              borderRadius: "6px",
            }}
            onMouseOver={(e) => {
              e.target.style.color = "#333";
              e.target.style.background = "rgba(255, 255, 255, 0.9)";
              e.target.style.borderColor = "rgba(0, 0, 0, 0.2)";
            }}
            onMouseOut={(e) => {
              e.target.style.color = "#666";
              e.target.style.background = "rgba(255, 255, 255, 0.8)";
              e.target.style.borderColor = "rgba(0, 0, 0, 0.1)";
            }}
          >
            ← Retour à la sélection
          </button>

          <h2
            style={{
              margin: "0 0 15px 0",
              color: "#8b4513",
              textAlign: "center",
              fontSize: "1.2rem",
              fontWeight: "bold",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            Informations de livraison
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  color: "#333",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                }}
              >
                Nom du client
              </label>
              <input
                type="text"
                name="clientName"
                placeholder="Votre nom"
                value={formData.clientName}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  fontSize: "0.9rem",
                  background: "rgba(255, 255, 255, 0.6)",
                  transition: "all 0.3s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b4513";
                  e.target.style.boxShadow = "0 0 0 2px rgba(139, 69, 19, 0.2)";
                  e.target.style.background = "rgba(255, 255, 255, 0.8)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255, 255, 255, 0.6)";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  color: "#333",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                }}
              >
                Localisation
              </label>
              <input
                type="text"
                name="location"
                placeholder="Votre adresse"
                value={formData.location}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  fontSize: "0.9rem",
                  background: "rgba(255, 255, 255, 0.6)",
                  transition: "all 0.3s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b4513";
                  e.target.style.boxShadow = "0 0 0 2px rgba(139, 69, 19, 0.2)";
                  e.target.style.background = "rgba(255, 255, 255, 0.8)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255, 255, 255, 0.6)";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  color: "#333",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                }}
              >
                Téléphone
              </label>
              <input
                type="text"
                name="phone"
                placeholder="Votre numéro de téléphone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  fontSize: "0.9rem",
                  background: "rgba(255, 255, 255, 0.6)",
                  transition: "all 0.3s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b4513";
                  e.target.style.boxShadow = "0 0 0 2px rgba(139, 69, 19, 0.2)";
                  e.target.style.background = "rgba(255, 255, 255, 0.8)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255, 255, 255, 0.6)";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  color: "#333",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                }}
              >
                Notes supplémentaires
              </label>
              <textarea
                name="notes"
                placeholder="Notes ou instructions spéciales..."
                value={formData.notes}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  minHeight: "60px",
                  fontSize: "0.9rem",
                  resize: "vertical",
                  background: "rgba(255, 255, 255, 0.6)",
                  transition: "all 0.3s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b4513";
                  e.target.style.boxShadow = "0 0 0 2px rgba(139, 69, 19, 0.2)";
                  e.target.style.background = "rgba(255, 255, 255, 0.8)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 0, 0, 0.1)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255, 255, 255, 0.6)";
                }}
              />
            </div>

            {selectedItems.some((item) => item.name === "دجاج محمر") && (
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    color: "#333",
                    fontWeight: "500",
                    fontSize: "0.9rem",
                  }}
                >
                  اختر جزء الدجاج
                </label>
                <select
                  value={
                    selectedParts[
                      selectedItems.find((item) => item.name === "دجاج محمر")
                        ?.id
                    ] || ""
                  }
                  onChange={(e) => {
                    const djajItem = selectedItems.find(
                      (item) => item.name === "دجاج محمر"
                    );
                    if (djajItem) {
                      handlePartChange(djajItem, e.target.value);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    fontSize: "0.9rem",
                    background: "rgba(255, 255, 255, 0.6)",
                    transition: "all 0.3s",
                    direction: "rtl",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b4513";
                    e.target.style.boxShadow =
                      "0 0 0 2px rgba(139, 69, 19, 0.2)";
                    e.target.style.background = "rgba(255, 255, 255, 0.8)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0, 0, 0, 0.1)";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = "rgba(255, 255, 255, 0.6)";
                  }}
                  required
                >
                  <option value="">اختر جزء</option>
                  {CHICKEN_PARTS.map((part) => {
                    const isPartAvailable =
                      stock["دجاج محمر"]?.parts?.[part.value] > 0;
                    return (
                      <option
                        key={part.value}
                        value={part.value}
                        disabled={!isPartAvailable}
                        style={{
                          direction: "rtl",
                          fontSize: "0.9rem",
                          color: isPartAvailable ? "inherit" : "#999",
                          backgroundColor: isPartAvailable
                            ? "inherit"
                            : "#f5f5f5",
                        }}
                      >
                        {part.label} {!isPartAvailable ? "(نفذ)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(139, 69, 19, 0.9)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
                transition: "all 0.3s",
                marginTop: "8px",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "rgba(107, 52, 19, 0.9)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "rgba(139, 69, 19, 0.9)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Passer la commande
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
