import { useState, useEffect } from "react";
import { apiRequest } from "../api/client";

// a smiple component to show a summary of sales (no need for a seperate file yet)
const StatCard = ({ label, value }) => (
  <div className="border border-black rounded-2xl shadow-sm p-4 flex flex-col gap-1">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-2xl font-semibold text-black">{value}</span>
  </div>
);

// fetch the data from backend
const AdminSalesReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicleIdFilter, setVehicleIdFilter] = useState("");

  const loadReport = (vehicleId) => {
    setLoading(true);
    setError("");

    const path = vehicleId
      ? `/analytics/sales?vehicleId=${vehicleId}`
      : "/analytics/sales";

    apiRequest(path)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadReport(vehicleIdFilter || undefined);
  };

  const handleClearFilter = () => {
    setVehicleIdFilter("");
    loadReport();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-black">
          Vehicle Sales Report
        </h1>
        {data && (
          <p className="text-sm text-gray-500">
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>
        )}
      </div>
      {/* This from is kindof broken. */}
      {/* <form onSubmit={handleFilterSubmit} className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Filter by Vehicle ID</label>
          <input
            type="number"
            value={vehicleIdFilter}
            onChange={(e) => setVehicleIdFilter(e.target.value)}
            className="border border-black rounded-lg px-3 py-2 text-sm w-32 outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          className="bg-black text-white rounded-lg px-4 py-2 text-sm hover:opacity-80"
        >
          Apply
        </button>
        {vehicleIdFilter && (
          <button
            type="button"
            onClick={handleClearFilter}
            className="text-sm text-gray-500 hover:text-black"
          >
            Clear
          </button>
        )}
      </form> */}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Orders Counted" value={data.ordersCounted} />
            <StatCard label="Units Sold" value={data.totalUnitsSold} />
            <StatCard
              label="Total Revenue"
              value={`$${data.totalRevenue.toLocaleString()}`}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black mb-3">
              Sales by Vehicle
            </h2>
            {data.perVehicle.length === 0 ? (
              <p className="text-sm text-gray-500">No completed sales yet.</p>
            ) : (
              <div className="border border-black rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-3 gap-4 px-5 py-3 border-b border-black text-sm font-semibold text-black">
                  <span>Vehicle</span>
                  <span>Units Sold</span>
                  <span>Revenue</span>
                </div>
                {data.perVehicle.map((entry) => (
                  <div
                    key={entry.vehicle.id}
                    className="grid grid-cols-3 gap-4 px-5 py-3 text-sm border-b border-gray-200 last:border-b-0"
                  >
                    <span className="text-black">
                      {entry.vehicle.brand} {entry.vehicle.model} (
                      {entry.vehicle.year})
                    </span>
                    <span className="text-gray-700">{entry.unitsSold}</span>
                    <span className="text-gray-700">
                      ${entry.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSalesReport;
