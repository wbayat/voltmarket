// this variable keeps track of which payments to approve
let attemptCount = 0;

export const processPayment = () => {
  attemptCount++;

  const isDenied = attemptCount % 3 === 0;

  return {
    approved: !isDenied,
    message: isDenied
      ? "Credit Card Authorization Failed"
      : "Order Successfully Completed",
  };
};
