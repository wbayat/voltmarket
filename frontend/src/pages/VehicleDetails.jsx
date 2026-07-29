// Details + History + Reviews + Add to Cart/

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";

const ColorSwatch = ({ color, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={color}
    className={`w-9 h-9 rounded-full border-2 transition-all ${
      selected
        ? "border-black scale-110"
        : "border-gray-300 hover:border-gray-500"
    }`}
    style={{ backgroundColor: color.toLowerCase() }}
  />
);

const StarInput = ({ rating, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className={`text-2xl leading-none ${n <= rating ? "text-black" : "text-gray-300"} hover:text-black transition-colors`}
      >
        ★
      </button>
    ))}
  </div>
);

const VehicleDetails = () => {
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedInteriorColor, setSelectedInteriorColor] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const loadVehicle = () => {
    apiRequest(`/vehicles/${id}`)
      .then((data) => {
        setVehicle(data);
        setSelectedColor(data.availableColors?.[0] || "");
        setSelectedInteriorColor(data.availableInteriorColors?.[0] || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadReviews = () => {
    apiRequest(`/reviews/vehicle/${id}`)
      .then(setReviews)
      .catch(() => setReviews([]));

    apiRequest(`/reviews/vehicle/${id}/average`)
      .then(setRating)
      .catch(() => setRating(null));
  };

  // Checks whether this item is already in the user's wishlist
  // If an item is in the wishlist, this button will remove it
  // If the item is not in the wishlist, it add it
  const loadWishlistStatus = () => {
    apiRequest("/wishlist")
      .then((data) => {
        const alreadyWishlisted = data.some(
          (item) => item.vehicle.id === parseInt(id),
        );
        setWishlisted(alreadyWishlisted);
      })
      .catch(() => setWishlisted(false));
  };

  useEffect(() => {
    loadVehicle();
    loadReviews();
    loadWishlistStatus();
  }, [id]);

  const handleWishlistToggle = async () => {
    setWishlistError("");

    try {
      if (wishlisted) {
        await apiRequest(`/wishlist/${id}`, { method: "DELETE" });
        setWishlisted(false);
      } else {
        await apiRequest("/wishlist", {
          method: "POST",
          body: JSON.stringify({ vehicleId: parseInt(id) }),
        });
        setWishlisted(true);
      }
    } catch (err) {
      setWishlistError(err.message);
    }
  };

  const handleAddToCart = async () => {
    setCartMessage("");
    setCartError("");

    try {
      await apiRequest("/cart", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: parseInt(id),
          quantity: 1,
          selectedColor,
          selectedInteriorColor,
        }),
      });
      setCartMessage("Added to cart");
    } catch (err) {
      setCartError(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMessage("");
    setReviewError("");

    try {
      await apiRequest("/reviews", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: parseInt(id),
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      setReviewMessage("Review submitted");
      setReviewComment("");
      loadReviews();
    } catch (err) {
      setReviewError(err.message);
    }
  };

  if (loading)
    return (
      <p className="text-sm text-gray-500 mt-10 text-center">Loading...</p>
    );
  if (error)
    return <p className="text-sm text-red-600 mt-10 text-center">{error}</p>;
  if (!vehicle) return null;

  const image = vehicle.imageUrls?.[0];

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6 flex flex-col gap-8">
      <div className="relative h-96 bg-gray-100 rounded-2xl overflow-hidden border border-black flex items-center justify-center">
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
          onClick={handleWishlistToggle}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="group absolute top-3 right-3 w-11 h-11 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/90 transition-colors"
        >
          <span
            className={`text-2xl leading-none transition-colors ${
              wishlisted
                ? "text-red-500"
                : "text-gray-700 group-hover:text-red-500"
            }`}
          >
            {wishlisted ? "♥" : "♡"}
          </span>
        </button>
      </div>

      {/* Info + add to cart */}
      <div className="flex gap-8">
        <div className="w-1/2 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-black">
              {vehicle.brand} {vehicle.model}
            </h1>
            {vehicle.isHotDeal && <span className="text-lg">🔥</span>}
          </div>
          <span className="text-sm text-gray-500">
            {vehicle.year} · {vehicle.condition}
          </span>
          {vehicle.mileage && (
            <span className="text-sm text-gray-500">
              {vehicle.mileage.toLocaleString()} km mileage
            </span>
          )}
          <span className="text-lg text-black font-medium">
            ${vehicle.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">
            {vehicle.range} km range
          </span>
          <span className="text-sm text-gray-500">
            {rating && rating.reviewCount > 0
              ? `★ ${rating.averageRating.toFixed(1)} (${rating.reviewCount} review${rating.reviewCount === 1 ? "" : "s"})`
              : "No reviews yet"}
          </span>
          <p className="text-sm text-gray-700 mt-2">{vehicle.description}</p>
          <span className="text-sm text-gray-500 mt-1">
            {vehicle.quantity > 0
              ? `${vehicle.quantity} in stock`
              : "Out of stock"}
          </span>
          {wishlistError && (
            <p className="text-xs text-red-600 mt-1">{wishlistError}</p>
          )}
        </div>

        {/* Add to cart box */}
        <div className="w-1/2">
          <div className="border border-black rounded-2xl shadow-sm p-6 flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-black">Add to Cart</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-700">Color</label>
              <div className="flex gap-2 flex-wrap">
                {vehicle.availableColors?.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    selected={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-700">Interior Color</label>
              <div className="flex gap-2 flex-wrap">
                {vehicle.availableInteriorColors?.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    selected={selectedInteriorColor === color}
                    onClick={() => setSelectedInteriorColor(color)}
                  />
                ))}
              </div>
            </div>

            {cartError && <p className="text-sm text-red-600">{cartError}</p>}
            {cartMessage && <p className="text-sm text-black">{cartMessage}</p>}

            <button
              onClick={handleAddToCart}
              disabled={vehicle.quantity === 0}
              className="bg-black text-white rounded-lg py-2 text-sm hover:opacity-80 disabled:opacity-40"
            >
              Add to Cart
            </button>

            <Link
              to={`/loan-calculator?vehicleId=${vehicle.id}`}
              className="border border-black rounded-lg py-2 text-sm text-center hover:bg-gray-100"
            >
              {" "}
              Estimate financing{" "}
            </Link>
          </div>
        </div>
      </div>

      {/* Vehicle history */}
      {vehicle.condition === "USED" && (
        <div>
          <h2 className="text-lg font-semibold text-black mb-3">
            Vehicle History
          </h2>
          {vehicle.historyRecords && vehicle.historyRecords.length > 0 ? (
            <div className="flex flex-col gap-3">
              {vehicle.historyRecords.map((record) => (
                <div
                  key={record.id}
                  className="border border-black rounded-2xl shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-black capitalize">
                      {record.eventType.replace("_", " ")}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(record.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {record.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No history records for this vehicle.
            </p>
          )}
        </div>
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-semibold text-black mb-3">Reviews</h2>

        <div className="flex flex-col gap-3 mb-6">
          {reviews.length === 0 && (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          )}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-black rounded-2xl shadow-sm p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-black">
                  {review.user.name}
                </span>
                <span className="text-sm text-gray-500">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700 mt-1">{review.comment}</p>
              )}
              <span className="text-xs text-gray-400 mt-1 block">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        <div className="border border-black rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-black mb-3">
            Write a Review
          </h3>
          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-700">Rating</label>
              <StarInput rating={reviewRating} onChange={setReviewRating} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {reviewError && (
              <p className="text-sm text-red-600">{reviewError}</p>
            )}
            {reviewMessage && (
              <p className="text-sm text-black">{reviewMessage}</p>
            )}

            <button
              type="submit"
              className="bg-black text-white rounded-lg py-2 text-sm hover:opacity-80 self-start px-4"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
