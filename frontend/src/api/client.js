const API_URL = import.meta.env.VITE_API_URL;

// Helper function for sending HTTP requests.
export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};
