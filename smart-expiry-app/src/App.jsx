import { useState, useEffect } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "pcs",
    price: "",
    category: "",
    expiryDate: "",
  });

  // LOAD DATA ON START
  useEffect(() => {
    const saved = localStorage.getItem("products");
    if (saved) {
      setProducts(JSON.parse(saved));
    }
  }, []);

  // SAVE DATA WHENEVER PRODUCTS CHANGE
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // AUTO REMOVE EXPIRED PRODUCTS
  useEffect(() => {
    const today = new Date();

    const filtered = products.filter((item) => {
      if (!item.expiryDate) return true;
      const expiry = new Date(item.expiryDate);
      return expiry >= today;
    });

    if (filtered.length !== products.length) {
      setProducts(filtered);
    }
  }, [products]);

  // EXPIRY COLOR LOGIC
  const getColor = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "#ff4d4d";   // Red
    if (diffDays === 2) return "#ffc107";  // Yellow
    return "#28a745";                      // Green
  };

  const addProduct = () => {
    if (!formData.name || !formData.quantity || !formData.expiryDate) return;

    const newProduct = {
      id: Date.now(),
      name: formData.name,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      price: Number(formData.price || 0),
      category: formData.category,
      expiryDate: formData.expiryDate,
    };

    setProducts([...products, newProduct]);

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
    const updated = products
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity - 1;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    setProducts(updated);
  };

  const consumeProduct = (id) => {
    setProducts(products.filter((item) => item.id !== id));
  };

  return (
    <div style={{ maxWidth: "420px", margin: "20px auto", fontFamily: "Arial" }}>
      <h2>Smart Expiry</h2>

      {/* ADD PRODUCT FORM */}
      {showForm && (
        <div
          style={{
            padding: "10px",
            background: "#f0f0f0",
            borderRadius: "6px",
            marginBottom: "15px",
          }}
        >
          <input
            placeholder="Product name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            style={{ width: "100%", marginBottom: "6px" }}
          />

          <input
            placeholder="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            style={{ width: "100%", marginBottom: "6px" }}
          />

          <input
            placeholder="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            style={{ width: "100%", marginBottom: "6px" }}
          />

          <input
            placeholder="Price (optional)"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            style={{ width: "100%", marginBottom: "6px" }}
          />

          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
            style={{ width: "100%", marginBottom: "6px" }}
          />

          <button
            onClick={addProduct}
            style={{
              width: "100%",
              padding: "8px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Save Product
          </button>
        </div>
      )}

      {/* PRODUCT LIST */}
      {products.map((item) => (
        <div
          key={item.id}
          style={{
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            backgroundColor: "#f5f5f5",
            borderLeft: `6px solid ${getColor(item.expiryDate)}`,
          }}
        >
          <strong>{item.name}</strong>
          <p>Quantity: {item.quantity} {item.unit}</p>
          <p>Category: {item.category}</p>
          <p>Price: ₹{item.price}</p>
          <p>Expiry: {item.expiryDate}</p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => reduceQuantity(item.id)}>
              Modify (-1)
            </button>
            <button onClick={() => consumeProduct(item.id)}>
              Consume All
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "15px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#007bff",
          color: "white",
          fontSize: "16px",
        }}
      >
        + Add Product
      </button>
    </div>
  );
}
