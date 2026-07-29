import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";

const formatMoney = (value) => {
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const LoanCalculator = () => {
  const [searchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [vehicleId, setVehicleId] = useState(
    () => searchParams.get("vehicleId") ?? "",
  );
  const [downPayment, setDownPayment] = useState("");
  const [annualInterestRate, setAnnualInterestRate] = useState("");
  const [loanTermMonths, setLoanTermMonths] = useState("60");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState(null);

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === Number(vehicleId),
  );

  useEffect(() => {
    apiRequest("/vehicles")
      .then(setVehicles)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoadingVehicles(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setResult(null);

    if (!vehicleId) {
      setFormError("Please select a vehicle");
      return;
    }

    if (selectedVehicle && Number(downPayment) > selectedVehicle.price) {
      setFormError("Down payment cannot exceed vehicle price");
      return;
    }

    setSubmitting(true);

    try {
      const data = await apiRequest("/loan-calculator", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: parseInt(vehicleId),
          downPayment: Number(downPayment),
          annualInterestRate: Number(annualInterestRate),
          loanTermMonths: parseInt(loanTermMonths),
        }),
      });
      setResult(data);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingVehicles)
    return (
      <p className="text-sm text-gray-500 mt-10 text-center">Loading...</p>
    );
  if (loadError)
    return (
      <p className="text-sm text-red-600 mt-10 text-center">{loadError}</p>
    );

  return (
    <div className="max-w-xl mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold text-black mb-6">
        Loan Calculator
      </h1>

      <div className="border border-black rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="vehicleId" className="text-sm text-gray-700">
              Vehicle
            </label>
            <select
              id="vehicleId"
              value={vehicleId}
              onChange={(e) => {
                setVehicleId(e.target.value);
                setDownPayment(""); // reset down payment when vehicle changes
                setResult(null); // reset result when vehicle changes
                setFormError(""); // reset form error when vehicle changes
              }}
              required
              className="border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.year}) — {formatMoney(v.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="downPayment" className="text-sm text-gray-700">
              Down Payment ($)
            </label>
            <input
              id="downPayment"
              type="number"
              min="0"
              step="0.01"
              value={downPayment}
              onChange={(e) => {
                setDownPayment(e.target.value);
                setResult(null); // reset result when down payment changes
                setFormError(""); // reset form error when down payment changes
              }}
              required
              className="border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="interestRate" className="text-sm text-gray-700">
              Annual Interest Rate (%)
            </label>
            <input
              id="interestRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={annualInterestRate}
              onChange={(e) => {
                setAnnualInterestRate(e.target.value);
                setResult(null); // reset result when interest rate changes
                setFormError(""); // reset form error when interest rate changes
              }}
              required
              className="border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="loanTermMonths" className="text-sm text-gray-700">
              Loan Term (months)
            </label>
            <select
              id="loanTermMonths"
              value={loanTermMonths}
              onChange={(e) => {
                setLoanTermMonths(e.target.value);
                setResult(null);
                setFormError("");
              }}
              required
              className="border border-black rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            >
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="48">48 months</option>
              <option value="60">60 months</option>
              <option value="72">72 months</option>
              <option value="84">84 months</option>
            </select>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white rounded-lg py-2 text-sm hover:opacity-80 disabled:opacity-40"
          >
            {submitting ? "Calculating..." : "Calculate"}
          </button>
        </form>
      </div>

      {result && (
        <div className="border border-black rounded-2xl shadow-sm p-6 mt-6 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-black mb-2">
            {result.vehicle.brand} {result.vehicle.model} ({result.vehicle.year}
            )
          </h2>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Vehicle Price</span>
            <span className="font-medium text-black">
              {formatMoney(result.vehiclePrice)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Down Payment</span>
            <span className="font-medium text-black">
              {formatMoney(result.downPayment)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Interest Rate</span>
            <span className="font-medium text-black">
              {result.annualInterestRate}%
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Loan Term</span>
            <span className="font-medium text-black">
              {result.loanTermMonths} months
            </span>
          </div>

          <hr className="my-2 border-gray-300" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Principal</span>
            <span className="font-medium text-black">
              {formatMoney(result.principal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Monthly Payment</span>
            <span className="font-medium text-black">
              {formatMoney(result.monthlyPayment)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Total Payment</span>
            <span className="font-medium text-black">
              {formatMoney(result.totalPayment)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Total Interest</span>
            <span className="font-medium text-black">
              {formatMoney(result.totalInterest)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanCalculator;
