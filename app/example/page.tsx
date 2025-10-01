"use client";
import React, { useState, useEffect } from "react";
import { MAIN_API_SERVER } from "@/lib/api/config";
import { ApiService } from "@/lib/api/service";

// Types for your data
interface Timezone {
  id: string;
  name: string;
  offset: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface CreateUserData {
  name: string;
  email: string;
}

const ApiExamplePage: React.FC = () => {
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data for creating user
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: "",
    email: "",
  });

  // Load timezones on component mount
  useEffect(() => {
    loadTimezones();
  }, []);

  const loadTimezones = async () => {
    try {
      setLoading(true);
      setError(null);

      // GET request example
      const response = await ApiService.makeGet<Timezone[]>("/api/timezones");
      setTimezones(response);

      console.log("Timezones loaded:", response);
    } catch (err: any) {
      setError(`Failed to load timezones: ${err.message}`);
      console.error("Timezone error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // GET request with query parameters
      const response = await ApiService.makeGet<User[]>("/users", {
        page: 1,
        limit: 10,
        sort: "created_at",
      });
      setUsers(response);

      console.log("Users loaded:", response);
    } catch (err: any) {
      setError(`Failed to load users: ${err.message}`);
      console.error("Users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // POST request example
      const response = await ApiService.makePost<User>("/users", newUser);

      // Add new user to the list
      setUsers((prev) => [...prev, response]);

      // Clear form
      setNewUser({ name: "", email: "" });

      console.log("User created:", response);
    } catch (err: any) {
      setError(`Failed to create user: ${err.message}`);
      console.error("Create user error:", err);
    } finally {
      setLoading(false);
    }
  };

  const testRawFetch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Your working raw fetch example
      const myHeaders = new Headers();
      myHeaders.append(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      );

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow" as RequestRedirect,
      };

      const response = await fetch(
        "https://audc-next-server.vercel.app/api/timezones",
        requestOptions
      );
      const result = await response.text();

      console.log("Raw fetch result:", result);
      setError(`Raw fetch success: ${result.substring(0, 100)}...`);
    } catch (err: any) {
      setError(`Raw fetch failed: ${err.message}`);
      console.error("Raw fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">API Service Example</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      )}

      {/* Timezones Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Timezones</h2>
          <button
            onClick={loadTimezones}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Load Timezones
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timezones.map((timezone) => (
            <div key={timezone.id} className="p-3 border rounded">
              <h3 className="font-medium">{timezone.name}</h3>
              <p className="text-gray-600">{timezone.offset}</p>
            </div>
          ))}
        </div>

        {timezones.length === 0 && !loading && (
          <p className="text-gray-500">No timezones loaded yet.</p>
        )}
      </div>

      {/* Users Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Users</h2>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Load Users
          </button>
        </div>

        {/* Create User Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-medium mb-3">Create New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, name: e.target.value }))
              }
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, email: e.target.value }))
              }
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={createUser}
            disabled={loading}
            className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Create User
          </button>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="p-3 border rounded">
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-400">
                Created: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <p className="text-gray-500">No users loaded yet.</p>
        )}
      </div>

      {/* Raw Fetch Test */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Raw Fetch Test</h2>
          <button
            onClick={testRawFetch}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            Test Raw Fetch
          </button>
        </div>
        <p className="text-gray-600">
          This button tests the exact fetch call you provided to compare with
          the ApiService.
        </p>
      </div>

      {/* Usage Examples */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Code Examples</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">GET Request:</h3>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
              {`// Simple GET
const timezones = await ApiService.makeGet<Timezone[]>('api/timezones');

// GET with query parameters
const users = await ApiService.makeGet<User[]>('/users', {
  page: 1,
  limit: 10,
  sort: 'created_at'
});`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">POST Request:</h3>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
              {`// POST with data
const newUser = await ApiService.makePost<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiExamplePage;
