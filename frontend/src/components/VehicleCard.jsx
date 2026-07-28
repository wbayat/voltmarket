import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

const VehicleCard = ({ vehicle }) => {
  const [rating, setRating] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  useEffect(() => {
    apiRequest(`/reviews/vehicle/${vehicle.id}/average`)
      .then((data) => setRating(data))
      .catch(() => setRating(null));
  }, [vehicle.id]);

  const handleWishlist = async (e) => {
    e.preventDefault(); // don't follow the card link
    setWishlistError("");

    try {
      await apiRequest("/wishlist", {
        method: "POST",
        body: JSON.stringify({ vehicleId: vehicle.id }),
      });
      setWishlisted(true);
    } catch (err) {
      setWishlistError(err.message);
    }
  };

  const image = vehicle.imageUrls?.[0];

  return (
    <div className="border border-black rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm text-gray-400">No image</span>
        )}

        <button
          onClick={handleWishlist}
          title="Add to wishlist"
          className="group absolute top-2 right-2 w-9 h-9 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/90 transition-colors"
        >
          <span
            className={`text-xl leading-none transition-colors ${
              wishlisted
                ? "text-red-500"
                : "text-gray-700 group-hover:text-red-500"
            }`}
          >
            {wishlisted ? "♥" : "♡"}
          </span>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-black">
            {vehicle.brand} {vehicle.model}
          </span>
          {vehicle.isHotDeal && (
            <span title="Hot Deal" className="text-base leading-none">
              🔥
            </span>
          )}
        </div>

        <span className="text-sm text-gray-500">
          {vehicle.year} · {vehicle.condition}
        </span>
        <span className="text-sm text-gray-700">
          ${vehicle.price.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500">{vehicle.range} km range</span>

        <span className="text-sm text-gray-500">
          {rating && rating.reviewCount > 0
            ? `★ ${rating.averageRating.toFixed(1)} (${rating.reviewCount})`
            : "No reviews yet"}
        </span>

        <div className="mt-auto pt-3">
          <Link
            to={`/vehicles/${vehicle.id}`}
            className="bg-black text-white rounded-lg px-3 py-1.5 text-sm hover:opacity-80 inline-block"
          >
            Learn More
          </Link>
        </div>

        {wishlistError && (
          <p className="text-xs text-red-600">{wishlistError}</p>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
