import { useState, useEffect } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "pcs",
    expiryDate: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("products");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const getColor = (date) => {
    const diff = (new Date(date) - new Date()) / 86400000;
    if (diff <= 1) return "red";
    if (diff <= 2) return "orange";
    return "green";
  };

  const addProduct = () => {
    if (!formData.name || !formData.quantity || !formData.expiryDate) return;
    setProducts([
      ...products,
      { id: Date.now(), ...formData, quantity: Number(formData.quantity) },
    ]);
    setShowForm(false);
    setFormData({ name: "", quantity: "", unit: "pcs", expiryDate: "" });
  };

  const getAIRecipes = async () => {
    setAiResponse("Thinking...");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: products.map((p) => p.name).join(", "),
        }),
      });
      const data = await res.json();
      setAiResponse(data.reply || "No response");
    } catch {
      setAiResponse("⚠️ AI service not available.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Smart Expiry</h2>

      {products.map((p) => (
        <div
          key={p.id}
          onClick={() => setOpenId(openId === p.id ? null : p.id)}
          style={{
            borderLeft: `5px solid ${getColor(p.expiryDate)}`,
            padding: 10,
            marginTop: 10,
            background: "#f5f5f5",
          }}
        >
          <strong>{p.name}</strong>
          {openId === p.id && (
            <div>
              Qty: {p.quantity} {p.unit}
              <br />
              Expiry: {p.expiryDate}
            </div>
          )}
        </div>
      ))}

      {showForm && (
        <div>
          <input placeholder="Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input type="number" placeholder="Qty" onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
          <select onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
            <option>pcs</option>
            <option>kg</option>
            <option>litre</option>
          </select>
          <input type="date" onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
          <button onClick={addProduct}>Save</button>
        </div>
      )}

      <button onClick={() => setShowForm(!showForm)}>+ Add Product</button>

      <button onClick={() => { setShowAI(true); getAIRecipes(); }}>
        🤖 AI
      </button>

      {showAI && (
        <div>
          <h4>AI Recipe Assistant</h4>
          <pre>{aiResponse}</pre>
          <button onClick={() => setShowAI(false)}>Close</button>
        </div>
      )}
    </div>
  );
}
