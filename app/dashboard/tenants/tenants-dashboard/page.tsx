"use client";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// TypeScript interface for tenant data
interface Tenant {
  id: string;
  name: string;
  access_code: string;
  server_id: string;
  product_id: string;
  is_active: boolean;
  created_at: string;
  sub_domain: string | null;
  settings_id: string | null;
  schema: string | null;
  status: string;
  updated_at: string;
  time_zone: string;
  business_reg_number: string | null;
  schema_created: boolean;
}

interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  tenantsWithDomain: number;
  tenantsWithSchema: number;
  tenantsByStatus: { [key: string]: number };
  tenantsByTimeZone: { [key: string]: number };
  recentlyCreated: number;
  monthlyGrowth: { [key: string]: number };
  serverDistribution: { [key: string]: number };
}

export default function AllTenantsAnalytics() {
  const router = useRouter();

  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAllTenants();
  }, []);

  const fetchAllTenants = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .schema("shared")
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAllTenants(data || []);
      if (data) {
        calculateStats(data);
      }
    } catch (err) {
      setError("Failed to load tenants data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tenants: Tenant[]) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const tenantStats: TenantStats = {
      totalTenants: tenants.length,
      activeTenants: tenants.filter((t) => t.status === "active").length,
      inactiveTenants: tenants.filter((t) => !t.is_active).length,
      tenantsWithDomain: tenants.filter((t) => t.sub_domain).length,
      tenantsWithSchema: tenants.filter((t) => t.schema_created).length,
      tenantsByStatus: {},
      tenantsByTimeZone: {},
      serverDistribution: {},
      recentlyCreated: tenants.filter(
        (t) => new Date(t.created_at) > thirtyDaysAgo
      ).length,
      monthlyGrowth: {},
    };

    // Group by status
    tenants.forEach((tenant) => {
      const status =
        tenant.status || (tenant.is_active ? "active" : "inactive");
      tenantStats.tenantsByStatus[status] =
        (tenantStats.tenantsByStatus[status] || 0) + 1;
    });

    // Group by timezone
    tenants.forEach((tenant) => {
      const tz = tenant.time_zone || "UTC";
      tenantStats.tenantsByTimeZone[tz] =
        (tenantStats.tenantsByTimeZone[tz] || 0) + 1;
    });

    // Group by server
    tenants.forEach((tenant) => {
      const serverId = tenant.server_id.substring(0, 8) + "...";
      tenantStats.serverDistribution[serverId] =
        (tenantStats.serverDistribution[serverId] || 0) + 1;
    });

    // Calculate monthly growth for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      tenantStats.monthlyGrowth[monthKey] = tenants.filter((tenant) => {
        const createdAt = new Date(tenant.created_at);
        return createdAt >= date && createdAt < nextMonth;
      }).length;
    }

    setStats(tenantStats);
  };

  // Generate growth chart data
  const getGrowthData = () => {
    if (!stats) return null;

    const labels = Object.keys(stats.monthlyGrowth);
    const data = Object.values(stats.monthlyGrowth);

    return {
      labels,
      datasets: [
        {
          label: "New Tenants",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
        },
      ],
    };
  };

  // Generate status distribution data
  const getStatusDistributionData = () => {
    if (!stats) return null;

    const labels = Object.keys(stats.tenantsByStatus);
    const data = Object.values(stats.tenantsByStatus);

    const colors = [
      "rgba(75, 192, 192, 0.8)",
      "rgba(255, 99, 132, 0.8)",
      "rgba(255, 205, 86, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(153, 102, 255, 0.8)",
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors
            .slice(0, labels.length)
            .map((color) => color.replace("0.8", "1")),
          borderWidth: 2,
        },
      ],
    };
  };

  // Generate timezone distribution data
  const getTimezoneData = () => {
    if (!stats) return null;

    const sortedTimezones = Object.entries(stats.tenantsByTimeZone)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 timezones

    return {
      labels: sortedTimezones.map(([tz]) => tz),
      datasets: [
        {
          label: "Tenants",
          data: sortedTimezones.map(([, count]) => count),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Generate server distribution data
  const getServerDistributionData = () => {
    if (!stats) return null;

    const labels = Object.keys(stats.serverDistribution);
    const data = Object.values(stats.serverDistribution);

    return {
      labels,
      datasets: [
        {
          label: "Tenants per Server",
          data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Filter tenants based on search and status
  const filteredTenants = allTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.access_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.sub_domain &&
        tenant.sub_domain.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && tenant.is_active) ||
      (statusFilter === "inactive" && !tenant.is_active) ||
      tenant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading all tenants data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  const growthData = getGrowthData();
  const statusData = getStatusDistributionData();
  const timezoneData = getTimezoneData();
  const serverData = getServerDistributionData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            All Tenants Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive overview of all tenants in the system
          </p>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Total Tenants</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats?.totalTenants.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">All registered</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">
              Active Tenants
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.activeTenants.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {stats
                ? ((stats.activeTenants / stats.totalTenants) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">With Domains</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats?.tenantsWithDomain.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {stats
                ? (
                    (stats.tenantsWithDomain / stats.totalTenants) *
                    100
                  ).toFixed(1)
                : 0}
              % configured
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Schema Ready</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {stats?.tenantsWithSchema.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {stats
                ? (
                    (stats.tenantsWithSchema / stats.totalTenants) *
                    100
                  ).toFixed(1)
                : 0}
              % ready
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Signups
            </h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats?.recentlyCreated.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Growth Chart */}
          {growthData && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Monthly Growth Trend
              </h2>
              <Line
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: "New Tenant Registrations (Last 12 Months)",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
                data={growthData}
              />
            </div>
          )}

          {/* Status Distribution */}
          {statusData && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Status Distribution
              </h2>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom" as const,
                      },
                    },
                  }}
                  data={statusData}
                />
              </div>
            </div>
          )}
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Timezone Distribution */}
          {timezoneData && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Top Timezones</h2>
              <Bar
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: "Tenants by Timezone (Top 10)",
                    },
                  },
                  indexAxis: "y" as const,
                }}
                data={timezoneData}
              />
            </div>
          )}

          {/* Server Distribution */}
          {serverData && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Server Distribution
              </h2>
              <Bar
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: "Tenants per Server",
                    },
                  },
                }}
                data={serverData}
              />
            </div>
          )}
        </div>

        {/* Tenants List Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold">
              All Tenants ({filteredTenants.length})
            </h2>

            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                {stats &&
                  Object.keys(stats.tenantsByStatus).map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schema
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timezone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tenant.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tenant.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tenant.access_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            tenant.is_active ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        {tenant.status ||
                          (tenant.is_active ? "Active" : "Inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.sub_domain ? (
                        <a
                          href={`https://${tenant.sub_domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 underline"
                        >
                          {tenant.sub_domain}
                        </a>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.schema_created
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {tenant.schema_created ? "Ready" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.time_zone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tenant.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/tenants/${tenant.id}`)
                        }
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(tenant.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Copy ID"
                      >
                        Copy ID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTenants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No tenants found matching your criteria.
              </p>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configuration Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  With Business Registration
                </span>
                <span className="font-semibold">
                  {allTenants.filter((t) => t.business_reg_number).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unique Timezones</span>
                <span className="font-semibold">
                  {stats ? Object.keys(stats.tenantsByTimeZone).length : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Growth Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Average per Month</span>
                <span className="font-semibold">
                  {stats
                    ? Math.round(
                        Object.values(stats.monthlyGrowth).reduce(
                          (a, b) => a + b,
                          0
                        ) / 12
                      )
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Month</span>
                <span className="font-semibold">
                  {stats ? Math.max(...Object.values(stats.monthlyGrowth)) : 0}{" "}
                  tenants
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth Rate</span>
                <span className="font-semibold text-green-600">
                  {stats?.recentlyCreated && stats.totalTenants
                    ? `+${((stats.recentlyCreated / (stats.totalTenants - stats.recentlyCreated)) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Rate</span>
                <span className="font-semibold text-green-600">
                  {stats
                    ? (
                        (stats.activeTenants / stats.totalTenants) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Schema Completion</span>
                <span className="font-semibold text-blue-600">
                  {stats
                    ? (
                        (stats.tenantsWithSchema / stats.totalTenants) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Domain Setup</span>
                <span className="font-semibold text-purple-600">
                  {stats
                    ? (
                        (stats.tenantsWithDomain / stats.totalTenants) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
