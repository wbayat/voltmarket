import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import VehicleCard from "../components/VehicleCard";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/wishlist")
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // every vehicle on this page is already wishlisted, so "toggling" always removes it
  const handleRemove = async (vehicleId) => {
    await apiRequest(`/wishlist/${vehicleId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.vehicle.id !== vehicleId));
  };

  if (loading)
    return (
      <p className="text-sm text-gray-500 mt-10 text-center">Loading...</p>
    );
  if (error)
    return <p className="text-sm text-red-600 mt-10 text-center">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold text-black mb-6">Your Wishlist</h1>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">
          Your wishlist is empty.{" "}
          <Link to="/" className="text-black underline">
            Browse vehicles
          </Link>{" "}
          to save some for later.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <VehicleCard
              key={item.id}
              vehicle={item.vehicle}
              wishlisted
              onToggleWishlist={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
