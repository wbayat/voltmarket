import { useState, useEffect, useMemo } from "react";
import { apiRequest } from "../api/client";
import VehicleCard from "../components/VehicleCard";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price-desc", label: "Price - High to Low" },
  { value: "price-asc", label: "Price - Low to High" },
  { value: "range-desc", label: "Range - High to Low" },
  { value: "range-asc", label: "Range - Low to High" },
  { value: "year-desc", label: "Year - Newest First" },
  { value: "year-asc", label: "Year - Oldest First" },
];

const ToggleButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`text-sm rounded-full border border-black px-3 py-1 transition-colors ${
      active ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlistIds, setWishlistIds] = useState(new Set());

  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState(new Set());
  const [selectedConditions, setSelectedConditions] = useState(
    new Set(["NEW", "USED"]),
  );
  const [hotDealsOnly, setHotDealsOnly] = useState(false);
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    apiRequest("/vehicles")
      .then((data) => setVehicles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // if the user isn't logged in, this fails
    apiRequest("/wishlist")
      .then((data) =>
        setWishlistIds(new Set(data.map((item) => item.vehicle.id))),
      )
      .catch(() => setWishlistIds(new Set()));
  }, []);

  const handleToggleWishlist = async (vehicleId, isCurrentlyWishlisted) => {
    if (isCurrentlyWishlisted) {
      await apiRequest(`/wishlist/${vehicleId}`, { method: "DELETE" });
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(vehicleId);
        return next;
      });
    } else {
      await apiRequest("/wishlist", {
        method: "POST",
        body: JSON.stringify({ vehicleId }),
      });
      setWishlistIds((prev) => new Set(prev).add(vehicleId));
    }
  };

  const brands = useMemo(
    () => [...new Set(vehicles.map((v) => v.brand))].sort(),
    [vehicles],
  );
  const colors = useMemo(
    () => [...new Set(vehicles.map((v) => v.color))].sort(),
    [vehicles],
  );

  const toggleValue = (set, setter, value) => {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setter(next);
  };

  // condition must always have at least one option selected — if a click
  // would empty the set, both NEW and USED are turned back on instead
  const toggleCondition = (value) => {
    const next = new Set(selectedConditions);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }

    if (next.size === 0) {
      setSelectedConditions(new Set(["NEW", "USED"]));
    } else {
      setSelectedConditions(next);
    }
  };

  const displayedVehicles = useMemo(() => {
    let result = vehicles.filter((v) => {
      if (selectedBrands.size > 0 && !selectedBrands.has(v.brand)) return false;
      if (selectedColors.size > 0 && !selectedColors.has(v.color)) return false;
      if (!selectedConditions.has(v.condition)) return false;
      if (hotDealsOnly && !v.isHotDeal) return false;
      return true;
    });

    if (sortOption) {
      const [field, direction] = sortOption.split("-");
      result = [...result].sort((a, b) => {
        const diff = a[field] - b[field];
        return direction === "asc" ? diff : -diff;
      });
    }

    return result;
  }, [
    vehicles,
    selectedBrands,
    selectedColors,
    selectedConditions,
    hotDealsOnly,
    sortOption,
  ]);

  return (
    <div className="max-w-6xl mx-auto mt-10 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-black">Browse Vehicles</h1>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="w-56 shrink-0 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-semibold text-black mb-2">Brand</h2>
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <ToggleButton
                  key={brand}
                  active={selectedBrands.has(brand)}
                  onClick={() =>
                    toggleValue(selectedBrands, setSelectedBrands, brand)
                  }
                >
                  {brand}
                </ToggleButton>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-black mb-2">Color</h2>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <ToggleButton
                  key={color}
                  active={selectedColors.has(color)}
                  onClick={() =>
                    toggleValue(selectedColors, setSelectedColors, color)
                  }
                >
                  {color}
                </ToggleButton>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-black mb-2">Condition</h2>
            <div className="flex flex-wrap gap-2">
              <ToggleButton
                active={selectedConditions.has("NEW")}
                onClick={() => toggleCondition("NEW")}
              >
                New
              </ToggleButton>
              <ToggleButton
                active={selectedConditions.has("USED")}
                onClick={() => toggleCondition("USED")}
              >
                Used
              </ToggleButton>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-black mb-2">Deals</h2>
            <ToggleButton
              active={hotDealsOnly}
              onClick={() => setHotDealsOnly(!hotDealsOnly)}
            >
              Hot Deals Only
            </ToggleButton>
          </div>
        </aside>

        {/* Vehicle grid */}
        <div className="flex-1">
          {loading && (
            <p className="text-sm text-gray-500">Loading vehicles...</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && displayedVehicles.length === 0 && (
            <p className="text-sm text-gray-500">
              No vehicles match your filters.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                wishlisted={wishlistIds.has(vehicle.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleList;
