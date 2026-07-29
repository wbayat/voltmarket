import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

const formatMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/checkout/orders")
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p className="text-sm text-gray-500 mt-10 text-center">Loading...</p>
    );
  if (error)
    return <p className="text-sm text-red-600 mt-10 text-center">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold text-black mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">
          You haven't placed any orders yet.{" "}
          <Link to="/" className="text-black underline">
            Browse vehicles
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-black rounded-2xl shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black">
                  Order #{order.id}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>

              <span className="text-sm capitalize w-fit px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {order.status}
              </span>

              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-medium text-black">
                        {item.vehicle.brand} {item.vehicle.model}
                      </span>
                      <span className="text-gray-500 block">
                        Qty {item.quantity}
                        {item.selectedColor && ` · ${item.selectedColor}`}
                        {item.selectedInteriorColor &&
                          ` · ${item.selectedInteriorColor}`}
                      </span>
                    </div>
                    <span className="text-gray-700">
                      {formatMoney(
                        Number(item.priceAtPurchase) * Number(item.quantity),
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-3 flex items-center justify-between">
                <span className="font-medium text-black">Total</span>
                <span className="font-medium text-black">
                  {formatMoney(order.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
