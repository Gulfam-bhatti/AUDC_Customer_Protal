import { api_bearer_token } from "@/config/constants";
import { MAIN_API_SERVER } from "./config";

// Simple client-side API service helper
export class ApiService {
  private static baseUrl = MAIN_API_SERVER;

  private static async prepareHeaders(): Promise<Headers> {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");

    const token = await api_bearer_token();
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Make GET request
   */
  static async makeGet<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    const headers = await ApiService.prepareHeaders();

    const url = new URL(endpoint, ApiService.baseUrl);
    console.log("Making GET request to:", url.toString());

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    // console.log('response', (await response.body?.getReader().read() ));
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Make POST request
   */
  static async makePost<T = any>(endpoint: string, data?: any): Promise<T> {
    const headers = await ApiService.prepareHeaders();

    const url = new URL(endpoint, ApiService.baseUrl);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Set custom headers - Note: this won't persist across requests since headers are recreated each time
   */
  static setHeader(key: string, value: string): void {
    // This method is now mainly for demonstration - headers are created fresh each request
    console.warn(
      "Headers are recreated for each request. Consider adding persistent header storage if needed."
    );
  }

  /**
   * Remove header - Note: this won't persist across requests since headers are recreated each time
   */
  static removeHeader(key: string): void {
    // This method is now mainly for demonstration - headers are created fresh each request
    console.warn(
      "Headers are recreated for each request. Consider adding persistent header storage if needed."
    );
  }

  /**
   * Clear all custom headers - Note: this won't persist across requests since headers are recreated each time
   */
  static clearHeaders(): void {
    // This method is now mainly for demonstration - headers are created fresh each request
    console.warn(
      "Headers are recreated for each request. Consider adding persistent header storage if needed."
    );
  }
}

// Usage examples:
/*
// GET request
const users = await ApiService.makeGet<User[]>('/users');

// GET with params
const filteredUsers = await ApiService.makeGet<User[]>('/users', { 
  page: 1, 
  limit: 10 
});

// POST request
const newUser = await ApiService.makePost<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Set custom header
ApiService.setHeader('X-Custom-Header', 'value');

// Remove header
ApiService.removeHeader('X-Custom-Header');
*/
