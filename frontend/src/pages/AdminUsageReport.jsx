import { useState, useEffect } from "react";
import { apiRequest } from "../api/client";

const StatCard = ({ label, value }) => (
  <div className="border border-black rounded-2xl shadow-sm p-4 flex flex-col gap-1">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-2xl font-semibold text-black">{value}</span>
  </div>
);

const RankingList = ({ title, entries, metricLabel, metricKey, extra }) => (
  <div className="border border-black rounded-2xl shadow-sm p-5">
    <h3 className="text-sm font-semibold text-black mb-3">{title}</h3>
    {entries.length === 0 ? (
      <p className="text-sm text-gray-500">No data yet.</p>
    ) : (
      <div className="flex flex-col gap-2">
        {entries.map((entry) => (
          <div
            key={entry.vehicle.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-black">
              {entry.vehicle.brand} {entry.vehicle.model} ({entry.vehicle.year})
              {extra && (
                <span className="text-gray-500"> · {extra(entry)}</span>
              )}
            </span>
            <span className="text-gray-700 font-medium">
              {entry[metricKey]} {metricLabel}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AdminUsageReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/analytics/usage")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p className="text-sm text-gray-500 mt-10 text-center">Loading...</p>
    );
  if (error)
    return <p className="text-sm text-red-600 mt-10 text-center">{error}</p>;
  if (!data) return null;

  const { overview, popularVehicles, recentRegistrations, generatedAt } = data;

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-black">
          Application Usage Report
        </h1>
        <p className="text-sm text-gray-500">
          Generated {new Date(generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={overview.totalUsers} />
        <StatCard label="Customers" value={overview.totalCustomers} />
        <StatCard label="Active Vehicles" value={overview.activeVehicles} />
        <StatCard label="Carts Created" value={overview.cartsCreated} />
        <StatCard
          label="Vehicles in Carts"
          value={overview.vehiclesCurrentlyInCarts}
        />
        <StatCard label="Wishlist Saves" value={overview.wishlistSaves} />
        <StatCard label="Reviews Submitted" value={overview.reviewsSubmitted} />
        <StatCard label="Orders Placed" value={overview.ordersPlaced} />
        <StatCard label="Completed Orders" value={overview.completedOrders} />
        <StatCard label="Vehicles Sold" value={overview.vehiclesSold} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-black mb-3">
          Popular Vehicles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <RankingList
            title="Most Wishlisted"
            entries={popularVehicles.mostWishlistedVehicles}
            metricKey="wishlistCount"
            metricLabel="saves"
          />
          <RankingList
            title="Most Reviewed"
            entries={popularVehicles.mostReviewedVehicles}
            metricKey="reviewCount"
            metricLabel="reviews"
            extra={(entry) => `★ ${entry.averageRating}`}
          />
          <RankingList
            title="Most Added to Cart"
            entries={popularVehicles.mostAddedToCartVehicles}
            metricKey="quantityInCarts"
            metricLabel="in carts"
          />
          <RankingList
            title="Most Purchased"
            entries={popularVehicles.mostPurchasedVehicles}
            metricKey="quantityPurchased"
            metricLabel="purchased"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-black mb-3">
          Recent Registrations
        </h2>
        <div className="border border-black rounded-2xl shadow-sm p-5 flex flex-col gap-2">
          {recentRegistrations.length === 0 ? (
            <p className="text-sm text-gray-500">No users yet.</p>
          ) : (
            recentRegistrations.map((user) => (
              <div key={user.id} className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-black">{user.name}</span>
                <span className="text-gray-500">{user.role}</span>
                <span className="text-gray-400 text-right">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsageReport;
