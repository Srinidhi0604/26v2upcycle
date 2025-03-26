// Import only what we need to reduce bundle size
import { QueryClient, QueryFunction, QueryKey } from "@tanstack/react-query";

// Get API URL from environment variable or use Netlify functions path
const API_URL = '/.netlify/functions';

// Simple utility to handle API responses
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Simplified API request function
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Handle both Netlify function calls and regular API calls
  const fullUrl = url.startsWith('/.netlify/functions') 
    ? url 
    : `${API_URL}${url}`;
  
  console.log('Making API request to:', fullUrl); // Debug log
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Minimal type definition for behavior on 401 responses
type UnauthorizedBehavior = "returnNull" | "throw";

// Optimized query function factory with minimal closure size
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> = (options) => {
  return async ({ queryKey }: { queryKey: QueryKey }) => {
    const url = queryKey[0] as string;
    // Handle both Netlify function calls and regular API calls
    const fullUrl = url.startsWith('/.netlify/functions') 
      ? url 
      : `${API_URL}${url}`;
    
    console.log('Making query to:', fullUrl); // Debug log
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
};

// Create an optimized query client with minimal default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 300000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
