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
    status: "green",
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

  const getColor = (status) => {
    if (status === "red") return "#ff4d4d";
    if (status === "yellow") return "#ffc107";
    return "#28a745";
  };

  const addProduct = () => {
    if (!formData.name || !formData.quantity) return;

    const newProduct = {
      id: Date.now(),
      ...formData,
      quantity: Number(formData.quantity),
      price: Number(formData.price || 0),
    };

    setProducts([...products, newProduct]);
    setFormData({
      name: "",
      quantity: "",
      unit: "pcs",
      price: "",
      category: "",
      status: "green",
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
    <div
      style={{ maxWidth: "420px", margin: "20px auto", fontFamily: "Arial" }}
    >
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            placeholder="Price (optional)"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
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
          }}
        >
          <strong>{item.name}</strong>
          <p>
            Quantity: {item.quantity} {item.unit}
          </p>
          <p>Price: ₹{item.price}</p>
          <p>Category: {item.category}</p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => reduceQuantity(item.id)}>Modify (-1)</button>
            <button onClick={() => consumeProduct(item.id)}>Consume All</button>
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
