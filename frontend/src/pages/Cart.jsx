import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import CartItemCard from "../components/CartItemCard";

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = () => {
    apiRequest("/cart")
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdate = async (itemId, updates) => {
    const updated = await apiRequest(`/cart/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...updated.cartItem } : item,
      ),
    );
  };

  const handleRemove = async (itemId) => {
    await apiRequest(`/cart/${itemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const total = items.reduce(
    (sum, item) => sum + item.vehicle.price * item.quantity,
    0,
  );

  if (loading)
    return (
      <p className="text-sm text-gray-500 mt-10 text-center">Loading...</p>
    );
  if (error)
    return <p className="text-sm text-red-600 mt-10 text-center">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold text-black mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          ))}

          <div className="border border-black rounded-2xl shadow-sm p-5 flex items-center justify-between mt-2">
            <span className="text-lg font-medium text-black">
              Total: ${total.toLocaleString()}
            </span>
            <Link
              to="/checkout"
              className="bg-black text-white rounded-lg px-5 py-2 text-sm hover:opacity-80"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
