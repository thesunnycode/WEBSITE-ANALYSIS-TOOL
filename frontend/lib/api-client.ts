import { API_BASE_URL } from "./config";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function client(
  endpoint: string,
  { token, ...customConfig }: FetchOptions = {}
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    credentials: "include",
  };

  try {
    // Construct the full URL
    const url = `${API_BASE_URL}${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;
    console.log("Making request to:", url);
    console.log("Request config:", {
      method: config.method,
      headers: config.headers,
      body: config.body,
    });

    const response = await fetch(url, config);
    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error response:", errorData);
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Response data:", data);
      return data;
    }

    return response;
  } catch (error) {
    console.error("API Client Error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

export { client };
