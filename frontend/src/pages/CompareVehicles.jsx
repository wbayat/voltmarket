import { useState, useEffect } from "react";
import { apiRequest } from "../api/client";

const MAX_COMPARE = 3;

const ToggleButton = ({ active, disabled, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`text-sm rounded-full border border-black px-3 py-1 transition-colors disabled:opacity-30 ${
      active ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const SpecRow = ({ label, vehicles, render }) => (
  <tr className="border-b border-gray-200 last:border-0">
    <td className="py-3 pr-4 text-sm font-medium text-black whitespace-nowrap">
      {label}
    </td>
    {vehicles.map((vehicle) => (
      <td key={vehicle.id} className="py-3 px-4 text-sm text-gray-700">
        {render(vehicle)}
      </td>
    ))}
  </tr>
);

const CompareVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    apiRequest("/vehicles")
      .then(setVehicles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleVehicle = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const selectedVehicles = selectedIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter(Boolean);

  // fetch the average rating for each vehicle currently being compared
  useEffect(() => {
    selectedVehicles.forEach((vehicle) => {
      if (ratings[vehicle.id] !== undefined) return;

      apiRequest(`/reviews/vehicle/${vehicle.id}/average`)
        .then((data) => setRatings((prev) => ({ ...prev, [vehicle.id]: data })))
        .catch(() => setRatings((prev) => ({ ...prev, [vehicle.id]: null })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  if (loading)
    return (
      <p className="text-sm text-gray-500 mt-10 text-center">Loading...</p>
    );
  if (error)
    return <p className="text-sm text-red-600 mt-10 text-center">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold text-black mb-2">
        Compare Vehicles
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Select up to {MAX_COMPARE} vehicles to compare side by side.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {vehicles.map((vehicle) => {
          const active = selectedIds.includes(vehicle.id);
          return (
            <ToggleButton
              key={vehicle.id}
              active={active}
              disabled={!active && selectedIds.length >= MAX_COMPARE}
              onClick={() => toggleVehicle(vehicle.id)}
            >
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </ToggleButton>
          );
        })}
      </div>

      {selectedVehicles.length === 0 ? (
        <p className="text-sm text-gray-500">
          No vehicles selected yet — pick some above to compare.
        </p>
      ) : (
        <div className="border border-black rounded-2xl shadow-sm p-5 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <td className="py-3 pr-4"></td>
                {selectedVehicles.map((vehicle) => (
                  <td
                    key={vehicle.id}
                    className="py-3 px-4 font-semibold text-black whitespace-nowrap"
                  >
                    {vehicle.brand} {vehicle.model}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              <SpecRow
                label="Year"
                vehicles={selectedVehicles}
                render={(v) => v.year}
              />
              <SpecRow
                label="Condition"
                vehicles={selectedVehicles}
                render={(v) => v.condition}
              />
              <SpecRow
                label="Price"
                vehicles={selectedVehicles}
                render={(v) => `$${v.price.toLocaleString()}`}
              />
              <SpecRow
                label="Range"
                vehicles={selectedVehicles}
                render={(v) => `${v.range} km`}
              />
              <SpecRow
                label="Mileage"
                vehicles={selectedVehicles}
                render={(v) =>
                  v.mileage != null ? `${v.mileage.toLocaleString()} km` : "New"
                }
              />
              <SpecRow
                label="Available Colors"
                vehicles={selectedVehicles}
                render={(v) => v.availableColors?.join(", ") || "—"}
              />
              <SpecRow
                label="Stock"
                vehicles={selectedVehicles}
                render={(v) =>
                  v.quantity > 0 ? `${v.quantity} in stock` : "Out of stock"
                }
              />
              <SpecRow
                label="Rating"
                vehicles={selectedVehicles}
                render={(v) => {
                  const rating = ratings[v.id];
                  if (rating === undefined) return "Loading...";
                  if (!rating || rating.reviewCount === 0)
                    return "No reviews yet";
                  return `★ ${rating.averageRating.toFixed(1)} (${rating.reviewCount})`;
                }}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompareVehicles;
