import { useState, useEffect } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "pcs",
    price: "",
    category: "",
    expiryDate: "",
  });

  // Load saved products
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
    const filtered = products.filter(
      (p) => new Date(p.expiryDate) >= today
    );
    if (filtered.length !== products.length) {
      setProducts(filtered);
    }
  }, [products]);

  // Expiry color logic
  const getColor = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil(
      (expiry - today) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) return "#ff4d4d";
    if (diffDays === 2) return "#ffc107";
    return "#28a745";
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

  const reduceQuantity = (id) => {
    setProducts(
      products
        .map((p) =>
          p.id === id
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const consumeProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div style={{ maxWidth: 420, margin: "20px auto", fontFamily: "Arial" }}>
      <h2>Smart Expiry</h2>

      {/* ADD PRODUCT FORM */}
      {showForm && (
        <div style={{ background: "#f0f0f0", padding: 10, borderRadius: 6 }}>
          <input
            placeholder="Product name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            style={{ width: "100%", marginBottom: 6 }}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            style={{ width: "100%", marginBottom: 6 }}
          />
          <input
            placeholder="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            style={{ width: "100%", marginBottom: 6 }}
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            style={{ width: "100%", marginBottom: 6 }}
          />
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
            style={{ width: "100%", marginBottom: 6 }}
          />
          <button onClick={addProduct} style={{ width: "100%" }}>
            Save
          </button>
        </div>
      )}

      {/* PRODUCT LIST */}
      {products.map((p) => (
        <div
          key={p.id}
          onClick={() => setOpenId(openId === p.id ? null : p.id)}
          style={{
            background: "#f5f5f5",
            padding: 10,
            borderRadius: 6,
            marginTop: 10,
            cursor: "pointer",
            borderLeft: `6px solid ${getColor(p.expiryDate)}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{p.name}</strong>
            <span>📅</span>
          </div>

          {openId === p.id && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              <div>Quantity: {p.quantity} {p.unit}</div>
              <div>Price: ₹{p.price}</div>
              <div>Category: {p.category}</div>

              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reduceQuantity(p.id);
                  }}
                >
                  ✏️
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    consumeProduct(p.id);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{ width: "100%", marginTop: 15 }}
      >
        + Add Product
      </button>
    </div>
  );
}
