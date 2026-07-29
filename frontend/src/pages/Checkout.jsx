import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";

const Checkout = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [orderResult, setOrderResult] = useState(null);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    apiRequest("/cart")
      .then((data) => setItems(data.items || []))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.vehicle.price * item.quantity,
    0,
  );

  // check if the card info has the right format
  const validateForm = () => {
    if (cardholderName.trim().length < 2) return "Cardholder name is required";
    if (!/^\d{16}$/.test(cardNumber))
      return "Card number must be exactly 16 digits";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate))
      return "Expiry date must be in MM/YY format";
    if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3 or 4 digits";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const data = await apiRequest("/checkout", {
        method: "POST",
        body: JSON.stringify({ cardholderName, cardNumber, expiryDate, cvv }),
      });
      setOrderResult(data.order);
    } catch (err) {
      // a declined mock payment gets its own full screen; any other failure
      // (bad input, empty cart, etc.) stays as an inline error on the form
      if (err.message === "Credit Card Authorization Failed") {
        setDeclined(true);
      } else {
        setFormError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <p className="text-sm text-gray-500 mt-10 text-center">Loading...</p>
    );
  if (loadError)
    return (
      <p className="text-sm text-red-600 mt-10 text-center">{loadError}</p>
    );

  // payment declined by the mock payment service
  if (declined) {
    return (
      <div className="max-w-md mx-auto mt-20 px-6">
        <div className="border border-black rounded-2xl shadow-lg p-8 text-center flex flex-col gap-3">
          <h1 className="text-xl font-semibold text-black">
            Credit Card Authorization Failed
          </h1>
          <p className="text-sm text-gray-500">
            Your payment could not be processed. Your cart has not been changed.
          </p>
          <button
            onClick={() => setDeclined(false)}
            className="bg-black text-white rounded-lg py-2 text-sm hover:opacity-80 mt-3"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // order placed successfully
  if (orderResult) {
    return (
      <div className="max-w-md mx-auto mt-20 px-6">
        <div className="border border-black rounded-2xl shadow-lg p-8 text-center flex flex-col gap-3">
          <h1 className="text-xl font-semibold text-black">
            Order Successfully Completed
          </h1>
          <p className="text-sm text-gray-500">Order #{orderResult.id}</p>
          <p className="text-sm text-gray-700">
            Total: ${orderResult.totalPrice.toLocaleString()}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="bg-black text-white rounded-lg py-2 text-sm hover:opacity-80 mt-3"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 px-6 text-center">
        <p className="text-sm text-gray-500 mb-4">Your cart is empty.</p>
        <Link to="/" className="text-sm text-black underline">
          Browse Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold text-black mb-6">Checkout</h1>

      <div className="flex gap-8 items-start">
        {/* Order summary */}
        <div className="w-1/2 border border-black rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span className="font-medium text-black">
                  {item.vehicle.brand} {item.vehicle.model}
                </span>
                <span className="text-gray-500 block">
                  {item.selectedColor} · {item.selectedInteriorColor}
                </span>
              </div>
              <span className="text-gray-700">
                ${item.vehicle.price.toLocaleString()}
              </span>
            </div>
          ))}

          <div className="border-t border-gray-300 pt-3 flex items-center justify-between">
            <span className="font-medium text-black">Total</span>
            <span className="font-medium text-black">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card form */}
        <div className="w-1/2 border border-black rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-black mb-1">
            Payment Details
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            This is a mock payment. No real card is charged.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Cardholder Name</label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="w-full border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, ""))
                }
                maxLength={16}
                placeholder="4111111111111111"
                className="w-full border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <label className="text-sm text-gray-700">Expiry (MM/YY)</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="12/28"
                  maxLength={5}
                  className="w-full min-w-0 border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <label className="text-sm text-gray-700">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  maxLength={4}
                  className="w-full min-w-0 border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-black text-white rounded-lg py-2 text-sm hover:opacity-80 disabled:opacity-40"
            >
              {submitting ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
