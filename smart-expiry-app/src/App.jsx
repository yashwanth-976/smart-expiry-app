import { useState, useEffect } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState(null);

  const [showAI, setShowAI] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "pcs",
    price: "",
    category: "",
    expiryDate: "",
  });

  // Load products
  useEffect(() => {
    const saved = localStorage.getItem("products");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  // Save products
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // Auto remove expired
  useEffect(() => {
    const today = new Date();
    setProducts((prev) => prev.filter((p) => new Date(p.expiryDate) >= today));
  }, []);

  const getColor = (expiryDate) => {
    const diff = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff <= 1) return "#ff4d4d";
    if (diff <= 2) return "#ffc107";
    return "#28a745";
  };

  const formatDate = (date) => {
    const [y, m, d] = date.split("-");
    return `${d}-${m}-${y}`;
  };

  const addProduct = () => {
    if (!formData.name || !formData.quantity || !formData.expiryDate) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price || 0),
      },
    ]);

    setFormData({
      name: "",
      quantity: "",
      unit: "pcs",
      price: "",
      category: "",
      expiryDate: "",
    });

    setShowForm(false);
  };

  const incQty = (id) =>
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      ),
    );

  const decQty = (id) =>
    setProducts(
      products
        .map((p) => (p.id === id ? { ...p, quantity: p.quantity - 1 } : p))
        .filter((p) => p.quantity > 0),
    );

  const consumeAll = (id) => setProducts(products.filter((p) => p.id !== id));

  // 🤖 AI CALL
  const getAIRecipes = async () => {
    const urgent = products.filter((p) => {
      const diff =
        (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
      return diff <= 2;
    });

    if (urgent.length === 0) {
      setAiResponse("🎉 No items expiring soon.");
      return;
    }

    setAiResponse("Thinking...");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: urgent.map((i) => i.name).join(", "),
        }),
      });

      const data = await res.json();
      setAiResponse(data.reply || "No response");
    } catch {
      setAiResponse("⚠️ AI service not available.");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "20px auto", fontFamily: "Arial" }}>
      <h2>Smart Expiry</h2>

      {products.map((p) => (
        <div
          key={p.id}
          onClick={() => setOpenId(openId === p.id ? null : p.id)}
          style={{
            background: "#f5f5f5",
            padding: 10,
            marginTop: 10,
            borderRadius: 6,
            cursor: "pointer",
            borderLeft: `6px solid ${getColor(p.expiryDate)}`,
          }}
        >
          <strong>{p.name}</strong>

          {openId === p.id && (
            <>
              <div>
                Qty: {p.quantity} {p.unit}
              </div>
              <div>Expiry: {formatDate(p.expiryDate)}</div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  decQty(p.id);
                }}
              >
                ➖
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  incQty(p.id);
                }}
              >
                ➕
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  consumeAll(p.id);
                }}
              >
                🗑️
              </button>
            </>
          )}
        </div>
      ))}

      {showForm && (
        <div style={{ background: "#eee", padding: 10, marginTop: 10 }}>
          <input
            placeholder="Product name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
          />
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          >
            <option>pcs</option>
            <option>kg</option>
            <option>litre</option>
            <option>packet</option>
          </select>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
          />
          <button onClick={addProduct}>Save</button>
        </div>
      )}

      <button onClick={() => setShowForm(!showForm)}>+ Add Product</button>

      <button
        onClick={() => {
          setShowAI(true);
          getAIRecipes();
        }}
        style={{ position: "fixed", bottom: 20, right: 20 }}
      >
        🤖
      </button>

      {showAI && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            background: "#fff",
            padding: 10,
          }}
        >
          <strong>AI Recipe Assistant</strong>
          <pre>{aiResponse}</pre>
          <button onClick={() => setShowAI(false)}>Close</button>
        </div>
      )}
    </div>
  );
}
